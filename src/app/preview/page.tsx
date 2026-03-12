"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { useResumeStore } from "@/lib/store";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Textarea from "@/components/ui/Textarea";
import Badge from "@/components/ui/Badge";
import {
  Eye,
  Edit3,
  Check,
  ChevronDown,
  ChevronRight,
  X,
} from "lucide-react";

const PdfDownloadButton = dynamic(
  () =>
    import("@/components/resume/PdfSection").then(
      (mod) => mod.PdfDownloadButton
    ),
  { ssr: false }
);

const PdfPreviewPanel = dynamic(
  () =>
    import("@/components/resume/PdfSection").then(
      (mod) => mod.PdfPreviewPanel
    ),
  { ssr: false }
);

function EditableDescriptionList({
  items,
  onChange,
}: {
  items: string[];
  onChange: (items: string[]) => void;
}) {
  const [editing, setEditing] = useState(false);
  if (editing) {
    return (
      <div>
        <Textarea
          value={items.join("\n")}
          onChange={(e) =>
            onChange(e.target.value.split("\n").filter(Boolean))
          }
          rows={items.length + 1}
          className="text-xs"
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setEditing(false)}
          className="mt-1"
        >
          <Check className="w-3 h-3" /> 完成
        </Button>
      </div>
    );
  }
  return (
    <div className="group relative">
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="text-xs text-foreground flex gap-1.5">
            <span className="text-muted-foreground shrink-0">•</span>
            {item}
          </li>
        ))}
      </ul>
      <button
        onClick={() => setEditing(true)}
        className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Edit3 className="w-3 h-3 text-muted-foreground hover:text-primary" />
      </button>
    </div>
  );
}

