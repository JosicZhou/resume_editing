import { NextResponse } from "next/server";

export async function GET() {
  const pythonServiceUrl =
    process.env.PDF_SERVICE_URL || "http://localhost:5001";

  try {
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
