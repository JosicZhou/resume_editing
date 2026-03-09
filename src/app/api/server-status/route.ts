import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const pythonServiceUrl =
    process.env.PDF_SERVICE_URL || "http://localhost:5001";

  // 检查是否是唤醒请求
  const searchParams = request.nextUrl.searchParams;
  const isWakeRequest = searchParams.get("wake") === "true";

  try {
    // 如果是唤醒请求，主动ping Render服务器
    if (isWakeRequest) {
      console.log("Sending wake-up request to:", pythonServiceUrl);
      // 发送唤醒请求，不等待响应（因为可能需要很长时间）
      fetch(`${pythonServiceUrl}/health`, {
        method: "GET",
        signal: AbortSignal.timeout(60000), // 60秒超时
      }).catch((err) => {
        console.log("Wake-up request sent, server starting...", err.message);
      });
      return NextResponse.json({ status: "starting" });
    }

    // 正常的状态检查
    const res = await fetch(`${pythonServiceUrl}/health`, {
      method: "GET",
      signal: AbortSignal.timeout(5000),
    });
    const contentType = res.headers.get("content-type") || "";
    if (res.ok && contentType.includes("application/json")) {
      return NextResponse.json({ status: "online" });
    }
    return NextResponse.json({ status: "starting" });
  } catch {
    return NextResponse.json({ status: "offline" });
  }
}