export default function PreviewPage() {
  const resume = useResumeStore((s) => s.resume);
  const tailoredResumes = useResumeStore((s) => s.tailoredResumes);
  const currentTailoredId = useResumeStore((s) => s.currentTailoredId);
  const jobs = useResumeStore((s) => s.jobs);
  const currentJobId = useResumeStore((s) => s.currentJobId);
  const setCurrentJob = useResumeStore((s) => s.setCurrentJob);
  const setCurrentTailored = useResumeStore((s) => s.setCurrentTailored);
  const removeJob = useResumeStore((s) => s.removeJob);
  const addExportRecord = useResumeStore((s) => s.addExportRecord);
  const updateWork = useResumeStore((s) => s.updateWork);
  const updateCampus = useResumeStore((s) => s.updateCampus);
  const updateProject = useResumeStore((s) => s.updateProject);

  const [showPdf, setShowPdf] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["education", "work", "campus", "project", "skill", "award"])
  );
  const [useOriginalIds, setUseOriginalIds] = useState<Set<string>>(new Set());
  const [hoveredJobId, setHoveredJobId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTailored = tailoredResumes.find(
    (t) => t.id === currentTailoredId
  );

  const currentJob = jobs.find((j) => j.id === currentJobId);

  const handleExport = useCallback(() => {
    addExportRecord({
      jobTitle: currentJob?.title || "",
      company: currentJob?.company || "",
      resumeSnapshot: resume,
      tailoredSnapshot: currentTailored || null,
    });
  }, [addExportRecord, currentJob, resume, currentTailored]);

  const toggleUseOriginal = (id: string) => {
    setUseOriginalIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Priority: if useOriginal is set, use raw; otherwise polished > rewritten > raw
  const getDesc = (id: string, raw: string[]): string[] => {
    if (useOriginalIds.has(id)) return raw;
    return currentTailored?.polishedDescriptions?.[id]?.length
      ? currentTailored.polishedDescriptions[id]
      : currentTailored?.rewrittenDescriptions?.[id]?.length
      ? currentTailored.rewrittenDescriptions[id]
      : raw;
  };

  const work = currentTailored
    ? resume.work.filter((w) =>
        currentTailored.selectedWorkIds.includes(w.id)
      )
    : resume.work;

  const projects = currentTailored
    ? resume.projects.filter((p) =>
        currentTailored.selectedProjectIds.includes(p.id)
      )
    : resume.projects;

  const campus = currentTailored
    ? (resume.campus || []).filter((c) =>
        (currentTailored.selectedCampusIds || []).includes(c.id)
      )
    : resume.campus || [];

  const education = currentTailored
    ? resume.education.filter((e) =>
        currentTailored.selectedEducationIds.includes(e.id)
      )
    : resume.education;

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getTitle = (type: string, defaultTitle: string) => {
    if (currentTailored?.sectionTitleOverrides[type]) {
      return currentTailored.sectionTitleOverrides[type];
    }
    const mod = resume.moduleOrder.find((m) => m.type === type);
    return mod?.title || defaultTitle;
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">
            第 5 步：预览与导出
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            最终检查简历内容，确认后导出 PDF
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant={showPdf ? "primary" : "outline"}
            onClick={() => setShowPdf(!showPdf)}
          >
            <Eye className="w-4 h-4" />
            {showPdf ? "关闭预览" : "PDF 预览"}
          </Button>
          {mounted && (
            <PdfDownloadButton
              resume={resume}
              tailored={currentTailored}
              documentTitle={[resume.personal.name, currentJob?.title].filter(Boolean).join("_") || "resume"}
              onExport={handleExport}
            />
          )}
        </div>
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
              onClick={() => {
                setCurrentJob(job.id);
                const existing = tailoredResumes.find((t) => t.jobId === job.id);
                if (existing) setCurrentTailored(existing.id);
              }}
              className="pr-6"
            >
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
      </div>

      <div className={showPdf ? "grid grid-cols-2 gap-6" : ""}>
        {/* Content Review */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="py-3">
              <h3 className="font-semibold text-sm">个人信息</h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">姓名:</span>{" "}
                  {resume.personal.name || "-"}
                </div>
                <div>
                  <span className="text-muted-foreground">邮箱:</span>{" "}
                  {resume.personal.email || "-"}
                </div>
                <div>
                  <span className="text-muted-foreground">电话:</span>{" "}
                  {resume.personal.phone || "-"}
                </div>
                {resume.personal.website && (
                  <div>
                    <span className="text-muted-foreground">个人网站:</span>{" "}
                    {resume.personal.website}
                  </div>
                )}
                {resume.personal.linkedin && (
                  <div>
                    <span className="text-muted-foreground">领英:</span>{" "}
                    {resume.personal.linkedin}
                  </div>
                )}
                {resume.personal.github && (
                  <div>
                    <span className="text-muted-foreground">GitHub:</span>{" "}
                    {resume.personal.github}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {education.length > 0 && (
            <Card>
              <CardHeader
                className="py-3 cursor-pointer"
                onClick={() => toggleSection("education")}
              >
                <div className="flex items-center gap-2">
                  {expandedSections.has("education") ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                  <h3 className="font-semibold text-sm">
                    {getTitle("education", "教育经历")}
                  </h3>
                  <Badge variant="secondary">
                    {education.length}
                  </Badge>
                </div>
              </CardHeader>
              {expandedSections.has("education") && (
                <CardContent className="space-y-3">
                  {education.map((edu) => (
                    <div
                      key={edu.id}
                      className="border-l-2 border-primary/30 pl-3"
                    >
                      <div className="flex justify-between">
                        <div>
                          <p className="font-medium text-sm">{edu.school}</p>
                          <p className="text-xs text-muted-foreground">
                            {edu.degree} · {edu.major}
                            {edu.gpa ? ` | GPA: ${edu.gpa}` : ""}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {edu.startDate} - {edu.endDate}
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              )}
            </Card>
          )}

          {work.length > 0 && (
            <Card>
              <CardHeader
                className="py-3 cursor-pointer"
                onClick={() => toggleSection("work")}
              >
                <div className="flex items-center gap-2">
                  {expandedSections.has("work") ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                  <h3 className="font-semibold text-sm">
                    {getTitle("work", "工作/实习经历")}
                  </h3>
                  <Badge variant="secondary">{work.length}</Badge>
                </div>
              </CardHeader>
              {expandedSections.has("work") && (
                <CardContent className="space-y-4">
                  {work.map((w) => {
                    const hasOptimized = currentTailored?.polishedDescriptions?.[w.id]?.length || currentTailored?.rewrittenDescriptions?.[w.id]?.length;
                    const isUsingOriginal = useOriginalIds.has(w.id);
                    return (
                    <div
                      key={w.id}
                      className="border-l-2 border-primary/30 pl-3"
                    >
                      <div className="flex justify-between mb-1">
                        <div>
                          <p className="font-medium text-sm">
                            {w.company} · {w.title}
                          </p>
                          {w.location && (
                            <p className="text-xs text-muted-foreground">
                              {w.location}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {w.startDate} - {w.endDate}
                          </span>
                          {hasOptimized && (
                            <Button
                              variant={isUsingOriginal ? "primary" : "outline"}
                              size="sm"
                              onClick={() => toggleUseOriginal(w.id)}
                              className="text-xs h-6 px-2"
                            >
                              {isUsingOriginal ? "使用优化版" : "使用原文"}
                            </Button>
                          )}
                        </div>
                      </div>
                      <EditableDescriptionList
                        items={getDesc(w.id, w.descriptions)}
                        onChange={(descriptions) =>
                          updateWork(w.id, { descriptions })
                        }
                      />
                    </div>
                    );
                  })}
                </CardContent>
              )}
            </Card>
          )}

          {campus.length > 0 && (
            <Card>
              <CardHeader
                className="py-3 cursor-pointer"
                onClick={() => toggleSection("campus")}
              >
                <div className="flex items-center gap-2">
                  {expandedSections.has("campus") ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                  <h3 className="font-semibold text-sm">
                    {getTitle("campus", "校园经历")}
                  </h3>
                  <Badge variant="secondary">{campus.length}</Badge>
                </div>
              </CardHeader>
              {expandedSections.has("campus") && (
                <CardContent className="space-y-4">
                  {campus.map((c) => {
                    const hasOptimized = currentTailored?.polishedDescriptions?.[c.id]?.length || currentTailored?.rewrittenDescriptions?.[c.id]?.length;
                    const isUsingOriginal = useOriginalIds.has(c.id);
                    return (
                    <div key={c.id} className="border-l-2 border-primary/30 pl-3">
                      <div className="flex justify-between mb-1">
                        <div>
                          <p className="font-medium text-sm">
                            {c.company} · {c.title}
                          </p>
                          {c.location && (
                            <p className="text-xs text-muted-foreground">{c.location}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {c.startDate} - {c.endDate}
                          </span>
                          {hasOptimized && (
                            <Button
                              variant={isUsingOriginal ? "primary" : "outline"}
                              size="sm"
                              onClick={() => toggleUseOriginal(c.id)}
                              className="text-xs h-6 px-2"
                            >
                              {isUsingOriginal ? "使用优化版" : "使用原文"}
                            </Button>
                          )}
                        </div>
                      </div>
                      <EditableDescriptionList
                        items={getDesc(c.id, c.descriptions)}
                        onChange={(descriptions) =>
                          updateCampus(c.id, { descriptions })
                        }
                      />
                    </div>
                    );
                  })}
                </CardContent>
              )}
            </Card>
          )}

          {projects.length > 0 && (
            <Card>
              <CardHeader
                className="py-3 cursor-pointer"
                onClick={() => toggleSection("project")}
              >
                <div className="flex items-center gap-2">
                  {expandedSections.has("project") ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                  <h3 className="font-semibold text-sm">
                    {getTitle("project", "项目经历")}
                  </h3>
                  <Badge variant="secondary">{projects.length}</Badge>
                </div>
              </CardHeader>
              {expandedSections.has("project") && (
                <CardContent className="space-y-4">
                  {projects.map((p) => {
                    const hasOptimized = currentTailored?.polishedDescriptions?.[p.id]?.length || currentTailored?.rewrittenDescriptions?.[p.id]?.length;
                    const isUsingOriginal = useOriginalIds.has(p.id);
                    return (
                    <div
                      key={p.id}
                      className="border-l-2 border-primary/30 pl-3"
                    >
                      <div className="flex justify-between mb-1">
                        <div>
                          <p className="font-medium text-sm">
                            {p.name}
                            {p.role ? ` · ${p.role}` : ""}
                          </p>
                          {p.techStack.length > 0 && (
                            <p className="text-xs text-muted-foreground">
                              {p.techStack.join(", ")}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {p.startDate} - {p.endDate}
                          </span>
                          {hasOptimized && (
                            <Button
                              variant={isUsingOriginal ? "primary" : "outline"}
                              size="sm"
                              onClick={() => toggleUseOriginal(p.id)}
                              className="text-xs h-6 px-2"
                            >
                              {isUsingOriginal ? "使用优化版" : "使用原文"}
                            </Button>
                          )}
                        </div>
                      </div>
                      <EditableDescriptionList
                        items={getDesc(p.id, p.descriptions)}
                        onChange={(descriptions) =>
                          updateProject(p.id, { descriptions })
                        }
                      />
                    </div>
                    );
                  })}
                </CardContent>
              )}
            </Card>
          )}

          {(() => {
            const skills = currentTailored
              ? resume.skills.filter((sk) => (currentTailored.selectedSkillIds || []).includes(sk.id))
              : resume.skills;
            return skills.length > 0 ? (
            <Card>
              <CardHeader className="py-3">
                <h3 className="font-semibold text-sm">
                  {getTitle("skill", "专业技能")}
                </h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {skills.map((sk) => (
                    <div key={sk.id} className="text-sm">
                      <span className="font-medium">{sk.category}:</span>{" "}
                      <span className="text-muted-foreground">
                        {(currentTailored?.optimizedSkills?.[sk.id] ?? sk.items).join("、")}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            ) : null;
          })()}

          {(() => {
            const awards = currentTailored
              ? (resume.awards || []).filter((a) =>
                  (currentTailored.selectedAwardIds || []).includes(a.id)
                )
              : resume.awards || [];
            return awards.length > 0 ? (
            <Card>
              <CardHeader className="py-3">
                <h3 className="font-semibold text-sm">
                  {getTitle("award", "荣誉奖项")}
                </h3>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {awards.map((a) => (
                    <li key={a.id} className="text-sm flex gap-1.5">
                      <span className="text-muted-foreground">•</span>
                      {a.name}
                      {a.date ? ` (${a.date})` : ""}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            ) : null;
          })()}

          {(() => {
            const customSections = currentTailored
              ? (resume.customSections || []).filter((sec) =>
                  (currentTailored.selectedCustomSectionIds || []).includes(sec.id)
                )
              : resume.customSections || [];
            return customSections.map((sec) => (
              <Card key={sec.id}>
                <CardHeader className="py-3">
                  <h3 className="font-semibold text-sm">{sec.title}</h3>
                </CardHeader>
                <CardContent>
                  <div className={sec.items.some((i) => i.imageUrl) ? "grid grid-cols-3 gap-3" : "space-y-2"}>
                    {sec.items.map((item) => (
                      <div key={item.id} className="text-sm">
                        {item.imageUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.imageUrl} alt={item.heading} className="w-full aspect-square object-cover rounded border mb-1.5" />
                        )}
                        <p className="font-medium">{item.heading}</p>
                        {item.subheading && <p className="text-muted-foreground text-xs">{item.subheading}</p>}
                        {item.date && <p className="text-muted-foreground text-xs">{item.date}</p>}
                        {item.link && <p className="text-primary text-xs break-all">{item.link}</p>}
                        {item.descriptions.length > 0 && (
                          <ul className="mt-1 space-y-0.5">
                            {item.descriptions.map((d, i) => (
                              <li key={i} className="text-xs text-muted-foreground flex gap-1">
                                <span>•</span>{d}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ));
          })()}
        </div>

        {/* PDF Preview */}
        {showPdf && mounted && (
          <div className="sticky top-24">
            <PdfPreviewPanel
              resume={resume}
              tailored={currentTailored}
              documentTitle={[resume.personal.name, currentJob?.title].filter(Boolean).join("_") || "resume"}
              onExport={handleExport}
            />
          </div>
        )}
      </div>
    </div>
  );
}
