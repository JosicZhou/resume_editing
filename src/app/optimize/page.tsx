"use client";

import { useState, useEffect, useRef } from "react";
import { useResumeStore } from "@/lib/store";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Badge from "@/components/ui/Badge";
import StepNavigation from "@/components/layout/StepNavigation";
import {
  Sparkles,
  Settings,
  Loader2,
  RotateCcw,
  Check,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Wand2,
  X,
  RefreshCw,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { JdAnalysisResult, OptimizePrompts } from "@/lib/types";

// ─── Sub-step indicator ───────────────────────────────────
function SubStepBar({
  current,
  onSelect,
}: {
  current: 1 | 2;
  onSelect: (step: 1 | 2) => void;
}) {
  const steps = [
    { n: 1 as const, label: "内容改写" },
    { n: 2 as const, label: "语言润色" },
  ];
  return (
    <div className="flex items-center gap-1 mb-6">
      {steps.map((s, i) => (
        <div key={s.n} className="flex items-center">
          <button
            onClick={() => onSelect(s.n)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              current === s.n
                ? "bg-primary text-primary-foreground shadow-sm"
                : current > s.n
                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                  : "bg-muted text-muted-foreground hover:bg-accent"
            )}
          >
            {current > s.n ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <span className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center text-xs">
                {s.n}
              </span>
            )}
            {s.label}
          </button>
          {i < steps.length - 1 && (
            <div
              className={cn(
                "w-8 h-px mx-1",
                current > s.n ? "bg-green-300" : "bg-border"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Prompt Editor Toggle ─────────────────────────────────
function PromptEditor({
  label,
  value,
  onChange,
  placeholders,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholders: string[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <Settings className="w-3.5 h-3.5" />
        {open ? "收起" : "编辑"} {label} Prompt
        {open ? (
          <ChevronDown className="w-3 h-3" />
        ) : (
          <ChevronRight className="w-3 h-3" />
        )}
      </button>
      {open && (
        <div className="mt-2 p-3 border border-border rounded-lg bg-muted/30">
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={12}
            className="font-mono text-xs bg-card"
          />
          <div className="flex flex-wrap gap-1.5 mt-2">
            <span className="text-xs text-muted-foreground">占位符:</span>
            {placeholders.map((p) => (
              <code
                key={p}
                className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded"
              >
                {p}
              </code>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Inline editable field ────────────────────────────────
function InlineEdit({
  value,
  onChange,
  className,
  placeholder = "点击编辑",
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
  placeholder?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  useEffect(() => { setDraft(value); }, [value]);

  if (editing) {
    return (
      <input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => { setEditing(false); if (draft !== value) onChange(draft); }}
        onKeyDown={(e) => { if (e.key === "Enter") { setEditing(false); if (draft !== value) onChange(draft); } }}
        className={cn("bg-transparent border-b border-primary outline-none min-w-[60px]", className)}
      />
    );
  }
  return (
    <span
      onClick={() => setEditing(true)}
      title="点击编辑"
      className={cn("cursor-text hover:text-primary hover:underline decoration-dotted transition-colors", className)}
    >
      {value || <span className="text-muted-foreground italic text-xs">{placeholder}</span>}
    </span>
  );
}

// ─── 单条可编辑项 ─────────────────────────────────────────
function EditableItem({
  value,
  onChange,
  onDelete,
  bgClass,
}: {
  value: string;
  onChange: (v: string) => void;
  onDelete?: () => void;
  bgClass: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => { setDraft(value); }, [value]);

  const handleBlur = () => {
    setIsEditing(false);
    if (draft !== value) onChange(draft);
  };

  return (
    <div className="relative group">
      {isEditing ? (
        <textarea
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={handleBlur}
          rows={2}
          className={`w-full text-xs p-2 ${onDelete ? "pr-7" : ""} rounded resize-none leading-relaxed focus:outline-none focus:ring-1 focus:ring-primary ${bgClass}`}
        />
      ) : (
        <div
          onClick={() => setIsEditing(true)}
          className={`text-xs p-2 ${onDelete ? "pr-7" : ""} rounded leading-relaxed cursor-text whitespace-pre-wrap ${bgClass}`}
        >
          {draft || <span className="text-muted-foreground italic">（空）</span>}
        </div>
      )}
      {onDelete && (
        <button
          onMouseDown={(e) => { e.preventDefault(); onDelete(); }}
          className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-destructive/10"
          title="删除此条"
        >
          <X className="w-3 h-3 text-destructive" />
        </button>
      )}
    </div>
  );
}

// ─── Experience card ──────────────────────────────────────
function ExperienceReviewCard({
  typeLabel,
  // 可编辑题头字段
  orgName,
  onOrgNameChange,
  role,
  onRoleChange,
  dateRange,
  onDateChange,
  location,
  onLocationChange,
  // 内容
  originalDescs,
  pendingDescs,
  mode,
  isProcessing,
  onAction,
  onChangePending,
}: {
  typeLabel: string;
  orgName: string;
  onOrgNameChange?: (v: string) => void;
  role?: string;
  onRoleChange?: (v: string) => void;
  dateRange?: string;
  onDateChange?: (v: string) => void;
  location?: string;
  onLocationChange?: (v: string) => void;
  originalDescs: string[];
  pendingDescs: string[] | null;
  mode: "rewrite" | "polish";
  isProcessing: boolean;
  onAction: () => void;
  onChangePending: (descs: string[]) => void;
}) {
  const [localPending, setLocalPending] = useState<string[]>(pendingDescs ?? []);

  // 当 AI 返回新结果时自动同步并保存
  useEffect(() => {
    if (pendingDescs !== null) {
      setLocalPending(pendingDescs);
      onChangePending(pendingDescs);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingDescs]);

  const hasPending = pendingDescs !== null;
  const actionLabel = mode === "rewrite" ? "单独改写" : "单独润色";
  const actionIcon = mode === "rewrite"
    ? <RefreshCw className="w-3 h-3" />
    : <Wand2 className="w-3 h-3" />;
  const leftLabel = mode === "rewrite" ? "原版" : "润色前";
  const rightLabel = mode === "rewrite" ? "AI 改写版" : "润色后";
  const leftBg = mode === "rewrite"
    ? "bg-red-50 border border-red-200"
    : "bg-amber-50 border border-amber-200";
  const rightBg = mode === "rewrite"
    ? "bg-green-50 border border-green-200"
    : "bg-blue-50 border border-blue-200";

  const handlePendingChange = (i: number, val: string) => {
    const next = localPending.map((d, idx) => (idx === i ? val : d));
    setLocalPending(next);
    onChangePending(next);
  };

  const handleDeletePending = (i: number) => {
    const next = localPending.filter((_, idx) => idx !== i);
    setLocalPending(next);
    onChangePending(next);
  };

  return (
    <Card>
      <CardHeader className="py-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {/* 第一行：类型标签 + 机构名 */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={typeLabel === "工作经历" ? "default" : "secondary"}>
                {typeLabel}
              </Badge>
              {onOrgNameChange ? (
                <InlineEdit value={orgName} onChange={onOrgNameChange} className="font-medium text-sm" />
              ) : (
                <span className="font-medium text-sm">{orgName}</span>
              )}
              {role !== undefined && (
                <>
                  <span className="text-muted-foreground text-xs">·</span>
                  {onRoleChange ? (
                    <InlineEdit value={role} onChange={onRoleChange} className="text-xs text-muted-foreground" placeholder="职位" />
                  ) : (
                    <span className="text-xs text-muted-foreground">{role}</span>
                  )}
                </>
              )}
            </div>
            {/* 第二行：日期 + 地点 */}
            {(dateRange !== undefined || location !== undefined) && (
              <div className="flex items-center gap-3 mt-1">
                {dateRange !== undefined && (
                  onDateChange ? (
                    <InlineEdit value={dateRange} onChange={onDateChange} className="text-xs text-muted-foreground" placeholder="时间段" />
                  ) : (
                    <span className="text-xs text-muted-foreground">{dateRange}</span>
                  )
                )}
                {location !== undefined && (
                  onLocationChange ? (
                    <InlineEdit value={location} onChange={onLocationChange} className="text-xs text-muted-foreground" placeholder="地点" />
                  ) : (
                    <span className="text-xs text-muted-foreground">{location}</span>
                  )
                )}
              </div>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onAction}
            disabled={isProcessing}
            className="shrink-0"
          >
            {isProcessing ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              actionIcon
            )}
            {isProcessing ? "处理中..." : actionLabel}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* 左右对比视图 */}
        <div className="grid grid-cols-2 gap-3">
          {/* 左：原版（只读） */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1.5">{leftLabel}</p>
            <ul className="space-y-1">
              {originalDescs.map((d, i) => (
                <li key={i} className={`text-xs p-2 rounded leading-relaxed ${leftBg}`}>
                  {d}
                </li>
              ))}
            </ul>
          </div>
          {/* 右：AI 结果（自动保存，可编辑） */}
          <div>
            <p className="text-xs font-medium text-primary mb-1.5">
              {rightLabel}{hasPending && <span className="text-primary/60 font-normal ml-1">（点击编辑，自动保存）</span>}
            </p>
            {hasPending ? (
              <ul className="space-y-1">
                {localPending.map((d, i) => (
                  <li key={i}>
                    <EditableItem
                      value={d}
                      onChange={(val) => handlePendingChange(i, val)}
                      onDelete={() => handleDeletePending(i)}
                      bgClass={rightBg}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="h-full min-h-[60px] flex items-center justify-center border-2 border-dashed border-border rounded-lg p-4 text-xs text-muted-foreground">
                点击「{actionLabel}」生成
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Education display card (可编辑题头, 无 AI 按钮) ──────
function EducationDisplayCard({
  school, onSchoolChange,
  degree, onDegreeChange,
  major, onMajorChange,
  dateRange, onDateChange,
  gpa, onGpaChange,
  highlights, onHighlightsChange,
}: {
  school: string; onSchoolChange: (v: string) => void;
  degree: string; onDegreeChange: (v: string) => void;
  major: string; onMajorChange: (v: string) => void;
  dateRange: string; onDateChange: (v: string) => void;
  gpa?: string; onGpaChange: (v: string) => void;
  highlights: string[]; onHighlightsChange: (v: string[]) => void;
}) {
  return (
    <Card>
      <CardHeader className="py-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary">教育经历</Badge>
            <InlineEdit value={school} onChange={onSchoolChange} className="font-medium text-sm" placeholder="学校名称" />
            <span className="text-muted-foreground text-xs">·</span>
            <InlineEdit value={degree} onChange={onDegreeChange} className="text-xs text-muted-foreground" placeholder="学位" />
            <span className="text-muted-foreground text-xs">·</span>
            <InlineEdit value={major} onChange={onMajorChange} className="text-xs text-muted-foreground" placeholder="专业" />
          </div>
          <div className="flex items-center gap-3 mt-1">
            <InlineEdit value={dateRange} onChange={onDateChange} className="text-xs text-muted-foreground" placeholder="时间段" />
            {gpa !== undefined && (
              <>
                <span className="text-xs text-muted-foreground">GPA:</span>
                <InlineEdit value={gpa} onChange={onGpaChange} className="text-xs text-muted-foreground" placeholder="GPA" />
              </>
            )}
          </div>
        </div>
      </CardHeader>
      {highlights.length > 0 && (
        <CardContent>
          <p className="text-xs font-medium text-muted-foreground mb-1.5">荣誉/课程</p>
          <ul className="space-y-1">
            {highlights.map((h, i) => (
              <li key={i}>
                <EditableItem
                  value={h}
                  onChange={(val) => {
                    const next = highlights.map((x, idx) => idx === i ? val : x);
                    onHighlightsChange(next);
                  }}
                  onDelete={() => onHighlightsChange(highlights.filter((_, idx) => idx !== i))}
                  bgClass="bg-muted/50 border border-border"
                />
              </li>
            ))}
          </ul>
        </CardContent>
      )}
    </Card>
  );
}

// ─── Main Page ────────────────────────────────────────────
export default function OptimizePage() {
  const router = useRouter();
  const resume = useResumeStore((s) => s.resume);
  const jobs = useResumeStore((s) => s.jobs);
  const currentJobId = useResumeStore((s) => s.currentJobId);
  const setCurrentJob = useResumeStore((s) => s.setCurrentJob);
  const removeJob = useResumeStore((s) => s.removeJob);
  const tailoredResumes = useResumeStore((s) => s.tailoredResumes);
  const currentTailoredId = useResumeStore((s) => s.currentTailoredId);
  const setCurrentTailored = useResumeStore((s) => s.setCurrentTailored);
  const optimizePrompts = useResumeStore((s) => s.optimizePrompts);
  const setOptimizePrompt = useResumeStore((s) => s.setOptimizePrompt);
  const apiConfig = useResumeStore((s) => s.apiConfig);
  const updateTailoredResume = useResumeStore((s) => s.updateTailoredResume);
  const updateWork = useResumeStore((s) => s.updateWork);
  const updateProject = useResumeStore((s) => s.updateProject);
  const updateCampus = useResumeStore((s) => s.updateCampus);
  const updateSkill = useResumeStore((s) => s.updateSkill);
  const updateEducation = useResumeStore((s) => s.updateEducation);

  const [rewritingAllIds, setRewritingAllIds] = useState<Set<string>>(new Set()); // tailored IDs
  const [rewritingIds, setRewritingIds] = useState<Set<string>>(new Set());
  const [polishingAllIds, setPolishingAllIds] = useState<Set<string>>(new Set()); // tailored IDs
  const [polishingIds, setPolishingIds] = useState<Set<string>>(new Set());
  const [optimizingSkillsIds, setOptimizingSkillsIds] = useState<Set<string>>(new Set()); // tailored IDs

  // Ref to check if user is still viewing the same job when async task completes
  const currentTailoredIdRef = useRef(currentTailoredId);
  useEffect(() => { currentTailoredIdRef.current = currentTailoredId; }, [currentTailoredId]);

  const [pendingRewrites, setPendingRewrites] = useState<Record<string, string[]>>({});
  const [acceptedRewrites, setAcceptedRewrites] = useState<Record<string, string[]>>({});
  const [pendingPolishes, setPendingPolishes] = useState<Record<string, string[]>>({});

  // Sync local display state when the active job changes
  useEffect(() => {
    const tailored = tailoredResumes.find((t) => t.id === currentTailoredId);
    setAcceptedRewrites(tailored?.rewrittenDescriptions || {});
    setPendingRewrites({});
    setPendingPolishes(tailored?.polishedDescriptions || {});
  }, [currentTailoredId]); // eslint-disable-line react-hooks/exhaustive-deps

  const currentJob = jobs.find((j) => j.id === currentJobId);
  const currentTailored = tailoredResumes.find((t) => t.id === currentTailoredId);
  const subStep = (currentTailored?.optimizeStep || 1) as 1 | 2;

  const selectedWork = resume.work.filter((w) =>
    currentTailored?.selectedWorkIds.includes(w.id)
  );
  const selectedCampus = (resume.campus || []).filter((c) =>
    (currentTailored?.selectedCampusIds || []).includes(c.id)
  );
  const selectedProjects = resume.projects.filter((p) =>
    currentTailored?.selectedProjectIds.includes(p.id)
  );
  const selectedEducation = resume.education.filter((e) =>
    (currentTailored?.selectedEducationIds || []).includes(e.id)
  );
  const selectedAwards = (resume.awards || []).filter((a) =>
    (currentTailored?.selectedAwardIds || []).includes(a.id)
  );
  const selectedCustomSections = (resume.customSections || []).filter((sec) =>
    (currentTailored?.selectedCustomSectionIds || []).includes(sec.id)
  );

  // 日期字符串 → startDate / endDate
  const parseDateRange = (s: string) => {
    const parts = s.split(/\s*[–\-]\s*/);
    return { startDate: parts[0]?.trim() ?? "", endDate: parts[1]?.trim() ?? "" };
  };

  const setSubStep = (step: 1 | 2) => {
    if (currentTailored) {
      updateTailoredResume(currentTailored.id, { optimizeStep: step });
    }
  };

  const analysis = currentTailored?.jdAnalysis;

  // ─── helpers ───────────────────────────────
  const savePendingRewrites = (next: Record<string, string[]>) => {
    setPendingRewrites(next);
    // 同时写入 acceptedRewrites，实现自动保存
    setAcceptedRewrites((prev) => ({ ...prev, ...next }));
    if (currentTailored) {
      updateTailoredResume(currentTailored.id, {
        rewrittenDescriptions: { ...acceptedRewrites, ...next },
      });
    }
  };

  const saveAcceptedRewrites = (next: Record<string, string[]>) => {
    setAcceptedRewrites(next);
    if (currentTailored) {
      updateTailoredResume(currentTailored.id, { rewrittenDescriptions: next });
    }
  };

  const savePendingPolishes = (next: Record<string, string[]>) => {
    setPendingPolishes(next);
    if (currentTailored) {
      updateTailoredResume(currentTailored.id, { polishedDescriptions: next });
    }
    // 自动写入 resume store
    Object.entries(next).forEach(([id, descs]) => {
      if (resume.work.find((w) => w.id === id)) updateWork(id, { descriptions: descs });
      if ((resume.campus || []).find((c) => c.id === id)) updateCampus(id, { descriptions: descs });
      if (resume.projects.find((p) => p.id === id)) updateProject(id, { descriptions: descs });
    });
  };

  // ─── Rewrite single ────────────────────────
  const handleRewriteSingle = async (id: string, descriptions: string[], itemType: "work" | "campus" | "project") => {
    if (!analysis || !currentJob) return;
    setRewritingIds((prev) => new Set(prev).add(id));

    const item = itemType === "work"
      ? selectedWork.find((w) => w.id === id)
      : itemType === "campus"
        ? selectedCampus.find((c) => c.id === id)
        : selectedProjects.find((p) => p.id === id);
    if (!item) {
      setRewritingIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
      return;
    }

    const header = itemType !== "project"
      ? `${"company" in item ? item.company : ""} - ${"title" in item ? item.title : ""}`
      : ("name" in item ? item.name : "");

    const resumePreview = `【${header}】(id:${id})\n${descriptions.map((d) => `- ${d}`).join("\n")}`;
    const allKeywords = [
      ...(analysis.hardSkills || []),
      ...(analysis.softSkills || []),
      ...(analysis.experienceKeywords || []),
    ];
    const prompt = optimizePrompts.resumeRewrite
      .replace("{resume_preview}", resumePreview)
      .replace("{job_description}", currentJob.rawText || "")
      .replace("{keywords}", allKeywords.join("、"))
      .replace("{ability_positioning}", analysis.abilityPositioning || "");

    try {
      const res = await fetch("/api/ai-optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "rewrite",
          prompt,
          work: itemType === "work" ? [item] : itemType === "campus" ? [item] : [],
          projects: itemType === "project" ? [item] : [],
          apiUrl: apiConfig.apiUrl,
          apiKey: apiConfig.apiKey,
          model: apiConfig.model,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        console.log("[rewriteSingle] API response:", data);
        if (data.rewrites?.[id]) {
          savePendingRewrites({ ...pendingRewrites, [id]: data.rewrites[id] });
        } else {
          console.warn("[rewriteSingle] No rewrites for id:", id, "rewrites keys:", Object.keys(data.rewrites || {}));
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        console.error("[rewriteSingle] API error:", res.status, errData);
      }
    } catch (e) {
      console.error("[rewriteSingle] fetch error:", e);
    }
    finally {
      setRewritingIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
    }
  };

  // ─── Rewrite all (experiences + skills) ────
  const handleRewriteAll = async () => {
    if (!analysis || !currentJob || !currentTailored) return;
    const tailoredId = currentTailored.id; // capture at call time
    setRewritingAllIds((prev) => new Set(prev).add(tailoredId));

    const resumePreview = [...selectedWork, ...selectedCampus, ...selectedProjects]
      .map((item) => {
        const isProject = "name" in item && !("company" in item);
        const header = isProject
          ? `${(item as any).name}`
          : `${(item as any).company} - ${(item as any).title}`;
        return `【${header}】(id:${item.id})\n${item.descriptions.map((d) => `- ${d}`).join("\n")}`;
      })
      .join("\n\n");

    const allKeywords = [
      ...(analysis.hardSkills || []),
      ...(analysis.softSkills || []),
      ...(analysis.experienceKeywords || []),
    ];

    const prompt = optimizePrompts.resumeRewrite
      .replace("{resume_preview}", resumePreview)
      .replace("{job_description}", currentJob.rawText || "")
      .replace("{keywords}", allKeywords.join("、"))
      .replace("{ability_positioning}", analysis.abilityPositioning || "");

    try {
      const res = await fetch("/api/ai-optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "rewrite",
          prompt,
          work: [...selectedWork, ...selectedCampus],
          projects: selectedProjects,
          apiUrl: apiConfig.apiUrl,
          apiKey: apiConfig.apiKey,
          model: apiConfig.model,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.rewrites) {
          // Always persist to store with the correct tailoredId
          const stored = useResumeStore.getState().tailoredResumes.find((t) => t.id === tailoredId);
          const merged = { ...(stored?.rewrittenDescriptions || {}), ...data.rewrites };
          updateTailoredResume(tailoredId, { rewrittenDescriptions: merged });
          // Only update local display state if the user is still viewing this job
          if (currentTailoredIdRef.current === tailoredId) {
            setPendingRewrites((prev) => ({ ...prev, ...data.rewrites }));
            setAcceptedRewrites(merged);
          }
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        console.error("[rewriteAll] API error:", res.status, errData);
      }
    } catch (e) {
      console.error("[rewriteAll] fetch error:", e);
    } finally {
      setRewritingAllIds((prev) => { const s = new Set(prev); s.delete(tailoredId); return s; });
    }

    // Also optimize skills (independent, fire-and-forget)
    if (resume.skills.length > 0) {
      handleOptimizeSkills();
    }
  };

  // ─── Accept / Reject rewrite ───────────────
  const rejectRewrite = (id: string) => {
    const next = { ...pendingRewrites };
    delete next[id];
    setPendingRewrites(next);
  };

  // ─── Polish single ─────────────────────────
  const handlePolishSingle = async (id: string, descriptions: string[]) => {
    setPolishingIds((prev) => new Set(prev).add(id));

    const prompt = optimizePrompts.languagePolish.replace(
      "{experience_content}",
      descriptions.map((d) => `- ${d}`).join("\n")
    );

    try {
      const res = await fetch("/api/ai-optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "polish",
          prompt,
          id,
          apiUrl: apiConfig.apiUrl,
          apiKey: apiConfig.apiKey,
          model: apiConfig.model,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.polished) {
          savePendingPolishes({ ...pendingPolishes, [id]: data.polished });
        }
      }
    } catch {}
    finally {
      setPolishingIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
    }
  };

  // ─── Polish all ────────────────────────────
  const handlePolishAll = async () => {
    if (!currentTailored) return;
    const tailoredId = currentTailored.id; // capture at call time
    const allItems = [
      ...selectedWork.map((w) => ({ id: w.id, descs: acceptedRewrites[w.id] || w.descriptions })),
      ...selectedCampus.map((c) => ({ id: c.id, descs: acceptedRewrites[c.id] || c.descriptions })),
      ...selectedProjects.map((p) => ({ id: p.id, descs: acceptedRewrites[p.id] || p.descriptions })),
    ];
    setPolishingAllIds((prev) => new Set(prev).add(tailoredId));
    setPolishingIds(new Set(allItems.map((i) => i.id)));

    const results = await Promise.allSettled(
      allItems.map(async ({ id, descs }) => {
        const prompt = optimizePrompts.languagePolish.replace(
          "{experience_content}",
          descs.map((d) => `- ${d}`).join("\n")
        );
        const res = await fetch("/api/ai-optimize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "polish", prompt, id,
            apiUrl: apiConfig.apiUrl, apiKey: apiConfig.apiKey, model: apiConfig.model,
          }),
        });
        if (!res.ok) return null;
        const data = await res.json();
        return data.polished ? { id, polished: data.polished as string[] } : null;
      })
    );

    // Merge onto store's current state (not stale local state)
    const stored = useResumeStore.getState().tailoredResumes.find((t) => t.id === tailoredId);
    const merged: Record<string, string[]> = { ...(stored?.polishedDescriptions || {}) };
    results.forEach((r) => {
      if (r.status === "fulfilled" && r.value) merged[r.value.id] = r.value.polished;
    });

    // Always persist to store
    updateTailoredResume(tailoredId, { polishedDescriptions: merged });
    // Auto-write to resume store
    Object.entries(merged).forEach(([id, descs]) => {
      if (resume.work.find((w) => w.id === id)) updateWork(id, { descriptions: descs });
      if ((resume.campus || []).find((c) => c.id === id)) updateCampus(id, { descriptions: descs });
      if (resume.projects.find((p) => p.id === id)) updateProject(id, { descriptions: descs });
    });

    // Only update local display state if still viewing this job
    if (currentTailoredIdRef.current === tailoredId) {
      setPendingPolishes(merged);
    }

    setPolishingIds(new Set());
    setPolishingAllIds((prev) => { const s = new Set(prev); s.delete(tailoredId); return s; });
  };

  // ─── Accept / Reject polish ────────────────
  const rejectPolish = (id: string) => {
    const next = { ...pendingPolishes };
    delete next[id];
    savePendingPolishes(next);
  };

  // ─── Skill optimize ────────────────────────
  const handleOptimizeSkills = async () => {
    if (!analysis || !currentJob || !currentTailored) return;
    const tailoredId = currentTailored.id; // capture at call time
    setOptimizingSkillsIds((prev) => new Set(prev).add(tailoredId));

    const skillsPreview = resume.skills
      .map((sk) => `${sk.category}：${sk.items.join("、")}`)
      .join("\n");
    const allKeywords = [
      ...(analysis.hardSkills || []),
      ...(analysis.softSkills || []),
      ...(analysis.experienceKeywords || []),
    ];

    const prompt = (optimizePrompts.skillOptimize ?? "")
      .replace("{skills_preview}", skillsPreview)
      .replace("{job_description}", currentJob.rawText || "")
      .replace("{keywords}", allKeywords.join("、"));

    try {
      const res = await fetch("/api/ai-optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "skill-optimize",
          prompt,
          apiUrl: apiConfig.apiUrl,
          apiKey: apiConfig.apiKey,
          model: apiConfig.model,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.skills) {
          const next: Record<string, string[]> = {};
          for (const sk of data.skills) {
            if (sk.id && Array.isArray(sk.items)) next[sk.id] = sk.items;
          }
          updateTailoredResume(tailoredId, { optimizedSkills: next });
        }
      }
    } catch (e) {
      console.error("[optimizeSkills] error:", e);
    } finally {
      setOptimizingSkillsIds((prev) => { const s = new Set(prev); s.delete(tailoredId); return s; });
    }
  };

  // ─── Guard ─────────────────────────────────
  if (!currentJob) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">请先完成岗位匹配</h3>
            <p className="text-muted-foreground mb-4 text-sm">
              返回上一步添加岗位并选择经历
            </p>
            <Button onClick={() => router.push("/tailor")}>返回岗位匹配</Button>
          </CardContent>
        </Card>
        <StepNavigation />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-foreground">第 4 步：AI 内容优化</h1>
        <p className="text-muted-foreground text-sm mt-1">
          AI 改写内容 → 语言润色
        </p>
      </div>

      {/* Job tabs */}
      <div className="mb-5 flex items-center gap-2 flex-wrap">
        {jobs.map((job) => {
          const tid = tailoredResumes.find((t) => t.jobId === job.id)?.id || "";
          const jobIsBusy = rewritingAllIds.has(tid) || polishingAllIds.has(tid) || optimizingSkillsIds.has(tid);
          return (
          <div
            key={job.id}
            className={`group relative px-3 py-1.5 rounded-lg text-sm border transition-all ${
              currentJobId === job.id
                ? "border-primary bg-primary/5 text-primary"
                : "border-border hover:border-primary/30"
            }`}
          >
            <button
              onClick={() => {
                setCurrentJob(job.id);
                const existing = tailoredResumes.find((t) => t.jobId === job.id);
                if (existing) setCurrentTailored(existing.id);
              }}
              className="pr-6 flex items-center gap-1.5"
            >
              {jobIsBusy && <Loader2 className="w-3 h-3 animate-spin shrink-0" />}
              {job.company} - {job.title}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`确定删除岗位「${job.company} - ${job.title}」吗？`)) {
                  removeJob(job.id);
                  if (currentJobId === job.id) setCurrentJob(jobs.length > 1 ? jobs[0].id : null);
                }
              }}
              className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/10 rounded"
              title="删除岗位"
            >
              <X className="w-3 h-3 text-destructive" />
            </button>
          </div>
          );
        })}
      </div>

      <SubStepBar current={subStep} onSelect={setSubStep} />

      {/* ════════════ Sub-step 1: Rewrite ════════════ */}
      {subStep === 1 && (
        <div>
          {!analysis ? (
            <Card className="mb-6">
              <CardContent className="py-8 text-center">
                <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">需要先完成岗位分析</h3>
                <p className="text-muted-foreground mb-4 text-sm">
                  请先返回「第 2 步：岗位分析」完成 JD 分析
                </p>
                <Button onClick={() => router.push("/analyze")}>前往岗位分析</Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* JD 关键词摘要 */}
              <Card className="mb-4">
                <CardHeader className="py-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm">
                      目标：{currentJob.company} - {currentJob.title}
                    </h3>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      ...(analysis.hardSkills || []),
                      ...(analysis.softSkills || []),
                      ...(analysis.experienceKeywords || []),
                    ].map((kw, i) => (
                      <Badge key={i}>{kw}</Badge>
                    ))}
                    <Badge variant="warning">
                      定位: {analysis.abilityPositioning}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Prompt + 一键改写 */}
              <div className="flex items-center justify-between mb-4">
                <PromptEditor
                  label="内容改写"
                  value={optimizePrompts.resumeRewrite}
                  onChange={(v) => setOptimizePrompt("resumeRewrite", v)}
                  placeholders={["{resume_preview}", "{job_description}", "{keywords}", "{ability_positioning}"]}
                />
                <Button onClick={handleRewriteAll} disabled={rewritingAllIds.has(currentTailoredId || "")} size="lg">
                  {rewritingAllIds.has(currentTailoredId || "") ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> 改写中...</>
                  ) : Object.keys(acceptedRewrites).length > 0 ? (
                    <><RefreshCw className="w-4 h-4" /> 重新改写全部</>
                  ) : (
                    <><Sparkles className="w-4 h-4" /> 一键改写全部</>
                  )}
                </Button>
              </div>

              {/* 经历卡片 */}
              <div className="space-y-4">
                {/* 教育经历：仅展示+可编辑，不参与 AI 改写 */}
                {selectedEducation.map((e) => (
                  <EducationDisplayCard
                    key={e.id}
                    school={e.school}
                    onSchoolChange={(v) => updateEducation(e.id, { school: v })}
                    degree={e.degree}
                    onDegreeChange={(v) => updateEducation(e.id, { degree: v })}
                    major={e.major}
                    onMajorChange={(v) => updateEducation(e.id, { major: v })}
                    dateRange={`${e.startDate} - ${e.endDate}`}
                    onDateChange={(v) => { const d = parseDateRange(v); updateEducation(e.id, d); }}
                    gpa={e.gpa ?? ""}
                    onGpaChange={(v) => updateEducation(e.id, { gpa: v })}
                    highlights={e.highlights}
                    onHighlightsChange={(h) => updateEducation(e.id, { highlights: h })}
                  />
                ))}
                {selectedWork.map((w) => (
                  <ExperienceReviewCard
                    key={w.id}
                    typeLabel="工作经历"
                    orgName={w.company}
                    onOrgNameChange={(v) => updateWork(w.id, { company: v })}
                    role={w.title}
                    onRoleChange={(v) => updateWork(w.id, { title: v })}
                    dateRange={`${w.startDate} - ${w.endDate}`}
                    onDateChange={(v) => { const d = parseDateRange(v); updateWork(w.id, d); }}
                    location={w.location}
                    onLocationChange={(v) => updateWork(w.id, { location: v })}
                    originalDescs={w.descriptions}
                    pendingDescs={pendingRewrites[w.id] || null}
                    mode="rewrite"
                    isProcessing={rewritingIds.has(w.id)}
                    onAction={() => handleRewriteSingle(w.id, w.descriptions, "work")}
                    onChangePending={(descs) => savePendingRewrites({ ...pendingRewrites, [w.id]: descs })}
                  />
                ))}
                {selectedCampus.map((c) => (
                  <ExperienceReviewCard
                    key={c.id}
                    typeLabel="校园经历"
                    orgName={c.company}
                    onOrgNameChange={(v) => updateCampus(c.id, { company: v })}
                    role={c.title}
                    onRoleChange={(v) => updateCampus(c.id, { title: v })}
                    dateRange={`${c.startDate} - ${c.endDate}`}
                    onDateChange={(v) => { const d = parseDateRange(v); updateCampus(c.id, d); }}
                    location={c.location}
                    onLocationChange={(v) => updateCampus(c.id, { location: v })}
                    originalDescs={c.descriptions}
                    pendingDescs={pendingRewrites[c.id] || null}
                    mode="rewrite"
                    isProcessing={rewritingIds.has(c.id)}
                    onAction={() => handleRewriteSingle(c.id, c.descriptions, "campus")}
                    onChangePending={(descs) => savePendingRewrites({ ...pendingRewrites, [c.id]: descs })}
                  />
                ))}
                {selectedProjects.map((p) => (
                  <ExperienceReviewCard
                    key={p.id}
                    typeLabel="项目经历"
                    orgName={p.name}
                    onOrgNameChange={(v) => updateProject(p.id, { name: v })}
                    role={p.role ?? ""}
                    onRoleChange={(v) => updateProject(p.id, { role: v })}
                    dateRange={`${p.startDate} - ${p.endDate}`}
                    onDateChange={(v) => { const d = parseDateRange(v); updateProject(p.id, d); }}
                    location={p.location ?? ""}
                    onLocationChange={(v) => updateProject(p.id, { location: v })}
                    originalDescs={p.descriptions}
                    pendingDescs={pendingRewrites[p.id] || null}
                    mode="rewrite"
                    isProcessing={rewritingIds.has(p.id)}
                    onAction={() => handleRewriteSingle(p.id, p.descriptions, "project")}
                    onChangePending={(descs) => savePendingRewrites({ ...pendingRewrites, [p.id]: descs })}
                  />
                ))}
              </div>

              {/* 专业技能优化 */}
              {resume.skills.length > 0 && (
                <Card>
                  <CardHeader className="py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">专业技能</Badge>
                        <span className="font-medium text-sm">补充 JD 技能关键词</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleOptimizeSkills}
                        disabled={optimizingSkillsIds.has(currentTailoredId || "")}
                      >
                        {optimizingSkillsIds.has(currentTailoredId || "") ? (
                          <><Loader2 className="w-3 h-3 animate-spin" /> 优化中...</>
                        ) : (
                          <><Sparkles className="w-3 h-3" /> AI 补充技能词</>
                        )}
                      </Button>
                    </div>
                    <PromptEditor
                      label="技能优化"
                      value={optimizePrompts.skillOptimize ?? ""}
                      onChange={(v) => setOptimizePrompt("skillOptimize", v)}
                      placeholders={["{skills_preview}", "{job_description}", "{keywords}"]}
                    />
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      {/* 左：原版 */}
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1.5">原版</p>
                        <div className="space-y-1.5">
                          {resume.skills.map((sk) => (
                            <div key={sk.id} className="text-xs p-2 rounded bg-accent/50 border border-border/50 leading-relaxed">
                              <span className="font-medium">{sk.category}：</span>
                              {sk.items.join("、")}
                            </div>
                          ))}
                        </div>
                      </div>
                      {/* 右：AI 补充后 */}
                      <div>
                        <p className="text-xs font-medium text-primary mb-1.5">AI 补充后</p>
                        {currentTailored?.optimizedSkills && Object.keys(currentTailored.optimizedSkills).length > 0 ? (
                          <div className="space-y-1.5">
                            {resume.skills.map((sk) => {
                              const optimized = currentTailored.optimizedSkills?.[sk.id];
                              return (
                                <div key={sk.id} className="text-xs p-2 rounded bg-green-50 border border-green-200 leading-relaxed">
                                  <span className="font-medium">{sk.category}：</span>
                                  {optimized ? optimized.join("、") : sk.items.join("、")}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="h-full min-h-[60px] flex items-center justify-center border-2 border-dashed border-border rounded-lg p-4 text-xs text-muted-foreground">
                            点击「AI 补充技能词」或「一键改写全部」生成
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 荣誉奖项 & 其他模块：仅展示，不参与改写 */}
              {selectedAwards.length > 0 && (
                <Card>
                  <CardHeader className="py-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">荣誉奖项</Badge>
                      <span className="text-xs text-muted-foreground">（仅展示，不参与 AI 改写）</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {selectedAwards.map((a) => (
                        <li key={a.id} className="text-sm flex gap-1.5">
                          <span className="text-muted-foreground">•</span>
                          {a.name}{a.date ? ` (${a.date})` : ""}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
              {selectedCustomSections.map((sec) => (
                <Card key={sec.id}>
                  <CardHeader className="py-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{sec.title}</Badge>
                      <span className="text-xs text-muted-foreground">（仅展示，不参与 AI 改写）</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      {sec.items.map((item) => (
                        <div key={item.id} className="text-sm">
                          <span className="font-medium">{item.heading}</span>
                          {item.subheading && <span className="text-muted-foreground ml-1">· {item.subheading}</span>}
                          {item.date && <span className="text-muted-foreground ml-1">({item.date})</span>}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}

              <div className="mt-6 flex justify-end">
                <Button onClick={() => setSubStep(2)}>
                  进入语言润色 <Sparkles className="w-4 h-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ════════════ Sub-step 2: Polish ════════════ */}
      {subStep === 2 && (
        <div>
          {/* Prompt + 一键润色 */}
          <div className="flex items-center justify-between mb-4">
            <PromptEditor
              label="语言润色"
              value={optimizePrompts.languagePolish}
              onChange={(v) => setOptimizePrompt("languagePolish", v)}
              placeholders={["{experience_content}"]}
            />
            <Button onClick={handlePolishAll} disabled={polishingAllIds.has(currentTailoredId || "")} size="lg">
              {polishingAllIds.has(currentTailoredId || "") ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> 润色中...</>
              ) : Object.keys(pendingPolishes).length > 0 ? (
                <><RefreshCw className="w-4 h-4" /> 重新润色全部</>
              ) : (
                <><Wand2 className="w-4 h-4" /> 一键润色全部</>
              )}
            </Button>
          </div>

          {/* 经历卡片 */}
          <div className="space-y-4">
            {/* 教育经历：仅展示，不参与润色 */}
            {selectedEducation.map((e) => (
              <EducationDisplayCard
                key={e.id}
                school={e.school}
                onSchoolChange={(v) => updateEducation(e.id, { school: v })}
                degree={e.degree}
                onDegreeChange={(v) => updateEducation(e.id, { degree: v })}
                major={e.major}
                onMajorChange={(v) => updateEducation(e.id, { major: v })}
                dateRange={`${e.startDate} - ${e.endDate}`}
                onDateChange={(v) => { const d = parseDateRange(v); updateEducation(e.id, d); }}
                gpa={e.gpa ?? ""}
                onGpaChange={(v) => updateEducation(e.id, { gpa: v })}
                highlights={e.highlights}
                onHighlightsChange={(h) => updateEducation(e.id, { highlights: h })}
              />
            ))}
            {selectedWork.map((w) => (
              <ExperienceReviewCard
                key={w.id}
                typeLabel="工作经历"
                orgName={w.company}
                onOrgNameChange={(v) => updateWork(w.id, { company: v })}
                role={w.title}
                onRoleChange={(v) => updateWork(w.id, { title: v })}
                dateRange={`${w.startDate} - ${w.endDate}`}
                onDateChange={(v) => { const d = parseDateRange(v); updateWork(w.id, d); }}
                location={w.location}
                onLocationChange={(v) => updateWork(w.id, { location: v })}
                originalDescs={acceptedRewrites[w.id] || w.descriptions}
                pendingDescs={pendingPolishes[w.id] || null}
                mode="polish"
                isProcessing={polishingIds.has(w.id)}
                onAction={() => handlePolishSingle(w.id, acceptedRewrites[w.id] || w.descriptions)}
                onChangePending={(descs) => savePendingPolishes({ ...pendingPolishes, [w.id]: descs })}
              />
            ))}
            {selectedCampus.map((c) => (
              <ExperienceReviewCard
                key={c.id}
                typeLabel="校园经历"
                orgName={c.company}
                onOrgNameChange={(v) => updateCampus(c.id, { company: v })}
                role={c.title}
                onRoleChange={(v) => updateCampus(c.id, { title: v })}
                dateRange={`${c.startDate} - ${c.endDate}`}
                onDateChange={(v) => { const d = parseDateRange(v); updateCampus(c.id, d); }}
                location={c.location}
                onLocationChange={(v) => updateCampus(c.id, { location: v })}
                originalDescs={acceptedRewrites[c.id] || c.descriptions}
                pendingDescs={pendingPolishes[c.id] || null}
                mode="polish"
                isProcessing={polishingIds.has(c.id)}
                onAction={() => handlePolishSingle(c.id, acceptedRewrites[c.id] || c.descriptions)}
                onChangePending={(descs) => savePendingPolishes({ ...pendingPolishes, [c.id]: descs })}
              />
            ))}
            {selectedProjects.map((p) => (
              <ExperienceReviewCard
                key={p.id}
                typeLabel="项目经历"
                orgName={p.name}
                onOrgNameChange={(v) => updateProject(p.id, { name: v })}
                role={p.role ?? ""}
                onRoleChange={(v) => updateProject(p.id, { role: v })}
                dateRange={`${p.startDate} - ${p.endDate}`}
                onDateChange={(v) => { const d = parseDateRange(v); updateProject(p.id, d); }}
                location={p.location ?? ""}
                onLocationChange={(v) => updateProject(p.id, { location: v })}
                originalDescs={acceptedRewrites[p.id] || p.descriptions}
                pendingDescs={pendingPolishes[p.id] || null}
                mode="polish"
                isProcessing={polishingIds.has(p.id)}
                onAction={() => handlePolishSingle(p.id, acceptedRewrites[p.id] || p.descriptions)}
                onChangePending={(descs) => savePendingPolishes({ ...pendingPolishes, [p.id]: descs })}
              />
            ))}
            {/* 荣誉奖项 & 其他模块：仅展示，不参与润色 */}
            {selectedAwards.length > 0 && (
              <Card>
                <CardHeader className="py-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">荣誉奖项</Badge>
                    <span className="text-xs text-muted-foreground">（仅展示，不参与语言润色）</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {selectedAwards.map((a) => (
                      <li key={a.id} className="text-sm flex gap-1.5">
                        <span className="text-muted-foreground">•</span>
                        {a.name}{a.date ? ` (${a.date})` : ""}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
            {selectedCustomSections.map((sec) => (
              <Card key={sec.id}>
                <CardHeader className="py-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{sec.title}</Badge>
                    <span className="text-xs text-muted-foreground">（仅展示，不参与语言润色）</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {sec.items.map((item) => (
                      <div key={item.id} className="text-sm">
                        <span className="font-medium">{item.heading}</span>
                        {item.subheading && <span className="text-muted-foreground ml-1">· {item.subheading}</span>}
                        {item.date && <span className="text-muted-foreground ml-1">({item.date})</span>}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <StepNavigation nextLabel="下一步：预览导出" />
    </div>
  );
}
