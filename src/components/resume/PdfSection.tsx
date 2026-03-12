"use client";

import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import ResumePrint from "@/lib/pdf/ResumePrint";
import Button from "@/components/ui/Button";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Download, FileText, Info } from "lucide-react";
import type { ResumeData, TailoredResume } from "@/lib/types";

// 把 @page margin 设为 0，让简历内容自己控制留白
// 这样浏览器角标（URL/日期）没有空间显示，同时提示用户手动关闭
const PRINT_PAGE_STYLE = `
  @page {
    size: A4;
    margin: 0;
  }
  @media print {
    body {
      margin: 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
  }
`;

// ─── Download / Print button ──────────────────────────────────────────────────

export function PdfDownloadButton({
  resume,
  tailored,
  documentTitle,
  onExport,
  useOriginalIds,
}: {
  resume: ResumeData;
  tailored?: TailoredResume | null;
  documentTitle?: string;
  onExport?: () => void;
  useOriginalIds?: string[];
}) {
  const contentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: documentTitle ?? `${resume.personal.name || "resume"}_简历`,
    pageStyle: PRINT_PAGE_STYLE,
    onAfterPrint: onExport,
  });

  return (
    <>
      {/* Hidden print target */}
      <div style={{ display: "none" }}>
        <ResumePrint ref={contentRef} resume={resume} tailored={tailored} useOriginalIds={useOriginalIds} />
      </div>

      <Button onClick={() => handlePrint()}>
        <Download className="w-4 h-4" />
        下载 PDF
      </Button>
    </>
  );
}

// ─── Inline preview panel ─────────────────────────────────────────────────────

export function PdfPreviewPanel({
  resume,
  tailored,
  documentTitle,
  onExport,
  useOriginalIds,
}: {
  resume: ResumeData;
  tailored?: TailoredResume | null;
  documentTitle?: string;
  onExport?: () => void;
  useOriginalIds?: string[];
}) {
  const contentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: documentTitle ?? `${resume.personal.name || "resume"}_简历`,
    pageStyle: PRINT_PAGE_STYLE,
    onAfterPrint: onExport,
  });

  return (
    <Card>
      <CardHeader className="py-3 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm">PDF 预览</h3>
        </div>
        <Button size="sm" variant="outline" onClick={() => handlePrint()}>
          <Download className="w-3.5 h-3.5" />
          打印 / 下载
        </Button>
      </CardHeader>

      {/* Print tip */}
      <div className="mx-4 mb-0 mt-2 flex items-start gap-2 rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800">
        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        <span>
          打印时请在「更多设置」中取消勾选<strong>「页眉和页脚」</strong>，避免浏览器自动添加 URL 和日期水印。
        </span>
      </div>

      <CardContent className="p-0 mt-3 overflow-auto max-h-[800px] bg-gray-100">
        {/* A4 paper shadow preview */}
        <div className="py-4 flex justify-center">
          <div
            style={{
              width: "210mm",
              minHeight: "297mm",
              background: "#fff",
              boxShadow: "0 2px 16px rgba(0,0,0,0.15)",
            }}
          >
            <ResumePrint ref={contentRef} resume={resume} tailored={tailored} useOriginalIds={useOriginalIds} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
