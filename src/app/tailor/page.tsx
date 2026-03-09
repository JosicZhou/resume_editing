"use client";

import { useState, useEffect } from "react";
import { useResumeStore } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Badge from "@/components/ui/Badge";
import StepNavigation from "@/components/layout/StepNavigation";
import {
  Target,
  Plus,
  GripVertical,
  Check,
  ChevronDown,
  ChevronRight,
  X,
  Sparkles,
  Loader2,
  AlertCircle,
  Trophy,
  RefreshCw,
} from "lucide-react";
import { generateId, type JobDescription, type Award } from "@/lib/types";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// ── Simple selectable card (no drag, e.g. education / awards) ────────────────
function SelectableCard({
  title,
  subtitle,
  tags,
  selected,
  onToggle,
  onDelete,
}: {
  title: string;
  subtitle: string;
  tags?: string[];
  selected: boolean;
  onToggle: () => void;
  onDelete?: () => void;
}) {
  return (
    <div
      className={`border rounded-lg p-3 transition-all cursor-pointer ${
        selected
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-border bg-card hover:border-primary/30"
      }`}
      onClick={onToggle}
    >
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-medium text-sm truncate">{title}</p>
            <div className="flex items-center gap-1 shrink-0">
              {onDelete && (
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(); }}
                  className="p-0.5 hover:bg-destructive/10 rounded text-muted-foreground hover:text-destructive transition-colors"
                  title="删除"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <div
                className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                  selected ? "border-primary bg-primary" : "border-border"
                }`}
              >
                {selected && <Check className="w-3 h-3 text-white" />}
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Draggable selectable card (work / campus / project) ──────────────────────
function DraggableExperienceCard({
  id,
  title,
  subtitle,
  tags,
  selected,
  onToggle,
}: {
  id: string;
  title: string;
  subtitle: string;
  tags: string[];
  selected: boolean;
  onToggle: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border rounded-lg p-3 transition-all cursor-pointer ${
        selected
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-border bg-card hover:border-primary/30"
      }`}
      onClick={onToggle}
    >
      <div className="flex items-start gap-2">
        <div {...attributes} {...listeners} className="mt-1 cursor-grab">
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="font-medium text-sm truncate">{title}</p>
            <div
              className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                selected ? "border-primary bg-primary" : "border-border"
              }`}
            >
              {selected && <Check className="w-3 h-3 text-white" />}
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {tags.slice(0, 4).map((tag) => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Right-panel module preview card ─────────────────────────────────────────
function ResumeModuleCard({
  title,
  items,
  editable,
  onTitleChange,
}: {
  title: string;
  items: { title: string; subtitle: string }[];
  editable?: boolean;
  onTitleChange?: (title: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  return (
    <div className="border border-border rounded-lg bg-card">
      <div
        className="flex items-center gap-2 px-3 py-2 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        )}
        {editable && onTitleChange ? (
          <input
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            className="font-semibold text-sm bg-transparent border-none outline-none flex-1"
          />
        ) : (
          <span className="font-semibold text-sm">{title}</span>
        )}
        <Badge variant="secondary">{items.length}</Badge>
      </div>
      {expanded && items.length > 0 && (
        <div className="px-3 pb-3 space-y-1.5">
          {items.map((item, i) => (
            <div
              key={i}
              className="text-xs p-2 rounded bg-accent/50 border border-border/50"
            >
              <p className="font-medium">{item.title}</p>
              <p className="text-muted-foreground">{item.subtitle}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Section label ────────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
      {children}
    </h3>
  );
}

// ── Add-award inline form ────────────────────────────────────────────────────
function AddAwardRow({ onAdd }: { onAdd: (a: Award) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [desc, setDesc] = useState("");

  const submit = () => {
    if (!name.trim()) return;
    onAdd({ id: generateId(), name: name.trim(), date: date.trim(), description: desc.trim() || undefined });
    setName(""); setDate(""); setDesc(""); setOpen(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs text-primary hover:underline mt-1"
      >
        <Plus className="w-3.5 h-3.5" /> 添加获奖记录
      </button>
    );
  }

  return (
    <div className="border border-border rounded-lg p-3 space-y-2 bg-card mt-1">
      <Input
        placeholder="奖项名称（必填）"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Input
        placeholder="获奖时间，如 2024.06"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
      <Input
        placeholder="补充说明（选填）"
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
      />
      <div className="flex gap-2">
        <Button size="sm" onClick={submit}>添加</Button>
        <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>取消</Button>
      </div>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function TailorPage() {
  const resume = useResumeStore((s) => s.resume);
  const jobs = useResumeStore((s) => s.jobs);
  const addJob = useResumeStore((s) => s.addJob);
  const removeJob = useResumeStore((s) => s.removeJob);
  const currentJobId = useResumeStore((s) => s.currentJobId);
  const setCurrentJob = useResumeStore((s) => s.setCurrentJob);
  const createTailoredResume = useResumeStore((s) => s.createTailoredResume);
  const tailoredResumes = useResumeStore((s) => s.tailoredResumes);
  const currentTailoredId = useResumeStore((s) => s.currentTailoredId);
  const updateTailoredResume = useResumeStore((s) => s.updateTailoredResume);
  const setCurrentTailored = useResumeStore((s) => s.setCurrentTailored);
  const apiConfig = useResumeStore((s) => s.apiConfig);
  const addAward = useResumeStore((s) => s.addAward);
  const removeAward = useResumeStore((s) => s.removeAward);

  const [newJobText, setNewJobText] = useState("");
  const [newJobTitle, setNewJobTitle] = useState("");
  const [newJobCompany, setNewJobCompany] = useState("");
  const [showAddJob, setShowAddJob] = useState(false);
  const [matchingJobIds, setMatchingJobIds] = useState<Set<string>>(new Set());
  const [matchErrors, setMatchErrors] = useState<Record<string, string>>({});

  // Reset only UI-only state (not in-progress tasks) on job switch
  useEffect(() => {
    setShowAddJob(false);
  }, [currentTailoredId]);

  const currentJob = jobs.find((j) => j.id === currentJobId);
  const currentTailored = tailoredResumes.find((t) => t.id === currentTailoredId);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
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
    createTailoredResume(job.id);
    setNewJobText(""); setNewJobTitle(""); setNewJobCompany(""); setShowAddJob(false);
  };

  // ── toggle helpers ──────────────────────────────────────────────────────────
  const toggleWork = (id: string) => {
    if (!currentTailored) return;
    const ids = currentTailored.selectedWorkIds.includes(id)
      ? currentTailored.selectedWorkIds.filter((w) => w !== id)
      : [...currentTailored.selectedWorkIds, id];
    updateTailoredResume(currentTailored.id, { selectedWorkIds: ids });
  };

  const toggleCampus = (id: string) => {
    if (!currentTailored) return;
    const cur = currentTailored.selectedCampusIds || [];
    const ids = cur.includes(id) ? cur.filter((c) => c !== id) : [...cur, id];
    updateTailoredResume(currentTailored.id, { selectedCampusIds: ids });
  };

  const toggleProject = (id: string) => {
    if (!currentTailored) return;
    const ids = currentTailored.selectedProjectIds.includes(id)
      ? currentTailored.selectedProjectIds.filter((p) => p !== id)
      : [...currentTailored.selectedProjectIds, id];
    updateTailoredResume(currentTailored.id, { selectedProjectIds: ids });
  };

  const toggleEducation = (id: string) => {
    if (!currentTailored) return;
    const cur = currentTailored.selectedEducationIds || [];
    const ids = cur.includes(id) ? cur.filter((e) => e !== id) : [...cur, id];
    updateTailoredResume(currentTailored.id, { selectedEducationIds: ids });
  };

  const toggleAward = (id: string) => {
    if (!currentTailored) return;
    const cur = currentTailored.selectedAwardIds || [];
    const ids = cur.includes(id) ? cur.filter((a) => a !== id) : [...cur, id];
    updateTailoredResume(currentTailored.id, { selectedAwardIds: ids });
  };

  const toggleSkill = (id: string) => {
    if (!currentTailored) return;
    const cur = currentTailored.selectedSkillIds || [];
    const ids = cur.includes(id) ? cur.filter((s) => s !== id) : [...cur, id];
    updateTailoredResume(currentTailored.id, { selectedSkillIds: ids });
  };

  const toggleCustomSection = (id: string) => {
    if (!currentTailored) return;
    const cur = currentTailored.selectedCustomSectionIds || [];
    const ids = cur.includes(id) ? cur.filter((s) => s !== id) : [...cur, id];
    updateTailoredResume(currentTailored.id, { selectedCustomSectionIds: ids });
  };

  // When a new award is added from the tailor page, auto-select it
  const handleAddAward = (award: Award) => {
    addAward(award);
    if (currentTailored) {
      const cur = currentTailored.selectedAwardIds || [];
      updateTailoredResume(currentTailored.id, { selectedAwardIds: [...cur, award.id] });
    }
  };

  // When deleting an award, also remove from selection
  const handleRemoveAward = (id: string) => {
    removeAward(id);
    if (currentTailored) {
      const cur = currentTailored.selectedAwardIds || [];
      updateTailoredResume(currentTailored.id, { selectedAwardIds: cur.filter((a) => a !== id) });
    }
  };

  // ── AI match ────────────────────────────────────────────────────────────────
  const handleAiMatch = async () => {
    if (!currentJob || !currentTailored) return;
    if (!apiConfig.apiUrl?.trim() || !apiConfig.apiKey?.trim() || !apiConfig.model?.trim()) {
      setMatchErrors((prev) => ({ ...prev, [currentJob.id]: "请先在右上角「API 设置」中配置 API 信息" }));
      return;
    }
    if (!currentTailored.jdAnalysis) {
      setMatchErrors((prev) => ({ ...prev, [currentJob.id]: "请先在「第 2 步：岗位分析」中完成 JD 分析" }));
      return;
    }

    // Capture IDs at call time so background task writes to correct job
    const jobId = currentJob.id;
    const tailoredId = currentTailored.id;
    const jdAnalysis = currentTailored.jdAnalysis;

    setMatchingJobIds((prev) => new Set(prev).add(jobId));
    setMatchErrors((prev) => { const n = { ...prev }; delete n[jobId]; return n; });
    try {
      const workList = resume.work.map((w, i) => ({
        id: w.id, index: i + 1, type: "工作/实习",
        title: `${w.company} - ${w.title}`, period: `${w.startDate} - ${w.endDate}`,
        descriptions: w.descriptions.join("\n"), tags: w.tags.join(", "),
      }));
      const campusList = (resume.campus || []).map((c, i) => ({
        id: c.id, index: i + 1, type: "校园经历",
        title: `${c.company} - ${c.title}`, period: `${c.startDate} - ${c.endDate}`,
        descriptions: c.descriptions.join("\n"), tags: c.tags.join(", "),
      }));
      const projectList = resume.projects.map((p, i) => ({
        id: p.id, index: i + 1, type: "项目",
        title: p.name, period: `${p.startDate} - ${p.endDate}`,
        descriptions: p.descriptions.join("\n"), tags: [...p.techStack, ...p.tags].join(", "),
      }));
      const allExperiences = [...workList, ...campusList, ...projectList];

      const prompt = `你是一个专业的简历顾问。请根据岗位 JD 分析结果，从候选人的经历中选择最相关的经历。

