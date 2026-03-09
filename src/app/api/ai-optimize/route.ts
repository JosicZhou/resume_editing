import { NextRequest, NextResponse } from "next/server";

async function callChatApi(
  apiUrl: string,
  apiKey: string,
  model: string,
  prompt: string,
  systemMessage?: string
): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 180000); // 改为 3 分钟

  const messages: { role: "system" | "user"; content: string }[] = [];
  if (systemMessage) {
    messages.push({ role: "system", content: systemMessage });
  }
  messages.push({ role: "user", content: prompt });

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
        messages,
        temperature: 0.3,
      }),
      signal: controller.signal,
    });
  } catch (e) {
    if ((e as Error).name === "AbortError") {
      throw new Error("请求超时（3分钟），请稍后重试或缩短内容。");
    }
    throw e;
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    const err = await res.text();
    if (res.status === 524) {
      throw new Error("请求超时(524)：API 响应过慢，请稍后重试。");
    }
    if (res.status === 504 || (err && /timeout|timed out/i.test(err))) {
      throw new Error("请求超时：API 响应过慢，请稍后重试。");
    }
    const shortErr = err.length > 200 ? err.slice(0, 200) + "…" : err;
    throw new Error(`API 请求失败: ${res.status} ${shortErr}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content ?? data.result?.content ?? data.content;
  if (content == null) throw new Error("API 返回格式异常，缺少 choices[0].message.content");
  return typeof content === "string" ? content : String(content);
}

function tryParseJson<T>(text: string): T | null {
  // 策略1：去掉 markdown 代码块后直接解析
  try {
    const cleaned = text.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
    return JSON.parse(cleaned) as T;
  } catch {}

  // 策略2：查找 ```json ... ``` 代码块
  try {
    const codeBlockMatch = text.match(/```json\s*([\s\S]*?)\s*```/i);
    if (codeBlockMatch) {
      return JSON.parse(codeBlockMatch[1]) as T;
    }
  } catch {}

  // 策略3：查找 ``` ... ``` 代码块（不带 json 标记）
  try {
    const codeBlockMatch = text.match(/```\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
      const content = codeBlockMatch[1].trim();
      if (content.startsWith('{')) {
        return JSON.parse(content) as T;
      }
    }
  } catch {}

  // 策略4：用正则从文本中提取第一个完整的 {...} JSON 对象
  try {
    // 找到第一个 { 的位置
    const startIndex = text.indexOf('{');
    if (startIndex === -1) return null;

    // 从这个位置开始，找到匹配的 }
    let braceCount = 0;
    let endIndex = -1;
    for (let i = startIndex; i < text.length; i++) {
      if (text[i] === '{') braceCount++;
      if (text[i] === '}') {
        braceCount--;
        if (braceCount === 0) {
          endIndex = i;
          break;
        }
      }
    }

    if (endIndex !== -1) {
      const jsonStr = text.substring(startIndex, endIndex + 1);
      return JSON.parse(jsonStr) as T;
    }
  } catch {}

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      action,
      prompt,
      apiUrl,
      apiKey,
      model,
      work,
      projects,
      id: polishId,
    } = body;

    if (!apiUrl || !apiKey || !model) {
      return NextResponse.json(
        { error: "请先在右上角「API 设置」中填写 API 地址、Key 和模型" },
        { status: 400 }
      );
    }

    // store.ts 的模板字符串用 {{ }} 转义花括号，发送给 AI 前还原成真正的 { }
    const cleanedPrompt = (prompt || "").replace(/\{\{/g, "{").replace(/\}\}/g, "}");

    const isJsonAction = action === "jd-analysis" || action === "rewrite" || action === "match-experiences" || action === "skill-optimize";
    const systemMessage = isJsonAction
      ? "你是一个结构化数据提取助手。无论用户说什么，你只能输出合法的 JSON 对象，不得包含任何解释、前言、标题、markdown 格式或代码块标记。直接输出 JSON，不要输出其他任何内容。"
      : undefined;

    const content = await callChatApi(
      apiUrl.trim(),
      apiKey,
      model.trim(),
      cleanedPrompt,
      systemMessage
    );

    switch (action) {
      case "jd-analysis": {
        console.log("=== JD Analysis Debug ===");
        console.log("AI 原始返回:", content);
        console.log("========================");

        const parsed = tryParseJson<{
          abilityPositioning: string;
          hardSkills: string[];
          softSkills: string[];
          experienceKeywords: string[];
          painPoints: string[];
          companyCulture: string;
        }>(content);

        if (parsed) {
          return NextResponse.json({
            rawResponse: content,
            analysis: parsed,
          });
        } else {
          // 如果解析失败，返回原始文本
          return NextResponse.json({
            rawResponse: content,
            analysis: null,
            error: "AI 返回的不是有效的 JSON 格式，请重试",
          });
        }
      }

      case "rewrite": {
        console.log("=== Rewrite Debug ===");
        console.log("AI 原始返回:", content);

        const parsed = tryParseJson<{
          work?: { id: string; descriptions: string[] }[];
          projects?: { id: string; descriptions: string[] }[];
        }>(content);

        const rewrites: Record<string, string[]> = {};

        if (parsed?.work) {
          for (const item of parsed.work) {
            if (item.id && Array.isArray(item.descriptions)) {
              rewrites[item.id] = item.descriptions;
            }
          }
        }
        if (parsed?.projects) {
          for (const item of parsed.projects) {
            if (item.id && Array.isArray(item.descriptions)) {
              rewrites[item.id] = item.descriptions;
            }
          }
        }

        if (Object.keys(rewrites).length === 0 && work?.length) {
          for (const w of work) {
            rewrites[w.id] = w.descriptions || [];
          }
        }
        if (Object.keys(rewrites).length === 0 && projects?.length) {
          for (const p of projects) {
            rewrites[p.id] = p.descriptions || [];
          }
        }

        console.log("Parsed:", JSON.stringify(parsed));
        console.log("Final rewrites:", JSON.stringify(rewrites));
        console.log("====================");

        return NextResponse.json({ rewrites });
      }

      case "polish": {
        const lines = content
          .split(/\n+/)
          .map((s: string) => s.replace(/^[\d\.\-\*]\s*/, "").trim())
          .filter(Boolean);
        return NextResponse.json({ polished: lines });
      }

      case "match-experiences": {
        const parsed = tryParseJson<{
          selectedWorkIds: string[];
          selectedProjectIds: string[];
          reason?: string;
        }>(content);

        if (parsed) {
          return NextResponse.json({
            match: parsed,
            rawResponse: content,
          });
        } else {
          return NextResponse.json({
            match: null,
            rawResponse: content,
            error: "AI 返回的不是有效的 JSON 格式，请重试",
          });
        }
      }

      case "skill-optimize": {
        const parsed = tryParseJson<{
          skills: { id: string; category: string; items: string[] }[];
        }>(content);

        if (parsed?.skills) {
          return NextResponse.json({ skills: parsed.skills });
        }
        return NextResponse.json({
          skills: null,
          rawResponse: content,
          error: "AI 返回的不是有效的 JSON 格式，请重试",
        });
      }

      default:
        return NextResponse.json({ error: "未知操作类型" }, { status: 400 });
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : "服务器错误";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
