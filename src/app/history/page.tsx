"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useResumeStore } from "@/lib/store";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import { Clock, Trash2, Eye, FileText, Edit3, Check, X, Save } from "lucide-react";
import type { ExportRecord, ResumeData } from "@/lib/types";

const PdfPreviewPanel = dynamic(
  () =>
    import("@/components/resume/PdfSection").then((mod) => mod.PdfPreviewPanel),
  { ssr: false }
);

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Simple editable description list (same pattern as preview page)
function EditableList({
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
          onChange={(e) => onChange(e.target.value.split("\n"))}
          rows={Math.max(items.length + 1, 3)}
          className="text-xs"
        />
        <Button variant="ghost" size="sm" onClick={() => setEditing(false)} className="mt-1">
          <Check className="w-3 h-3" /> 完成
        </Button>
      </div>
    );
  }
  return (
    <div className="group relative">
      <ol className="space-y-0.5 list-decimal list-inside">
        {items.map((item, i) => (
          <li key={i} className="text-xs text-foreground">{item}</li>
        ))}
      </ol>
      <button
        onClick={() => setEditing(true)}
        className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
        title="编辑"
      >
        <Edit3 className="w-3 h-3 text-muted-foreground hover:text-primary" />
      </button>
    </div>
  );
}

// Inline snapshot editor – works on a local copy, calls onSave when done
function SnapshotEditor({
  record,
  onSave,
  onCancel,
}: {
  record: ExportRecord;
  onSave: (snapshot: ResumeData) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<ResumeData>(() =>
    JSON.parse(JSON.stringify(record.resumeSnapshot))
  );

  const updatePersonal = (key: string, value: string) =>
    setDraft((d) => ({ ...d, personal: { ...d.personal, [key]: value } }));

  const updateWorkDesc = (id: string, descriptions: string[]) =>
    setDraft((d) => ({
      ...d,
      work: d.work.map((w) => (w.id === id ? { ...w, descriptions } : w)),
    }));

  const updateCampusDesc = (id: string, descriptions: string[]) =>
    setDraft((d) => ({
      ...d,
      campus: (d.campus || []).map((c) =>
        c.id === id ? { ...c, descriptions } : c
      ),
    }));

  const updateProjectDesc = (id: string, descriptions: string[]) =>
    setDraft((d) => ({
      ...d,
      projects: d.projects.map((p) =>
        p.id === id ? { ...p, descriptions } : p
      ),
    }));

  return (
    <div className="space-y-5 pt-2">
      {/* Personal */}
      <div>
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">个人信息</h4>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              { key: "name", label: "姓名" },
              { key: "email", label: "邮箱" },
              { key: "phone", label: "电话" },
              { key: "linkedin", label: "领英" },
              { key: "github", label: "GitHub" },
              { key: "website", label: "个人网站" },
            ] as { key: keyof typeof draft.personal; label: string }[]
          ).map(({ key, label }) => (
            <div key={key}>
              <label className="text-xs text-muted-foreground mb-0.5 block">{label}</label>
              <Input
                value={(draft.personal[key] as string) || ""}
                onChange={(e) => updatePersonal(key, e.target.value)}
                className="text-xs h-7 px-2"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Work */}
      {draft.work.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">工作/实习经历</h4>
          <div className="space-y-3">
            {draft.work.map((w) => (
              <div key={w.id} className="border-l-2 border-primary/30 pl-3">
                <p className="text-xs font-medium mb-1">
                  {w.company} · {w.title}
                </p>
                <EditableList
                  items={w.descriptions}
                  onChange={(d) => updateWorkDesc(w.id, d)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Campus */}
      {(draft.campus || []).length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">校园经历</h4>
          <div className="space-y-3">
            {(draft.campus || []).map((c) => (
              <div key={c.id} className="border-l-2 border-primary/30 pl-3">
                <p className="text-xs font-medium mb-1">
                  {c.company} · {c.title}
                </p>
                <EditableList
                  items={c.descriptions}
                  onChange={(d) => updateCampusDesc(c.id, d)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {draft.projects.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">项目经历</h4>
          <div className="space-y-3">
            {draft.projects.map((p) => (
              <div key={p.id} className="border-l-2 border-primary/30 pl-3">
                <p className="text-xs font-medium mb-1">{p.name}</p>
                <EditableList
                  items={p.descriptions}
                  onChange={(d) => updateProjectDesc(p.id, d)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education (display only – dates/school rarely need changing) */}
      {draft.education.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">教育经历</h4>
          <div className="space-y-1">
            {draft.education.map((e) => (
              <p key={e.id} className="text-xs text-muted-foreground">
                {e.school} · {e.degree} {e.major} {e.startDate}–{e.endDate}
              </p>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-1 border-t border-border">
        <Button size="sm" onClick={() => onSave(draft)}>
          <Save className="w-3.5 h-3.5" /> 保存修改
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>
          <X className="w-3.5 h-3.5" /> 取消
        </Button>
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const exportHistory = useResumeStore((s) => s.exportHistory);
  const removeExportRecord = useResumeStore((s) => s.removeExportRecord);
  const updateExportRecord = useResumeStore((s) => s.updateExportRecord);

  const [activeRecord, setActiveRecord] = useState<string | null>(null);
  const [mode, setMode] = useState<"preview" | "edit">("preview");

  const toggle = (id: string, newMode: "preview" | "edit") => {
    if (activeRecord === id && mode === newMode) {
      setActiveRecord(null);
    } else {
      setActiveRecord(id);
      setMode(newMode);
    }
  };

  const handleSave = (id: string, snapshot: ResumeData) => {
    updateExportRecord(id, { resumeSnapshot: snapshot });
    setActiveRecord(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">导出记录</h1>
          <p className="text-muted-foreground text-sm mt-1">
            每次导出 PDF 时自动保存的简历快照
          </p>
        </div>
        <Badge variant="secondary">{exportHistory.length} 条记录</Badge>
      </div>

      {exportHistory.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">暂无导出记录</h3>
            <p className="text-muted-foreground text-sm">
              在「预览与导出」页面下载 PDF 后，记录将自动保存在这里
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {exportHistory.map((record) => (
            <Card key={record.id}>
              <CardHeader className="py-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">
                        {record.company || "未知公司"} · {record.jobTitle || "未知岗位"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(record.exportedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant={activeRecord === record.id && mode === "preview" ? "primary" : "outline"}
                      size="sm"
                      onClick={() => toggle(record.id, "preview")}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      {activeRecord === record.id && mode === "preview" ? "关闭" : "预览"}
                    </Button>
                    <Button
                      variant={activeRecord === record.id && mode === "edit" ? "primary" : "outline"}
                      size="sm"
                      onClick={() => toggle(record.id, "edit")}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      {activeRecord === record.id && mode === "edit" ? "关闭" : "编辑"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm("确定删除此条导出记录吗？")) {
                          removeExportRecord(record.id);
                          if (activeRecord === record.id) setActiveRecord(null);
                        }
                      }}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {activeRecord === record.id && mode === "preview" && (
                <CardContent className="pt-0 pb-4">
                  <PdfPreviewPanel
                    resume={record.resumeSnapshot}
                    tailored={record.tailoredSnapshot}
                    documentTitle={[record.resumeSnapshot.personal.name, record.jobTitle].filter(Boolean).join("_") || "resume"}
                  />
                </CardContent>
              )}

              {activeRecord === record.id && mode === "edit" && (
                <CardContent className="pt-0 pb-4">
                  <SnapshotEditor
                    record={record}
                    onSave={(snapshot) => handleSave(record.id, snapshot)}
                    onCancel={() => setActiveRecord(null)}
                  />
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