岗位信息：
公司：${currentJob.company}
岗位：${currentJob.title}

JD 分析结果：
${jdAnalysis}

候选人的所有经历：
${allExperiences.map((exp) => `
【${exp.type} ${exp.index}】
ID: ${exp.id}
标题: ${exp.title}
时间: ${exp.period}
描述: ${exp.descriptions}
标签: ${exp.tags}
`).join("\n")}

请根据以下原则选择经历：
1. 选择与岗位要求最相关的经历
2. 确保简历的垂直度，避免包含不相关的经历
3. 优先选择能体现 JD 中提到的硬技能、软能力和相关经验的经历
4. 选择能解决岗位痛点的经历

请以 JSON 格式输出选中的经历 ID 列表，格式如下：
{
  "selectedWorkIds": ["work_id_1", "work_id_2"],
  "selectedCampusIds": ["campus_id_1"],
  "selectedProjectIds": ["project_id_1"],
  "reason": "选择理由的简短说明"
}`;

      const res = await fetch("/api/ai-optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "match-experiences", prompt,
          apiUrl: apiConfig.apiUrl, apiKey: apiConfig.apiKey, model: apiConfig.model,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMatchErrors((prev) => ({ ...prev, [jobId]: data.error || data.detail || "匹配失败" }));
        return;
      }
      if (data.match) {
        updateTailoredResume(tailoredId, {
          selectedWorkIds: data.match.selectedWorkIds || [],
          selectedCampusIds: data.match.selectedCampusIds || [],
          selectedProjectIds: data.match.selectedProjectIds || [],
        });
      } else {
        setMatchErrors((prev) => ({ ...prev, [jobId]: "AI 返回的数据格式不正确，请重试" }));
      }
    } catch (err) {
      setMatchErrors((prev) => ({ ...prev, [jobId]: err instanceof Error ? err.message : "请求失败" }));
    } finally {
      setMatchingJobIds((prev) => { const s = new Set(prev); s.delete(jobId); return s; });
    }
  };

  // ── derived selections ──────────────────────────────────────────────────────
  const selectedWork = resume.work.filter((w) => currentTailored?.selectedWorkIds.includes(w.id));
  const selectedCampus = (resume.campus || []).filter((c) => (currentTailored?.selectedCampusIds || []).includes(c.id));
  const selectedProjects = resume.projects.filter((p) => currentTailored?.selectedProjectIds.includes(p.id));
  const selectedEducation = resume.education.filter((e) => (currentTailored?.selectedEducationIds || []).includes(e.id));
  const selectedAwards = (resume.awards || []).filter((a) => (currentTailored?.selectedAwardIds || []).includes(a.id));

  // AI match button state for current job
  const isMatching = matchingJobIds.has(currentJobId || "");
  const matchError = matchErrors[currentJobId || ""] || null;

  // AI match button: show "重新匹配" if not all entries are selected (AI already ran)
  const totalEntries = resume.work.length + (resume.campus || []).length + resume.projects.length;
  const selectedEntries = selectedWork.length + selectedCampus.length + selectedProjects.length;
  const aiMatchedBefore = totalEntries > 0 && selectedEntries < totalEntries;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">第 3 步：岗位匹配</h1>
        <p className="text-muted-foreground text-sm mt-1">
          从简历库中选择最匹配的模块，AI 智能推荐经历垂直度最高的组合
        </p>
      </div>

      {/* Job tabs */}
      <div className="mb-5 flex items-center gap-2 flex-wrap">
        {jobs.map((job) => {
          const jobIsMatching = matchingJobIds.has(job.id);
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
                else createTailoredResume(job.id);
              }}
              className="pr-6 flex items-center gap-1.5"
            >
              {jobIsMatching && <Loader2 className="w-3 h-3 animate-spin shrink-0" />}
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
        <Button variant="outline" size="sm" onClick={() => setShowAddJob(!showAddJob)}>
          <Plus className="w-4 h-4" /> 添加岗位
        </Button>
      </div>

      {/* Add job form */}
      {showAddJob && (
        <Card className="mb-6">
          <CardContent className="py-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">岗位名称</label>
                <Input value={newJobTitle} onChange={(e) => setNewJobTitle(e.target.value)} placeholder="如：产品经理" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">公司名称</label>
                <Input value={newJobCompany} onChange={(e) => setNewJobCompany(e.target.value)} placeholder="如：字节跳动" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">岗位描述 (JD)</label>
              <Textarea value={newJobText} onChange={(e) => setNewJobText(e.target.value)} placeholder="粘贴完整的岗位描述..." rows={8} />
            </div>
            {newJobText && (
              <div>
                <p className="text-sm font-medium mb-2">提取的关键词：</p>
                <div className="flex flex-wrap gap-1.5">
                  {extractKeywords(newJobText).map((kw) => <Badge key={kw}>{kw}</Badge>)}
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <Button onClick={handleAddJob}>确认添加</Button>
              <Button variant="ghost" onClick={() => setShowAddJob(false)}>取消</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Two-panel layout */}
      {currentJob && currentTailored && !showAddJob && (
        <div className="grid grid-cols-2 gap-6">
          {/* ── Left: full resume library ────────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                简历库（点击勾选 / 取消）
              </h2>
              <Button variant="outline" size="sm" onClick={handleAiMatch} disabled={isMatching}>
                {isMatching ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> AI 匹配中...</>
                ) : aiMatchedBefore ? (
                  <><RefreshCw className="w-4 h-4" /> 重新匹配</>
                ) : (
                  <><Sparkles className="w-4 h-4" /> AI 智能匹配</>
                )}
              </Button>
            </div>

            {matchError && (
              <div className="mb-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{matchError}</p>
              </div>
            )}

            <DndContext sensors={sensors} collisionDetection={closestCenter}>
              {/* 教育经历 */}
              {resume.education.length > 0 && (
                <div className="mb-4">
                  <SectionLabel>教育经历</SectionLabel>
                  <div className="space-y-2">
                    {resume.education.map((e) => (
                      <SelectableCard
                        key={e.id}
                        title={e.school}
                        subtitle={`${e.degree}　${e.major}　${e.startDate} - ${e.endDate}`}
                        tags={e.rankTags}
                        selected={(currentTailored.selectedEducationIds || []).includes(e.id)}
                        onToggle={() => toggleEducation(e.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* 工作/实习经历 */}
              {resume.work.length > 0 && (
                <div className="mb-4">
                  <SectionLabel>工作 / 实习经历</SectionLabel>
                  <SortableContext items={resume.work.map((w) => w.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2">
                      {resume.work.map((w) => (
                        <DraggableExperienceCard
                          key={w.id} id={w.id}
                          title={`${w.company} - ${w.title}`}
                          subtitle={`${w.startDate} - ${w.endDate}`}
                          tags={w.tags}
                          selected={currentTailored.selectedWorkIds.includes(w.id)}
                          onToggle={() => toggleWork(w.id)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </div>
              )}

              {/* 校园经历 */}
              {(resume.campus || []).length > 0 && (
                <div className="mb-4">
                  <SectionLabel>校园经历</SectionLabel>
                  <SortableContext items={(resume.campus || []).map((c) => c.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2">
                      {(resume.campus || []).map((c) => (
                        <DraggableExperienceCard
                          key={c.id} id={c.id}
                          title={`${c.company} - ${c.title}`}
                          subtitle={`${c.startDate} - ${c.endDate}`}
                          tags={c.tags}
                          selected={(currentTailored.selectedCampusIds || []).includes(c.id)}
                          onToggle={() => toggleCampus(c.id)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </div>
              )}

              {/* 项目经历 */}
              {resume.projects.length > 0 && (
                <div className="mb-4">
                  <SectionLabel>项目经历</SectionLabel>
                  <SortableContext items={resume.projects.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2">
                      {resume.projects.map((p) => (
                        <DraggableExperienceCard
                          key={p.id} id={p.id}
                          title={p.name}
                          subtitle={`${p.startDate} - ${p.endDate}${p.role ? ` | ${p.role}` : ""}`}
                          tags={[...p.tags, ...p.techStack]}
                          selected={currentTailored.selectedProjectIds.includes(p.id)}
                          onToggle={() => toggleProject(p.id)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </div>
              )}
            </DndContext>

            {/* 专业技能（可勾选） */}
            {resume.skills.length > 0 && (
              <div className="mb-4">
                <SectionLabel>专业技能</SectionLabel>
                <div className="space-y-2">
                  {resume.skills.map((sk) => (
                    <SelectableCard
                      key={sk.id}
                      title={sk.category}
                      subtitle={sk.items.join("、")}
                      selected={(currentTailored.selectedSkillIds || []).includes(sk.id)}
                      onToggle={() => toggleSkill(sk.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 荣誉奖项（可选 + 可增删） */}
            <div className="mb-4">
              <SectionLabel>
                <span className="flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5" />
                  荣誉奖项
                  <span className="text-muted-foreground normal-case">（勾选纳入简历；经历充足时可不勾选）</span>
                </span>
              </SectionLabel>
              <div className="space-y-2">
                {(resume.awards || []).length === 0 && (
                  <p className="text-xs text-muted-foreground px-1">暂无获奖记录</p>
                )}
                {(resume.awards || []).map((a) => (
                  <SelectableCard
                    key={a.id}
                    title={a.name}
                    subtitle={[a.date, a.description].filter(Boolean).join("　")}
                    selected={(currentTailored.selectedAwardIds || []).includes(a.id)}
                    onToggle={() => toggleAward(a.id)}
                    onDelete={() => handleRemoveAward(a.id)}
                  />
                ))}
              </div>
              <AddAwardRow onAdd={handleAddAward} />
            </div>

            {/* 自定义模块（可勾选） */}
            {(resume.customSections || []).length > 0 && (
              <div className="mb-4">
                <SectionLabel>其他模块</SectionLabel>
                <div className="space-y-2">
                  {(resume.customSections || []).map((sec) => (
                    <SelectableCard
                      key={sec.id}
                      title={sec.title}
                      subtitle={sec.items.length > 0
                        ? sec.items.map((item) => item.heading).join("、")
                        : "（暂无内容）"}
                      selected={(currentTailored.selectedCustomSectionIds || []).includes(sec.id)}
                      onToggle={() => toggleCustomSection(sec.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {resume.work.length === 0 && (resume.campus || []).length === 0 && resume.projects.length === 0 && resume.education.length === 0 && (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground text-sm">
                  简历库为空，请先在「简历库」中添加内容
                </CardContent>
              </Card>
            )}
          </div>

          {/* ── Right: resume template preview ──────────────────────────── */}
          <div>
            <h2 className="text-sm font-semibold mb-3">简历模版预览</h2>
            <div className="space-y-3">
              <ResumeModuleCard
                title="个人信息"
                items={
                  resume.personal.name
                    ? [{ title: resume.personal.name, subtitle: `${resume.personal.email} | ${resume.personal.phone}` }]
                    : []
                }
              />
              <ResumeModuleCard
                title="教育经历"
                items={selectedEducation.map((e) => ({
                  title: `${e.school} - ${e.major}`,
                  subtitle: `${e.degree} | ${e.startDate} - ${e.endDate}`,
                }))}
              />
              <ResumeModuleCard
                title={currentTailored.sectionTitleOverrides["work"] || "工作/实习经历"}
                editable
                onTitleChange={(title) =>
                  updateTailoredResume(currentTailored.id, {
                    sectionTitleOverrides: { ...currentTailored.sectionTitleOverrides, work: title },
                  })
                }
                items={selectedWork.map((w) => ({
                  title: `${w.company} - ${w.title}`,
                  subtitle: w.descriptions.slice(0, 2).join(" | "),
                }))}
              />
              {selectedCampus.length > 0 && (
                <ResumeModuleCard
                  title={currentTailored.sectionTitleOverrides["campus"] || "校园经历"}
                  editable
                  onTitleChange={(title) =>
                    updateTailoredResume(currentTailored.id, {
                      sectionTitleOverrides: { ...currentTailored.sectionTitleOverrides, campus: title },
                    })
                  }
                  items={selectedCampus.map((c) => ({
                    title: `${c.company} - ${c.title}`,
                    subtitle: c.descriptions.slice(0, 2).join(" | "),
                  }))}
                />
              )}
              <ResumeModuleCard
                title={currentTailored.sectionTitleOverrides["project"] || "项目经历"}
                editable
                onTitleChange={(title) =>
                  updateTailoredResume(currentTailored.id, {
                    sectionTitleOverrides: { ...currentTailored.sectionTitleOverrides, project: title },
                  })
                }
                items={selectedProjects.map((p) => ({
                  title: p.name,
                  subtitle: p.descriptions.slice(0, 2).join(" | "),
                }))}
              />
              <ResumeModuleCard
                title="专业技能"
                items={resume.skills
                  .filter((s) => (currentTailored.selectedSkillIds || []).includes(s.id))
                  .map((s) => ({
                    title: s.category,
                    subtitle: s.items.join(", "),
                  }))}
              />
              {selectedAwards.length > 0 && (
                <ResumeModuleCard
                  title="荣誉奖项"
                  items={selectedAwards.map((a) => ({
                    title: a.name,
                    subtitle: [a.date, a.description].filter(Boolean).join(" | "),
                  }))}
                />
              )}
              {(resume.customSections || [])
                .filter((sec) => (currentTailored.selectedCustomSectionIds || []).includes(sec.id))
                .map((sec) => (
                  <ResumeModuleCard
                    key={sec.id}
                    title={sec.title}
                    items={sec.items.map((item) => ({
                      title: item.heading,
                      subtitle: [item.subheading, item.date].filter(Boolean).join(" | "),
                    }))}
                  />
                ))
              }
            </div>

            <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <h3 className="font-medium text-xs mb-2">JD 关键词匹配</h3>
              <div className="flex flex-wrap gap-1.5">
                {currentJob.keywords.map((kw) => {
                  const allText = [
                    ...selectedWork.flatMap((w) => w.descriptions),
                    ...selectedWork.flatMap((w) => w.tags),
                    ...selectedCampus.flatMap((c) => c.descriptions),
                    ...selectedCampus.flatMap((c) => c.tags),
                    ...selectedProjects.flatMap((p) => p.descriptions),
                    ...selectedProjects.flatMap((p) => p.techStack),
                    ...selectedProjects.flatMap((p) => p.tags),
                  ].join(" ");
                  const matched = allText.toLowerCase().includes(kw.toLowerCase());
                  return (
                    <Badge key={kw} variant={matched ? "success" : "warning"}>{kw}</Badge>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {!currentJob && !showAddJob && (
        <Card>
          <CardContent className="py-12 text-center">
            <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">添加目标岗位</h3>
            <p className="text-muted-foreground mb-4 text-sm">粘贴岗位 JD，AI 将帮你匹配最合适的经历</p>
            <Button onClick={() => setShowAddJob(true)}><Plus className="w-4 h-4" /> 添加第一个岗位</Button>
          </CardContent>
        </Card>
      )}

      <StepNavigation nextLabel="下一步：内容优化" />
    </div>
  );
}

function extractKeywords(text: string): string[] {
  const stopWords = new Set([
    // Chinese generic
    "的","了","和","是","在","有","与","等","能","对","我","您","他","她","他们","我们",
    "进行","通过","使用","具有","具备","熟悉","了解","掌握","能够","负责","参与","完成",
    "支持","需要","要求","具体","相关","以及","包括","主要","提供","实现","帮助","推动",
    "推进","优化","强化","提升","建设","开展","探索","研究","分析","设计","管理","运营",
    // Section headers often found in JDs
    "职位描述","岗位职责","任职要求","职位要求","工作职责","工作要求","基本要求",
    "必要条件","加分项","优先考虑","岗位说明","职责说明","关于我们","公司介绍",
    "薪资待遇","福利待遇","工作地点","工作时间","应聘要求",
    // English generic
    "the","and","or","is","are","in","on","for","to","with","a","an","of","at","by",
    "from","as","be","you","we","our","your","will","can","may","should","have","has",
    "not","this","that","all","any","some","other",
  ]);

  const tokens = text
    .replace(/[，。、；：！？\n\r\t【】「」（）()\[\]《》]/g, " ")
    .split(/\s+/)
    // remove list-item markers: "1.", "2、", "(1)", "（一）" etc.
    .filter((w) => !/^[\d一二三四五六七八九十]+[\.、）)）]?$/.test(w))
    .filter((w) => !/^\d+$/.test(w))  // pure numbers
    .map((w) => w.replace(/[^\w\u4e00-\u9fff+#./-]/g, "").trim())
    .filter((w) => w.length >= 2 && w.length <= 12)  // 2–12 chars only
    .filter((w) => !stopWords.has(w.toLowerCase()));

  const freq = new Map<string, number>();
  tokens.forEach((w) => freq.set(w, (freq.get(w) || 0) + 1));
  return Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word]) => word);
}
