import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "未提供文件" }, { status: 400 });
    }

    // TODO: Call vision AI API (e.g., GPT-4V, Claude) to parse the screenshot
    // Convert image to base64, send to API, parse the form field labels
    //
    // const buffer = Buffer.from(await file.arrayBuffer());
    // const base64 = buffer.toString("base64");
    //
    // const aiResponse = await callVisionAI({
    //   image: base64,
    //   prompt: "识别这个网申表格中的所有字段标题..."
    // });

    return NextResponse.json(
      {
        error: "视觉 AI API 未配置",
        message: "请配置视觉 AI API 后启用截图解析功能。",
      },
      { status: 501 }
    );
  } catch {
    return NextResponse.json(
      { error: "服务器错误" },
      { status: 500 }
    );
  }
}
