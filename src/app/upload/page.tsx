"use client";

import { useState, useCallback } from "react";
import { useResumeStore } from "@/lib/store";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import StepNavigation from "@/components/layout/StepNavigation";
import ApiConfigModal from "@/components/layout/ApiConfigModal";
import { Upload, FileText, CheckCircle, Loader2, AlertCircle, KeyRound } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const router = useRouter();
  const resume = useResumeStore((s) => s.resume);
  const setResume = useResumeStore((s) => s.setResume);
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [parseResult, setParseResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [serverStatus, setServerStatus] = useState<null | "starting" | "ready">(null);
  const [wakingSeconds, setWakingSeconds] = useState(0);
  const [showOverwriteConfirm, setShowOverwriteConfirm] = useState(false);
  const [pendingResumeData, setPendingResumeData] = useState<any>(null);
  const [apiModalOpen, setApiModalOpen] = useState(false);

  const hasExistingResume =
    resume.personal.name ||
    resume.work.length > 0 ||
    resume.projects.length > 0 ||
    resume.education.length > 0;

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (
      droppedFile &&
      (droppedFile.type === "application/pdf" ||
        droppedFile.name.endsWith(".pdf"))
    ) {
      setFile(droppedFile);
      setError(null);
    } else {
      setError("请上传 PDF 格式的简历文件");
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };

  const apiConfig = useResumeStore((s) => s.apiConfig);

  const handleParse = async () => {
    if (!file) return;
    setParsing(true);
    setError(null);
    setServerStatus(null);
    setWakingSeconds(0);

    const buildFormData = () => {
      const formData = new FormData();
      formData.append("file", file);
      if (apiConfig.apiUrl && apiConfig.apiKey && apiConfig.model) {
        formData.append(
          "apiConfig",
          JSON.stringify({
            apiUrl: apiConfig.apiUrl,
            apiKey: apiConfig.apiKey,
            model: apiConfig.model,
          })
        );
      }
      return formData;
    };

    const doRequest = async (): Promise<boolean> => {
      const res = await fetch("/api/parse-resume", {
        method: "POST",
        body: buildFormData(),
      });

      if (res.status === 503) return false;

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.error || "解析失败");

      if (data.resumeData) {
        if (hasExistingResume) {
          setPendingResumeData(data.resumeData);
          setShowOverwriteConfirm(true);
        } else {
          setResume(data.resumeData);
          setParseResult("success");
        }
      } else if (data.rawText) {
        setParseResult("text-only");
      }
      return true;
    };

    try {
      const maxRetries = 6;
      let elapsed = 0;
      for (let i = 0; i < maxRetries; i++) {
        const success = await doRequest();
        if (success) {
          setServerStatus(null);
          return;
        }
        // 首次 503：进入启动中状态，启动倒计时
        setServerStatus("starting");
        const interval = setInterval(() => {
          elapsed += 1;
          setWakingSeconds(elapsed);
        }, 1000);
        await new Promise((resolve) => setTimeout(resolve, 15000));
        clearInterval(interval);
      }
      // 超时后服务可能已就绪，提示用户手动重试
      setServerStatus("ready");
    } catch (e) {
      setServerStatus(null);
      setError(e instanceof Error ? e.message : "简历解析失败，请检查文件格式后重试");
    } finally {
      setParsing(false);
    }
  };

  const handleConfirmOverwrite = () => {
    if (pendingResumeData) {
      setResume(pendingResumeData);
      setParseResult("success");
      setShowOverwriteConfirm(false);
      setPendingResumeData(null);
    }
  };

  const handleCancelOverwrite = () => {
    setShowOverwriteConfirm(false);
    setPendingResumeData(null);
    setFile(null);
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">
          第 1 步：上传简历
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          上传 PDF 简历，AI 将自动解析所有模块内容存入简历库
        </p>
      </div>

      <Card>
        <CardContent className="py-6">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`
              border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer
              ${dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}
              ${file ? "border-green-400 bg-green-50" : ""}
            `}
            onClick={() =>
              document.getElementById("file-input")?.click()
            }
          >
            <input
              id="file-input"
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
            {file ? (
              <div className="space-y-3">
                <FileText className="w-12 h-12 text-green-600 mx-auto" />
                <div>
                  <p className="font-medium text-foreground">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <Badge variant="success">文件已选择</Badge>
              </div>
            ) : (
              <div className="space-y-3">
                <Upload className="w-12 h-12 text-muted-foreground mx-auto" />
                <div>
                  <p className="font-medium text-foreground">
                    拖拽 PDF 文件到这里，或点击选择
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    支持 PDF 格式，建议文件大小不超过 10MB
                  </p>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          {serverStatus === "starting" && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-blue-700 mb-3">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="font-medium">服务器启动中</span>
                <span className="text-blue-500 text-sm ml-auto">{wakingSeconds}s</span>
              </div>
              <div className="space-y-2 text-sm text-blue-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                  <span>正在唤醒服务器，请耐心等待...</span>
                </div>
                <div className="flex items-center gap-2 text-blue-400">
                  <div className="w-2 h-2 rounded-full bg-blue-200" />
                  <span>启动完成后将自动继续解析</span>
                </div>
              </div>
            </div>
          )}

          {serverStatus === "ready" && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-blue-700 mb-2">
                <CheckCircle className="w-4 h-4" />
                <span className="font-medium">服务器启动完成</span>
              </div>
              <p className="text-sm text-blue-600 mb-3">
                服务器已就绪，请重新点击「开始解析简历」继续。
              </p>
              <Button
                size="sm"
                onClick={() => {
                  setServerStatus(null);
                  setWakingSeconds(0);
                  handleParse();
                }}
              >
                <FileText className="w-4 h-4" /> 重新解析简历
              </Button>
            </div>
          )}

          {showOverwriteConfirm && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-2 text-amber-700 mb-3">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">简历库已有数据</span>
              </div>
              <p className="text-sm text-amber-600 mb-4">
                检测到简历库中已有简历数据，是否要用新解析的简历覆盖现有数据？
              </p>
              <div className="flex gap-3">
                <Button onClick={handleConfirmOverwrite} variant="primary">
                  覆盖现有简历
                </Button>
                <Button onClick={handleCancelOverwrite} variant="outline">
                  取消，保留现有简历
                </Button>
              </div>
            </div>
          )}

          {file && !parseResult && !showOverwriteConfirm && serverStatus !== "ready" && (
            <div className="mt-6 flex justify-center">
              <Button onClick={handleParse} disabled={parsing} size="lg">
                {parsing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {serverStatus === "starting" ? "服务器启动中..." : "AI 解析中..."}
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" /> 开始解析简历
                  </>
                )}
              </Button>
            </div>
          )}

          {parseResult === "success" && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-700 mb-2">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">简历解析成功，已存入简历库！</span>
              </div>
              <p className="text-sm text-green-600 mb-4">
                如需修改解析内容，可前往简历库编辑；也可直接进入下一步。
              </p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => router.push("/profile?from=upload")}>
                  前往简历库编辑
                </Button>
                <Button onClick={() => router.push("/analyze")}>
                  直接进入下一步：岗位分析
                </Button>
              </div>
            </div>
          )}

          {parseResult === "text-only" && (
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-2 text-amber-700 mb-2">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">PDF 文本已提取，但未完成 AI 解析</span>
              </div>
              <p className="text-sm text-amber-700 mb-4">
                简历库<strong>尚未填入任何内容</strong>。AI 结构化解析需要先配置 API 密钥和模型。
                请点击下方按钮配置 API，配置完成后重新点击「开始解析简历」。
              </p>
              <div className="flex gap-3">
                <Button onClick={() => setApiModalOpen(true)}>
                  <KeyRound className="w-4 h-4" /> 立即配置 API
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setParseResult(null);
                    setFile(null);
                  }}
                >
                  重新上传并解析
                </Button>
              </div>
            </div>
          )}

          <ApiConfigModal
            open={apiModalOpen}
            onClose={() => {
              setApiModalOpen(false);
              // If we showed text-only because API wasn't configured,
              // reset so the parse button reappears (file is still selected)
              if (parseResult === "text-only" && file) {
                setParseResult(null);
              }
            }}
          />
        </CardContent>
      </Card>

      {/* Flow: 3-step explanation */}
      <div className="grid grid-cols-3 gap-4 mt-6 text-sm">
        {[
          { n: "1", t: "提取文本", d: "从 PDF 中提取文字" },
          { n: "2", t: "AI 结构化", d: "识别各模块并分类" },
          { n: "3", t: "存入简历库", d: "自动填入，随时编辑" },
        ].map((item) => (
          <div key={item.n} className="text-center p-3 rounded-lg bg-card border border-border">
            <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2 text-xs font-bold">
              {item.n}
            </div>
            <p className="font-medium">{item.t}</p>
            <p className="text-muted-foreground text-xs mt-0.5">{item.d}</p>
          </div>
        ))}
      </div>

      <StepNavigation nextLabel="下一步：岗位分析" />
    </div>
  );
}
