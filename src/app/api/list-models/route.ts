import { NextRequest, NextResponse } from "next/server";

/**
 * 根据用户填写的聊天接口 URL 推导出「列出模型」的地址（OpenAI 兼容：GET /v1/models），
 * 用用户提供的 apiKey 请求，返回可用的 model id 列表，供前端下拉选择。
 * 若该 API 不支持列出模型，前端仍可手动输入模型名。
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiUrl, apiKey } = body as { apiUrl?: string; apiKey?: string };

    if (!apiUrl?.trim() || !apiKey?.trim()) {
      return NextResponse.json(
        { error: "请先填写 API 地址和 Key" },
        { status: 400 }
      );
    }

    const base = apiUrl.trim().replace(/\/chat\/completions\/?$/i, "").replace(/\/+$/, "");
    const modelsUrl = `${base}/models`;

    const res = await fetch(modelsUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: `获取模型列表失败: ${res.status}`, detail: text },
        { status: res.status }
      );
    }

    const data = (await res.json()) as { data?: Array<{ id?: string }> };
    const list = Array.isArray(data?.data) ? data.data : [];
    const models = list.map((m) => (m && typeof m.id === "string" ? m.id : "")).filter(Boolean);

    return NextResponse.json({ models });
  } catch (e) {
    const message = e instanceof Error ? e.message : "请求失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
