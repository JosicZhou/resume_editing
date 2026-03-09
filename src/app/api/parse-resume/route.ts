import { NextRequest, NextResponse } from "next/server";
import type { ResumeData, PersonalInfo, Education, WorkExperience, Project, Skill, Award } from "@/lib/types";
import { createEmptyResume, generateId } from "@/lib/types";

async function callChatApi(
  apiUrl: string,
  apiKey: string,
  model: string,
  prompt: string
): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 180000); // 改为 3 分钟

  let res: Response;
  try {
    res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user" as const, content: prompt }],
        temperature: 0.3,
      }),
      signal: controller.signal,
    });
  } catch (e) {
    if ((e as Error).name === "AbortError") {
      throw new Error("请求超时（3分钟），请稍后重试或缩短简历内容。");
    }
    throw e;
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    const err = await res.text();
    if (res.status === 524) {
      throw new Error("请求超时(524)：API 响应过慢，请稍后重试或尝试缩短简历内容后再解析。");
    }
    if (res.status === 504 || (err && /timeout|timed out/i.test(err))) {
      throw new Error("请求超时：API 响应过慢，请稍后重试。");
    }
    const shortErr = err.length > 200 ? err.slice(0, 200) + "…" : err;
    throw new Error(`API 请求失败: ${res.status} ${shortErr}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content ?? data.result?.content ?? data.content;
  if (content == null) throw new Error("API 返回格式异常");
  return typeof content === "string" ? content : String(content);
}

function tryParseResumeJson(text: string): Partial<ResumeData> | null {
  try {
    let cleaned = text.trim();
    // 去掉 markdown 代码块（```json ... ``` 或 ``` ... ```）
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
    const parsed = JSON.parse(cleaned) as Record<string, unknown>;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed as Partial<ResumeData>;
  } catch {
    return null;
  }
}

function normalizeResumeData(parsed: Partial<ResumeData>): ResumeData {
  const empty = createEmptyResume();

  const personal: PersonalInfo = {
    ...empty.personal,
    ...(parsed.personal && typeof parsed.personal === "object"
      ? {
          name: String(parsed.personal.name ?? ""),
          email: String(parsed.personal.email ?? ""),
          phone: String(parsed.personal.phone ?? ""),
          location: String(parsed.personal.location ?? ""),
          linkedin: parsed.personal.linkedin ? String(parsed.personal.linkedin) : undefined,
          github: parsed.personal.github ? String(parsed.personal.github) : undefined,
          website: parsed.personal.website ? String(parsed.personal.website) : undefined,
          summary: parsed.personal.summary ? String(parsed.personal.summary) : undefined,
        }
      : {}),
  };

  const ensureArray = <T>(arr: unknown, fn: (x: unknown) => T): T[] =>
    Array.isArray(arr) ? arr.map(fn).filter(Boolean) : [];

  const education: Education[] = ensureArray(parsed.education, (e) => {
    if (!e || typeof e !== "object") return null as unknown as Education;
    const o = e as Record<string, unknown>;
    return {
      id: String(o.id ?? generateId()),
      school: String(o.school ?? ""),
      degree: String(o.degree ?? ""),
      major: String(o.major ?? ""),
      startDate: String(o.startDate ?? ""),
      endDate: String(o.endDate ?? ""),
      gpa: o.gpa ? String(o.gpa) : undefined,
      highlights: Array.isArray(o.highlights) ? o.highlights.map(String) : [],
      rankTags: Array.isArray(o.rankTags) ? o.rankTags.map(String) : undefined,
    };
  });

  const work: WorkExperience[] = ensureArray(parsed.work, (w) => {
    if (!w || typeof w !== "object") return null as unknown as WorkExperience;
    const o = w as Record<string, unknown>;
    return {
      id: String(o.id ?? generateId()),
      company: String(o.company ?? ""),
      title: String(o.title ?? ""),
      location: String(o.location ?? ""),
      startDate: String(o.startDate ?? ""),
      endDate: String(o.endDate ?? ""),
      descriptions: Array.isArray(o.descriptions) ? o.descriptions.map(String) : [],
      tags: Array.isArray(o.tags) ? o.tags.map(String) : [],
    };
  });

  const projects: Project[] = ensureArray(parsed.projects, (p) => {
    if (!p || typeof p !== "object") return null as unknown as Project;
    const o = p as Record<string, unknown>;
    return {
      id: String(o.id ?? generateId()),
      name: String(o.name ?? ""),
      role: o.role ? String(o.role) : undefined,
      location: o.location ? String(o.location) : undefined,
      startDate: String(o.startDate ?? ""),
      endDate: String(o.endDate ?? ""),
      descriptions: Array.isArray(o.descriptions) ? o.descriptions.map(String) : [],
      techStack: Array.isArray(o.techStack) ? o.techStack.map(String) : [],
      tags: Array.isArray(o.tags) ? o.tags.map(String) : [],
    };
  });

  const skills: Skill[] = ensureArray(parsed.skills, (s) => {
    if (!s || typeof s !== "object") return null as unknown as Skill;
    const o = s as Record<string, unknown>;
    return {
      id: String(o.id ?? generateId()),
      category: String(o.category ?? ""),
      items: Array.isArray(o.items) ? o.items.map(String) : [],
    };
  });

  const awards: Award[] = ensureArray(parsed.awards, (a) => {
    if (!a || typeof a !== "object") return null as unknown as Award;
    const o = a as Record<string, unknown>;
    return {
      id: String(o.id ?? generateId()),
      name: String(o.name ?? ""),
      date: String(o.date ?? ""),
      description: o.description ? String(o.description) : undefined,
    };
  });

  const campus: WorkExperience[] = ensureArray((parsed as any).campus, (c) => {
    if (!c || typeof c !== "object") return null as unknown as WorkExperience;
    const o = c as Record<string, unknown>;
    return {
      id: String(o.id ?? generateId()),
      company: String(o.company ?? o.organization ?? ""),
      title: String(o.title ?? o.role ?? ""),
      location: String(o.location ?? ""),
      startDate: String(o.startDate ?? ""),
      endDate: String(o.endDate ?? ""),
      descriptions: Array.isArray(o.descriptions) ? o.descriptions.map(String) : [],
      tags: Array.isArray(o.tags) ? o.tags.map(String) : [],
    };
  });

  return {
    ...empty,
    personal,
    education,
    work,
    campus,
    projects,
    skills,
    awards,
    customSections: empty.customSections,
    moduleOrder: empty.moduleOrder,
  };
}

const PARSE_PROMPT = `你是一个简历解析助手。请将下面的简历文本解析成 JSON 格式，严格按以下结构输出，不要添加任何说明文字，只输出一个 JSON 对象。

核心原则：所有描述内容必须从简历原文中直接提取，逐条保留原文措辞，不得改写、总结、精简或合并。每一条原文中独立的描述/职责/成果，都应作为数组中一个单独的字符串元素。

结构要求：
{
  "personal": {
    "name": "姓名",
    "email": "邮箱",
    "phone": "电话",
    "location": "所在地",
    "linkedin": "可选",
    "github": "可选",
    "website": "可选",
    "summary": "可选，个人简介",
    "interests": "可选，兴趣爱好"
  },
  "education": [
    {
      "id": "唯一id如edu1",
      "school": "学校名",
      "degree": "学位如本科/硕士",
      "major": "专业",
      "startDate": "开始日期",
      "endDate": "结束日期",
      "gpa": "可选",
      "highlights": ["原文中的每条成就/课程，逐条保留原文"]
    }
  ],
  "work": [
    {
      "id": "唯一id如work1",
      "company": "公司名",
      "title": "职位",
      "location": "地点",
      "startDate": "开始日期",
      "endDate": "结束日期",
      "descriptions": ["原文中的每条工作描述，逐条保留原文，不得合并或总结"],
      "tags": ["从描述中提取的技能关键词"]
    }
  ],
  "campus": [
    {
      "id": "唯一id如campus1",
      "company": "组织/社团/学校名",
      "title": "职位/角色",
      "location": "地点",
      "startDate": "开始日期",
      "endDate": "结束日期",
      "descriptions": ["原文中的每条经历描述，逐条保留原文，不得合并或总结"],
      "tags": ["相关标签"]
    }
  ],
  "projects": [
    {
      "id": "唯一id如proj1",
      "name": "项目名",
      "role": "可选，角色",
      "startDate": "开始日期",
      "endDate": "结束日期",
      "descriptions": ["原文中的每条项目描述，逐条保留原文，不得合并或总结"],
      "techStack": ["技术栈"],
      "tags": ["标签"]
    }
  ],
  "skills": [
    {
      "id": "唯一id如skill1",
      "category": "分类如编程语言",
      "items": ["技能项1", "技能项2"]
    }
  ],
  "awards": [
    {
      "id": "唯一id如award1",
      "name": "奖项名",
      "date": "日期",
      "description": "可选"
    }
  ]
}

注意：
- "work" 数组只包含正式工作和实习经历（有公司名、职位的商业工作）
- "campus" 数组包含校园经历，如学生会、社团、志愿者、校内竞赛组织等
- descriptions 数组中每个元素对应原文中一条独立的描述（通常以"•"、"-"、数字序号开头），原文有几条就输出几条，不要合并
- 如果某部分在简历中不存在，用空数组 [] 或空字符串 ""
- 请只输出 JSON，不要用 markdown 代码块包裹`;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const apiConfigStr = formData.get("apiConfig") as string | null;

    if (!file) {
      return NextResponse.json({ error: "未提供文件" }, { status: 400 });
    }

    let rawText = "";
    try {
      // 调用 Python PDF 提取服务
      const pythonServiceUrl = process.env.PDF_SERVICE_URL || "http://localhost:5001";

      const pdfFormData = new FormData();
      pdfFormData.append("file", file);

      const pdfRes = await fetch(`${pythonServiceUrl}/extract`, {
        method: "POST",
        body: pdfFormData,
      });

      const contentType = pdfRes.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        // 返回 HTML 说明服务正在从休眠唤醒（Render 免费层）
        return NextResponse.json(
          {
            error: "PDF 服务正在启动中，请稍等 30 秒后重试",
            detail: "服务从休眠状态唤醒需要约 30~60 秒，这是免费部署的正常现象"
          },
          { status: 503 }
        );
      }

      if (!pdfRes.ok) {
        const errorData = await pdfRes.json();
        return NextResponse.json(
          {
            error: errorData.error || "PDF 提取失败",
            detail: errorData.detail
          },
          { status: pdfRes.status }
        );
      }

      const pdfData = await pdfRes.json();
      rawText = pdfData.text;

      console.log("Python service extracted text length:", rawText?.length || 0);
      console.log("Python service extracted pages:", pdfData.pages);
      console.log("First 300 chars:", rawText?.slice(0, 300));
    } catch (err) {
      console.error("PDF extraction service error:", err);
      return NextResponse.json(
        {
          error: "PDF 提取服务连接失败",
          detail: err instanceof Error ? err.message : String(err),
          hint: "请确保 Python PDF 服务正在运行"
        },
        { status: 500 }
      );
    }

    if (!rawText?.trim()) {
      return NextResponse.json(
        { error: "PDF 中未提取到文字，可能是扫描版或图片版简历" },
        { status: 400 }
      );
    }

    let apiConfig: { apiUrl?: string; apiKey?: string; model?: string } | null = null;
    if (apiConfigStr) {
      try {
        apiConfig = JSON.parse(apiConfigStr) as { apiUrl?: string; apiKey?: string; model?: string };
      } catch {
        apiConfig = null;
      }
    }

    const hasApi =
      apiConfig?.apiUrl?.trim() && apiConfig?.apiKey?.trim() && apiConfig?.model?.trim();

    if (hasApi) {
      try {
        const content = await callChatApi(
          apiConfig!.apiUrl!.trim(),
          apiConfig!.apiKey!,
          apiConfig!.model!.trim(),
          `${PARSE_PROMPT}\n\n---\n\n简历文本：\n\n${rawText}`
        );

        const parsed = tryParseResumeJson(content);
        if (parsed) {
          const resumeData = normalizeResumeData(parsed);
          return NextResponse.json({ resumeData });
        }
        // AI 返回了内容但无法解析为 JSON
        console.error("AI response is not valid JSON:", content?.slice(0, 200));
        return NextResponse.json(
          {
            error: "AI 结构化解析失败",
            detail: "模型返回的内容不是有效 JSON，请重试或更换模型。",
            rawText,
          },
          { status: 500 }
        );
      } catch (err) {
        console.error("AI parse error:", err);
        return NextResponse.json(
          {
            error: "AI 结构化解析失败",
            detail: err instanceof Error ? err.message : String(err),
            rawText,
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      rawText,
      message: "PDF 文本提取成功。AI 结构化解析需在右上角「API 设置」中填写 API 地址、Key 和模型。",
    });
  } catch (err) {
    console.error("parse-resume route error:", err);
    return NextResponse.json(
      { error: "服务器错误", detail: String(err) },
      { status: 500 }
    );
  }
}
