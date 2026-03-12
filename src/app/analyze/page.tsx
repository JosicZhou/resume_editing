"use client";

import { useState } from "react";
import { useResumeStore } from "@/lib/store";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Badge from "@/components/ui/Badge";
import StepNavigation from "@/components/layout/StepNavigation";
import {
  Target,
  Plus,
  Loader2,
  CheckCircle,
  AlertCircle,
  Sparkles,
  X,
} from "lucide-react";
import { generateId, type JobDescription } from "@/lib/types";

export default function AnalyzePage() {
  const jobs = useResumeStore((s) => s.jobs);
  const addJob = useResumeStore((s) => s.addJob);
  const removeJob = useResumeStore((s) => s.removeJob);
  const currentJobId = useResumeStore((s) => s.currentJobId);
  const setCurrentJob = useResumeStore((s) => s.setCurrentJob);
  const tailoredResumes = useResumeStore((s) => s.tailoredResumes);
  const updateTailoredResume = useResumeStore((s) => s.updateTailoredResume);
  const createTailoredResume = useResumeStore((s) => s.createTailoredResume);
  const optimizePrompts = useResumeStore((s) => s.optimizePrompts);
  const apiConfig = useResumeStore((s) => s.apiConfig);

  const [newJobText, setNewJobText] = useState("");
  const [newJobTitle, setNewJobTitle] = useState("");
  const [newJobCompany, setNewJobCompany] = useState("");
  const [showAddJob, setShowAddJob] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [hoveredJobId, setHoveredJobId] = useState<string | null>(null);

  const currentJob = jobs.find((j) => j.id === currentJobId);
  const currentTailored = tailoredResumes.find(
    (t) => t.jobId === currentJobId
  );

  const handleAddJob = () => {
    if (!newJobText.trim()) return;
    const job: JobDescription = {
      id: generateId(),
      title: newJobTitle,
      company: newJobCompany,
      rawText: newJobText,
      keywords: extractKeywords(newJobText),
      requirements: [],
      createdAt: new Date().toISOString(),
    };
    addJob(job);
    setCurrentJob(job.id);

    // 自动创建对应的 tailoredResume
    createTailoredResume(job.id);

    setNewJobText("");
    setNewJobTitle("");
    setNewJobCompany("");
    setShowAddJob(false);
  };

  const handleAnalyze = async () => {
    if (!currentJob) {
      setAnalyzeError("请先选择或添加一个岗位");
      return;
    }

    // 如果当前岗位没有对应的 tailoredResume，自动创建一个
    let tailored = currentTailored;
    if (!tailored) {
      const newId = createTailoredResume(currentJob.id);
      tailored = tailoredResumes.find((t) => t.id === newId);
      if (!tailored) {
        setAnalyzeError("创建简历配置失败，请重试");
        return;
      }
    }

    const hasApiConfig =
      apiConfig.apiUrl?.trim() &&
      apiConfig.apiKey?.trim() &&
      apiConfig.model?.trim();

    if (!hasApiConfig) {
      setAnalyzeError("请先在右上角「API 设置」中配置 API 信息");
      return;
    }

    setAnalyzing(true);
    setAnalyzeError(null);

    try {
      const prompt = optimizePrompts.jdAnalysis
        .replace("{company_name}", currentJob.company || "目标公司")
        .replace("{job_title}", currentJob.title || "目标岗位")
        .replace("{job_description}", currentJob.rawText);

      const res = await fetch("/api/ai-optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "jd-analysis",
          prompt,
          apiUrl: apiConfig.apiUrl,
          apiKey: apiConfig.apiKey,
          model: apiConfig.model,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAnalyzeError(data.error || data.detail || "分析失败");
        return;
      }

      if (data.error) {
        setAnalyzeError(data.error);
        return;
      }

      // 保存分析结果（结构化数据）
      if (data.analysis) {
        updateTailoredResume(tailored.id, {
          jdAnalysis: data.analysis,
          jdRawResponse: data.rawResponse,
        });
      } else {
        // 如果没有解析成功，只保存原始文本，不覆盖 jdAnalysis
        updateTailoredResume(tailored.id, {
          jdRawResponse: data.rawResponse,
        });
      }
    } catch (err) {
      setAnalyzeError(err instanceof Error ? err.message : "请求失败");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">
          第 2 步：岗位分析
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          添加目标岗位 JD，AI 分析岗位要求和关键词
        </p>
      </div>

      {/* Job tabs */}
      <div className="mb-5 flex items-center gap-2 flex-wrap">
        {jobs.map((job) => {
          const isHovered = hoveredJobId === job.id;
          return (
          <div
            key={job.id}
            className={`group relative px-3 py-1.5 rounded-lg text-sm border transition-all ${
              currentJobId === job.id
                ? "border-primary bg-primary/5 text-primary"
                : "border-border hover:border-primary/30"
            }`}
            onMouseEnter={() => setHoveredJobId(job.id)}
            onMouseLeave={() => setHoveredJobId(null)}
          >
            <button
              onClick={() => setCurrentJob(job.id)}
              className="pr-6"
            >
              {job.company} - {job.title}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`确定删除岗位「${job.company} - ${job.title}」吗？`)) {
                  removeJob(job.id);
                  if (currentJobId === job.id) {
                    setCurrentJob(jobs.length > 1 ? jobs[0].id : null);
                  }
                }
              }}
              className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/10 rounded"
              title="删除岗位"
            >
              <X className="w-3 h-3 text-destructive" />
            </button>

            {/* Hover tooltip with job details */}
            {isHovered && (
              <div
                className="absolute left-0 top-full mt-2 w-[500px] max-w-[90vw] bg-card border border-border rounded-lg shadow-lg p-4 z-50"
                onMouseEnter={() => setHoveredJobId(job.id)}
                onMouseLeave={() => setHoveredJobId(null)}
              >
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-sm mb-1">{job.company} - {job.title}</h4>
                    <p className="text-xs text-muted-foreground">创建于 {new Date(job.createdAt).toLocaleDateString()}</p>
                  </div>

                  {job.rawText && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1.5">岗位描述（JD）</p>
                      <div className="text-xs text-muted-foreground max-h-60 overflow-y-auto whitespace-pre-wrap bg-muted/30 rounded p-2">
                        {job.rawText}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          );
        })}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAddJob(!showAddJob)}
        >
          <Plus className="w-4 h-4" /> 添加岗位
        </Button>
      </div>

      {/* Add job form */}
      {showAddJob && (
        <Card className="mb-6">
          <CardContent className="py-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  岗位名称
                </label>
                <Input
                  value={newJobTitle}
                  onChange={(e) => setNewJobTitle(e.target.value)}
                  placeholder="如：产品经理"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  公司名称
                </label>
                <Input
                  value={newJobCompany}
                  onChange={(e) => setNewJobCompany(e.target.value)}
                  placeholder="如：字节跳动"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                岗位描述 (JD)
              </label>
              <Textarea
                value={newJobText}
                onChange={(e) => setNewJobText(e.target.value)}
                placeholder="粘贴完整的岗位描述..."
                rows={8}
              />
            </div>
            <div className="flex gap-3">
              <Button onClick={handleAddJob}>确认添加</Button>
              <Button variant="ghost" onClick={() => setShowAddJob(false)}>
                取消
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis section */}
      {currentJob && !showAddJob && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-sm">岗位信息</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">
                    公司：
                  </span>
                  <span className="text-sm ml-2">{currentJob.company}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">
                    岗位：
                  </span>
                  <span className="text-sm ml-2">{currentJob.title}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">
                    关键词：
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {(currentTailored?.jdAnalysis
                      ? [
                          ...(currentTailored.jdAnalysis.hardSkills || []),
                          ...(currentTailored.jdAnalysis.softSkills || []),
                          ...(currentTailored.jdAnalysis.experienceKeywords || []),
                        ]
                      : extractKeywords(currentJob.rawText)
                    ).map((kw) => (
                      <Badge key={kw} variant="secondary">
                        {kw}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {!currentTailored?.jdAnalysis && (
            <Card>
              <CardContent className="py-8 text-center">
                <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">AI 岗位分析</h3>
                <p className="text-muted-foreground mb-4 text-sm">
                  AI 将分析岗位能力定位、关键技能、痛点和公司文化
                </p>
                <Button onClick={handleAnalyze} disabled={analyzing}>
                  {analyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> 分析中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> 开始分析
                    </>
                  )}
                </Button>
                {analyzeError && (
                  <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                    <p className="text-sm text-destructive text-left">
                      {analyzeError}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {currentTailored?.jdAnalysis && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <h3 className="font-semibold text-sm">AI 分析结果</h3>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAnalyze}
                  disabled={analyzing}
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> 重新分析
                    </>
                  ) : (
                    "重新分析"
                  )}
                </Button>
              </CardHeader>
              <CardContent>
                {currentTailored.jdAnalysis && typeof currentTailored.jdAnalysis === 'object' ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">能力定位</h4>
                      <p className="text-sm text-muted-foreground bg-accent/50 p-3 rounded-lg">
                        {currentTailored.jdAnalysis.abilityPositioning}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">硬技能关键词</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {currentTailored.jdAnalysis.hardSkills?.map((skill: string, i: number) => (
                          <Badge key={i} variant="default">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">软能力关键词</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {currentTailored.jdAnalysis.softSkills?.map((skill: string, i: number) => (
                          <Badge key={i} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">相关经验关键词</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {currentTailored.jdAnalysis.experienceKeywords?.map((kw: string, i: number) => (
                          <Badge key={i} variant="secondary">
                            {kw}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">岗位痛点</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {currentTailored.jdAnalysis.painPoints?.map((point: string, i: number) => (
                          <Badge key={i} className="bg-amber-100 text-amber-800 hover:bg-amber-200">
                            {point}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">公司/团队文化</h4>
                      <p className="text-sm text-muted-foreground bg-accent/50 p-3 rounded-lg">
                        {currentTailored.jdAnalysis.companyCulture}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="prose prose-sm max-w-none">
                    <pre className="whitespace-pre-wrap text-sm bg-accent/50 p-4 rounded-lg border border-border">
                      {currentTailored.jdRawResponse || '暂无分析结果'}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {!currentJob && !showAddJob && (
        <Card>
          <CardContent className="py-12 text-center">
            <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">添加目标岗位</h3>
            <p className="text-muted-foreground mb-4 text-sm">
              粘贴岗位 JD，AI 将帮你分析岗位要求
            </p>
            <Button onClick={() => setShowAddJob(true)}>
              <Plus className="w-4 h-4" /> 添加第一个岗位
            </Button>
          </CardContent>
        </Card>
      )}

      <StepNavigation nextLabel="下一步：岗位匹配" />
    </div>
  );
}

function extractKeywords(text: string): string[] {
  const stopWords = new Set([
    "的","了","和","是","在","有","与","等","能","对","我","您","他","她","他们","我们",
    "进行","通过","使用","具有","具备","熟悉","了解","掌握","能够","负责","参与","完成",
    "支持","需要","要求","具体","相关","以及","包括","主要","提供","实现","帮助","推动",
    "推进","优化","强化","提升","建设","开展","探索","研究","分析","设计","管理","运营",
    "职位描述","岗位职责","任职要求","职位要求","工作职责","工作要求","基本要求",
    "必要条件","加分项","优先考虑","岗位说明","职责说明","关于我们","公司介绍",
    "薪资待遇","福利待遇","工作地点","工作时间","应聘要求",
    "the","and","or","is","are","in","on","for","to","with","a","an","of","at","by",
    "from","as","be","you","we","our","your","will","can","may","should","have","has",
    "not","this","that","all","any","some","other",
  ]);
  const tokens = text
    .replace(/[，。、；：！？\n\r\t【】「」（）()\[\]《》]/g, " ")
    .split(/\s+/)
    .filter((w) => !/^[\d一二三四五六七八九十]+[\.、）)）]?$/.test(w))
    .filter((w) => !/^\d+$/.test(w))
    .map((w) => w.replace(/[^\w\u4e00-\u9fff+#./-]/g, "").trim())
    .filter((w) => w.length >= 2 && w.length <= 12)
    .filter((w) => !stopWords.has(w.toLowerCase()));
  const freq = new Map<string, number>();
  tokens.forEach((w) => freq.set(w, (freq.get(w) || 0) + 1));
  return Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word]) => word);
}
