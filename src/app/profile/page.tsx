"use client";

import { useResumeStore } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Badge from "@/components/ui/Badge";
import {
  Plus,
  Trash2,
  GripVertical,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight,
  Upload,
  Check,
} from "lucide-react";
import { generateId, type WorkExperience, type CustomSection } from "@/lib/types";
import { useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function PersonalSection() {
  const personal = useResumeStore((s) => s.resume.personal);
  const updatePersonal = useResumeStore((s) => s.updatePersonal);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      updatePersonal({ avatar: ev.target?.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      updatePersonal({ schoolLogo: ev.target?.result as string });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Avatar + School Logo */}
      <div className="col-span-2 flex items-start gap-6">
        {/* 头像 */}
        <div className="flex items-center gap-3">
          {personal.avatar ? (
            <img
              src={personal.avatar}
              alt="avatar"
              className="w-[51px] h-[66px] rounded-sm object-cover object-top border border-border"
            />
          ) : (
            <div className="w-[51px] h-[66px] rounded-sm bg-muted flex items-center justify-center text-muted-foreground text-xs border border-dashed border-border">
              照片
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              个人照片
            </label>
            <label className="cursor-pointer">
              <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border border-border bg-background hover:bg-accent transition-colors">
                <Upload className="w-3 h-3" /> 上传
              </span>
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </label>
            {personal.avatar && (
              <button onClick={() => updatePersonal({ avatar: undefined })} className="ml-2 text-xs text-destructive hover:underline">删除</button>
            )}
          </div>
        </div>

        {/* 学校 Logo */}
        <div className="flex items-center gap-3">
          {personal.schoolLogo ? (
            <img
              src={personal.schoolLogo}
              alt="school logo"
              className="h-10 w-auto max-w-[120px] object-contain border border-border rounded-sm p-1 bg-white"
            />
          ) : (
            <div className="w-[96px] h-10 rounded-sm bg-muted flex items-center justify-center text-muted-foreground text-xs border border-dashed border-border">
              校徽
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              学校 Logo <span className="text-muted-foreground font-normal">（显示在右上角）</span>
            </label>
            <label className="cursor-pointer">
              <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border border-border bg-background hover:bg-accent transition-colors">
                <Upload className="w-3 h-3" /> 上传
              </span>
              <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
            </label>
            {personal.schoolLogo && (
              <button onClick={() => updatePersonal({ schoolLogo: undefined })} className="ml-2 text-xs text-destructive hover:underline">删除</button>
            )}
          </div>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">姓名</label>
        <Input
          value={personal.name}
          onChange={(e) => updatePersonal({ name: e.target.value })}
          placeholder="张三"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">邮箱</label>
        <Input
          value={personal.email}
          onChange={(e) => updatePersonal({ email: e.target.value })}
          placeholder="email@example.com"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">电话</label>
        <Input
          value={personal.phone}
          onChange={(e) => updatePersonal({ phone: e.target.value })}
          placeholder="138-0000-0000"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">个人网站</label>
        <Input
          value={personal.website || ""}
          onChange={(e) => updatePersonal({ website: e.target.value })}
          placeholder="https://..."
        />
      </div>
      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">LinkedIn</label>
        <Input
          value={personal.linkedin || ""}
          onChange={(e) => updatePersonal({ linkedin: e.target.value })}
          placeholder="linkedin.com/in/yourname"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">GitHub</label>
        <Input
          value={personal.github || ""}
          onChange={(e) => updatePersonal({ github: e.target.value })}
          placeholder="github.com/yourname"
        />
      </div>
      <div className="col-span-2">
        <label className="text-sm font-medium text-foreground mb-1.5 block">兴趣爱好</label>
        <Input
          value={personal.interests || ""}
          onChange={(e) => updatePersonal({ interests: e.target.value })}
          placeholder="如：摄影、徒步、开源项目"
        />
      </div>
    </div>
  );
}

function EducationSection() {
  const education = useResumeStore((s) => s.resume.education);
  const addEducation = useResumeStore((s) => s.addEducation);
  const updateEducation = useResumeStore((s) => s.updateEducation);
  const removeEducation = useResumeStore((s) => s.removeEducation);

  const handleAdd = () => {
    addEducation({
      id: generateId(),
      school: "",
      degree: "",
      major: "",
      startDate: "",
      endDate: "",
      highlights: [],
    });
  };

  return (
    <div className="space-y-4">
      {education.map((edu) => (
        <div key={edu.id} className="border border-border rounded-lg p-4 space-y-3 bg-background">
          <div className="flex justify-between items-start">
            <div className="grid grid-cols-2 gap-3 flex-1">
              <Input
                value={edu.school}
                onChange={(e) => updateEducation(edu.id, { school: e.target.value })}
                placeholder="学校名称"
              />
              <Input
                value={edu.major}
                onChange={(e) => updateEducation(edu.id, { major: e.target.value })}
                placeholder="专业"
              />
              <Input
                value={edu.degree}
                onChange={(e) => updateEducation(edu.id, { degree: e.target.value })}
                placeholder="学位 (如: 硕士)"
              />
              <div className="flex gap-2">
                <Input
                  value={edu.startDate}
                  onChange={(e) => updateEducation(edu.id, { startDate: e.target.value })}
                  placeholder="开始时间"
                />
                <Input
                  value={edu.endDate}
                  onChange={(e) => updateEducation(edu.id, { endDate: e.target.value })}
                  placeholder="结束时间"
                />
              </div>
              <Input
                value={edu.gpa || ""}
                onChange={(e) => updateEducation(edu.id, { gpa: e.target.value })}
                placeholder="GPA (可选)"
              />
              <Input
                value={(edu.rankTags || []).join(", ")}
                onChange={(e) =>
                  updateEducation(edu.id, {
                    rankTags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
                  })
                }
                placeholder="排名标签，逗号分隔（如：QS前100, USNEWS100）"
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeEducation(edu.id)}
              className="ml-2 text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              亮点（每行一条）
            </label>
            <Textarea
              value={edu.highlights.join("\n")}
              onChange={(e) =>
                updateEducation(edu.id, {
                  highlights: e.target.value.split("\n").filter(Boolean),
                })
              }
              placeholder="相关课程、荣誉等..."
              rows={2}
            />
          </div>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={handleAdd} className="w-full">
        <Plus className="w-4 h-4" /> 添加教育经历
      </Button>
    </div>
  );
}

function SubModulesEditor({
  subModules,
  onChange,
  descriptionLabel,
}: {
  subModules: import("@/lib/types").WorkSubModule[];
  onChange: (subModules: import("@/lib/types").WorkSubModule[]) => void;
  descriptionLabel: string;
}) {
  const addModule = () => {
    onChange([...subModules, { id: generateId(), title: "", descriptions: [] }]);
  };

  const updateModule = (id: string, patch: Partial<import("@/lib/types").WorkSubModule>) => {
    onChange(subModules.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  };

  const removeModule = (id: string) => {
    onChange(subModules.filter((m) => m.id !== id));
  };

  return (
    <div className="space-y-3">
      {subModules.map((mod) => (
        <div key={mod.id} className="border border-dashed border-border rounded-md p-3 space-y-2 bg-muted/30">
          <div className="flex items-center gap-2">
            <Input
              value={mod.title}
              onChange={(e) => updateModule(mod.id, { title: e.target.value })}
              placeholder="模块名称，如：岗位职责"
              className="flex-1 text-sm font-medium"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeModule(mod.id)}
              className="text-destructive shrink-0"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          <Textarea
            value={mod.descriptions.join("\n")}
            onChange={(e) =>
              updateModule(mod.id, {
                descriptions: e.target.value.split("\n").filter(Boolean),
              })
            }
            placeholder="每行一条描述..."
            rows={3}
          />
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={addModule} className="w-full text-xs">
        <Plus className="w-3.5 h-3.5" /> 添加模块（如：岗位职责 / 核心项目）
      </Button>
    </div>
  );
}

function SortableWorkItem({
  w,
  updateWork,
  removeWork,
}: {
  w: WorkExperience;
  updateWork: (id: string, data: Partial<WorkExperience>) => void;
  removeWork: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: w.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="border border-border rounded-lg p-4 space-y-3 bg-background">
      <div className="flex justify-between items-start">
        <button
          {...attributes}
          {...listeners}
          className="mt-1 mr-2 cursor-grab text-muted-foreground hover:text-foreground shrink-0"
          aria-label="拖拽排序"
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <div className="grid grid-cols-2 gap-3 flex-1">
          <Input
            value={w.company}
            onChange={(e) => updateWork(w.id, { company: e.target.value })}
            placeholder="公司名称"
          />
          <Input
            value={w.title}
            onChange={(e) => updateWork(w.id, { title: e.target.value })}
            placeholder="职位"
          />
          <Input
            value={w.location}
            onChange={(e) => updateWork(w.id, { location: e.target.value })}
            placeholder="地点"
          />
          <div className="flex gap-2">
            <Input
              value={w.startDate}
              onChange={(e) => updateWork(w.id, { startDate: e.target.value })}
              placeholder="开始时间"
            />
            <Input
              value={w.endDate}
              onChange={(e) => updateWork(w.id, { endDate: e.target.value })}
              placeholder="结束时间"
            />
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => removeWork(w.id)}
          className="ml-2 text-destructive"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">
          工作描述（每行一条，建议STAR法则）
        </label>
        <Textarea
          value={w.descriptions.join("\n")}
          onChange={(e) =>
            updateWork(w.id, {
              descriptions: e.target.value.split("\n").filter(Boolean),
            })
          }
          placeholder="负责了xxx，通过xxx方法，实现了xxx效果..."
          rows={4}
        />
      </div>
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          子模块（可选：为该经历添加「岗位职责」「核心项目」等分块）
        </label>
        <SubModulesEditor
          subModules={w.subModules || []}
          onChange={(subModules) => updateWork(w.id, { subModules })}
          descriptionLabel="工作描述"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">
          标签（逗号分隔，用于AI匹配）
        </label>
        <Input
          value={w.tags.join(", ")}
          onChange={(e) =>
            updateWork(w.id, {
              tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
            })
          }
          placeholder="产品管理, 数据分析, 用户研究"
        />
      </div>
    </div>
  );
}

function WorkSection() {
  const work = useResumeStore((s) => s.resume.work);
  const addWork = useResumeStore((s) => s.addWork);
  const updateWork = useResumeStore((s) => s.updateWork);
  const removeWork = useResumeStore((s) => s.removeWork);
  const reorderWork = useResumeStore((s) => s.reorderWork);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = work.findIndex((w) => w.id === active.id);
      const newIndex = work.findIndex((w) => w.id === over.id);
      reorderWork(arrayMove(work, oldIndex, newIndex).map((w) => w.id));
    }
  };

  const handleAdd = () => {
    addWork({
      id: generateId(),
      company: "",
      title: "",
      location: "",
      startDate: "",
      endDate: "",
      descriptions: [],
      tags: [],
      subModules: [],
    });
  };

  return (
    <div className="space-y-4">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={work.map((w) => w.id)} strategy={verticalListSortingStrategy}>
          {work.map((w) => (
            <SortableWorkItem key={w.id} w={w} updateWork={updateWork} removeWork={removeWork} />
          ))}
        </SortableContext>
      </DndContext>
      <Button variant="outline" size="sm" onClick={handleAdd} className="w-full">
        <Plus className="w-4 h-4" /> 添加工作经历
      </Button>
    </div>
  );
}

function SortableCampusItem({
  c,
  updateCampus,
  removeCampus,
}: {
  c: WorkExperience;
  updateCampus: (id: string, data: Partial<WorkExperience>) => void;
  removeCampus: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: c.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="border border-border rounded-lg p-4 space-y-3 bg-background">
      <div className="flex justify-between items-start">
        <button
          {...attributes}
          {...listeners}
          className="mt-1 mr-2 cursor-grab text-muted-foreground hover:text-foreground shrink-0"
          aria-label="拖拽排序"
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <div className="grid grid-cols-2 gap-3 flex-1">
          <Input
            value={c.company}
            onChange={(e) => updateCampus(c.id, { company: e.target.value })}
            placeholder="组织/社团/学校"
          />
          <Input
            value={c.title}
            onChange={(e) => updateCampus(c.id, { title: e.target.value })}
            placeholder="职位/角色"
          />
          <Input
            value={c.location}
            onChange={(e) => updateCampus(c.id, { location: e.target.value })}
            placeholder="地点"
          />
          <div className="flex gap-2">
            <Input
              value={c.startDate}
              onChange={(e) => updateCampus(c.id, { startDate: e.target.value })}
              placeholder="开始时间"
            />
            <Input
              value={c.endDate}
              onChange={(e) => updateCampus(c.id, { endDate: e.target.value })}
              placeholder="结束时间"
            />
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => removeCampus(c.id)}
          className="ml-2 text-destructive"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">
          经历描述（每行一条）
        </label>
        <Textarea
          value={c.descriptions.join("\n")}
          onChange={(e) =>
            updateCampus(c.id, {
              descriptions: e.target.value.split("\n").filter(Boolean),
            })
          }
          placeholder="描述参与内容、取得成果..."
          rows={4}
        />
      </div>
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          子模块（可选：为该经历添加「职责描述」「核心项目」等分块）
        </label>
        <SubModulesEditor
          subModules={c.subModules || []}
          onChange={(subModules) => updateCampus(c.id, { subModules })}
          descriptionLabel="经历描述"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">
          标签（逗号分隔）
        </label>
        <Input
          value={c.tags.join(", ")}
          onChange={(e) =>
            updateCampus(c.id, {
              tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
            })
          }
          placeholder="学生会, 组织管理, 活动策划"
        />
      </div>
    </div>
  );
}

function CampusSection() {
  const campus = useResumeStore((s) => s.resume.campus || []);
  const addCampus = useResumeStore((s) => s.addCampus);
  const updateCampus = useResumeStore((s) => s.updateCampus);
  const removeCampus = useResumeStore((s) => s.removeCampus);
  const reorderCampus = useResumeStore((s) => s.reorderCampus);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = campus.findIndex((c) => c.id === active.id);
      const newIndex = campus.findIndex((c) => c.id === over.id);
      reorderCampus(arrayMove(campus, oldIndex, newIndex).map((c) => c.id));
    }
  };

  const handleAdd = () => {
    addCampus({
      id: generateId(),
      company: "",
      title: "",
      location: "",
      startDate: "",
      endDate: "",
      descriptions: [],
      tags: [],
      subModules: [],
    });
  };

  return (
    <div className="space-y-4">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={campus.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {campus.map((c) => (
            <SortableCampusItem key={c.id} c={c} updateCampus={updateCampus} removeCampus={removeCampus} />
          ))}
        </SortableContext>
      </DndContext>
      <Button variant="outline" size="sm" onClick={handleAdd} className="w-full">
        <Plus className="w-4 h-4" /> 添加校园经历
      </Button>
    </div>
  );
}

function ProjectSection() {
  const projects = useResumeStore((s) => s.resume.projects);
  const addProject = useResumeStore((s) => s.addProject);
  const updateProject = useResumeStore((s) => s.updateProject);
  const removeProject = useResumeStore((s) => s.removeProject);

  const handleAdd = () => {
    addProject({
      id: generateId(),
      name: "",
      role: "",
      startDate: "",
      endDate: "",
      descriptions: [],
      techStack: [],
      tags: [],
    });
  };

  return (
    <div className="space-y-4">
      {projects.map((p) => (
        <div key={p.id} className="border border-border rounded-lg p-4 space-y-3 bg-background">
          <div className="flex justify-between items-start">
            <div className="grid grid-cols-2 gap-3 flex-1">
              <Input
                value={p.name}
                onChange={(e) => updateProject(p.id, { name: e.target.value })}
                placeholder="项目名称"
              />
              <Input
                value={p.role || ""}
                onChange={(e) => updateProject(p.id, { role: e.target.value })}
                placeholder="角色"
              />
              <Input
                value={p.location || ""}
                onChange={(e) => updateProject(p.id, { location: e.target.value })}
                placeholder="地点（可选）"
              />
              <div className="flex gap-2">
                <Input
                  value={p.startDate}
                  onChange={(e) => updateProject(p.id, { startDate: e.target.value })}
                  placeholder="开始时间"
                />
                <Input
                  value={p.endDate}
                  onChange={(e) => updateProject(p.id, { endDate: e.target.value })}
                  placeholder="结束时间"
                />
              </div>
              <Input
                value={p.techStack.join(", ")}
                onChange={(e) =>
                  updateProject(p.id, {
                    techStack: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
                  })
                }
                placeholder="技术栈（逗号分隔）"
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeProject(p.id)}
              className="ml-2 text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              项目描述（每行一条）
            </label>
            <Textarea
              value={p.descriptions.join("\n")}
              onChange={(e) =>
                updateProject(p.id, {
                  descriptions: e.target.value.split("\n").filter(Boolean),
                })
              }
              placeholder="项目描述..."
              rows={4}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              标签（逗号分隔）
            </label>
            <Input
              value={p.tags.join(", ")}
              onChange={(e) =>
                updateProject(p.id, {
                  tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
                })
              }
              placeholder="前端, React, 性能优化"
            />
          </div>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={handleAdd} className="w-full">
        <Plus className="w-4 h-4" /> 添加项目经历
      </Button>
    </div>
  );
}

function SkillSection() {
  const skills = useResumeStore((s) => s.resume.skills);
  const addSkill = useResumeStore((s) => s.addSkill);
  const updateSkill = useResumeStore((s) => s.updateSkill);
  const removeSkill = useResumeStore((s) => s.removeSkill);

  const handleAdd = () => {
    addSkill({ id: generateId(), category: "", items: [] });
  };

  return (
    <div className="space-y-3">
      {skills.map((sk) => (
        <div key={sk.id} className="flex items-center gap-3">
          <Input
            value={sk.category}
            onChange={(e) => updateSkill(sk.id, { category: e.target.value })}
            placeholder="类别（如：编程语言）"
            className="w-40"
          />
          <Input
            value={sk.items.join(", ")}
            onChange={(e) =>
              updateSkill(sk.id, {
                items: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
              })
            }
            placeholder="Python, Java, TypeScript"
            className="flex-1"
          />
          <Button variant="ghost" size="sm" onClick={() => removeSkill(sk.id)} className="text-destructive">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={handleAdd} className="w-full">
        <Plus className="w-4 h-4" /> 添加技能类别
      </Button>
    </div>
  );
}

function AwardSection() {
  const awards = useResumeStore((s) => s.resume.awards);
  const addAward = useResumeStore((s) => s.addAward);
  const updateAward = useResumeStore((s) => s.updateAward);
  const removeAward = useResumeStore((s) => s.removeAward);

  const handleAdd = () => {
    addAward({ id: generateId(), name: "", date: "" });
  };

  return (
    <div className="space-y-3">
      {awards.map((a) => (
        <div key={a.id} className="flex items-center gap-3">
          <Input
            value={a.name}
            onChange={(e) => updateAward(a.id, { name: e.target.value })}
            placeholder="奖项名称"
            className="flex-1"
          />
          <Input
            value={a.date}
            onChange={(e) => updateAward(a.id, { date: e.target.value })}
            placeholder="获奖时间"
            className="w-32"
          />
          <Input
            value={a.description || ""}
            onChange={(e) => updateAward(a.id, { description: e.target.value })}
            placeholder="描述（可选）"
            className="flex-1"
          />
          <Button variant="ghost" size="sm" onClick={() => removeAward(a.id)} className="text-destructive">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={handleAdd} className="w-full">
        <Plus className="w-4 h-4" /> 添加荣誉奖项
      </Button>
    </div>
  );
}

const sectionComponents: Record<string, React.FC> = {
  personal: PersonalSection,
  education: EducationSection,
  work: WorkSection,
  campus: CampusSection,
  project: ProjectSection,
  skill: SkillSection,
  award: AwardSection,
};

// ─── Custom section editor ──────────────────────────────────────────────────
function CustomSectionEditor({ sectionId }: { sectionId: string }) {
  const section = useResumeStore((s) =>
    (s.resume.customSections || []).find((sec) => sec.id === sectionId)
  );
  const addItem = useResumeStore((s) => s.addCustomSectionItem);
  const updateItem = useResumeStore((s) => s.updateCustomSectionItem);
  const removeItem = useResumeStore((s) => s.removeCustomSectionItem);

  if (!section) return null;

  const handleAdd = () => {
    addItem(sectionId, {
      id: generateId(),
      heading: "",
      subheading: "",
      date: "",
      descriptions: [],
    });
  };

  return (
    <div className="space-y-3">
      {section.items.map((item) => (
        <div key={item.id} className="border border-border rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-2">
            <Input
              value={item.heading}
              onChange={(e) => updateItem(sectionId, item.id, { heading: e.target.value })}
              placeholder="标题（必填）"
              className="flex-1"
            />
            <Input
              value={item.date || ""}
              onChange={(e) => updateItem(sectionId, item.id, { date: e.target.value })}
              placeholder="时间"
              className="w-32"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeItem(sectionId, item.id)}
              className="text-destructive shrink-0"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          <Input
            value={item.subheading || ""}
            onChange={(e) => updateItem(sectionId, item.id, { subheading: e.target.value })}
            placeholder="副标题（如机构名称、角色等，可选）"
          />
          <Textarea
            value={(item.descriptions || []).join("\n")}
            onChange={(e) =>
              updateItem(sectionId, item.id, {
                descriptions: e.target.value.split("\n").filter(Boolean),
              })
            }
            placeholder="描述内容，每行一条"
            rows={3}
          />
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={handleAdd} className="w-full">
        <Plus className="w-4 h-4" /> 添加条目
      </Button>
    </div>
  );
}

// ─── Portfolio section editor ────────────────────────────────────────────────
// Specialized editor for 作品集: each item supports image upload OR link + editable fields

// Editable label + value row used inside PortfolioItemCard
function FieldRow({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [editing, setEditing] = useState(false);
  return (
    <div className="flex items-center gap-2 text-xs">
      <span
        className="w-14 shrink-0 text-muted-foreground cursor-pointer hover:text-primary transition-colors"
        onClick={() => setEditing(true)}
        title="点击修改字段名"
      >
        {label}
      </span>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-7 text-xs"
      />
    </div>
  );
}

function PortfolioItemCard({
  sectionId,
  item,
}: {
  sectionId: string;
  item: CustomSection["items"][0];
}) {
  const updateItem = useResumeStore((s) => s.updateCustomSectionItem);
  const removeItem = useResumeStore((s) => s.removeCustomSectionItem);
  const [linkMode, setLinkMode] = useState<"upload" | "url">(
    item.imageUrl?.startsWith("http") ? "url" : "upload"
  );

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) =>
      updateItem(sectionId, item.id, { imageUrl: ev.target?.result as string });
    reader.readAsDataURL(file);
  };

  const u = (data: Partial<typeof item>) => updateItem(sectionId, item.id, data);

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card">
      {/* Image / preview area */}
      <div className="relative bg-muted/30 border-b border-border" style={{ minHeight: 140 }}>
        {item.imageUrl ? (
          <>
            <img
              src={item.imageUrl}
              alt={item.heading || "作品"}
              className="w-full object-cover"
              style={{ maxHeight: 200 }}
            />
            <button
              onClick={() => u({ imageUrl: undefined })}
              className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-colors"
              title="移除图片"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-36 gap-3">
            {/* Toggle upload / url */}
            <div className="flex rounded-lg overflow-hidden border border-border text-xs">
              <button
                onClick={() => setLinkMode("upload")}
                className={`px-3 py-1.5 transition-colors ${
                  linkMode === "upload" ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                }`}
              >
                上传图片
              </button>
              <button
                onClick={() => setLinkMode("url")}
                className={`px-3 py-1.5 transition-colors ${
                  linkMode === "url" ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                }`}
              >
                图片链接
              </button>
            </div>
            {linkMode === "upload" ? (
              <label className="cursor-pointer flex items-center gap-1.5 text-xs text-primary hover:underline">
                <Upload className="w-3.5 h-3.5" />
                选择图片
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageFile}
                />
              </label>
            ) : (
              <Input
                value={item.imageUrl || ""}
                onChange={(e) => u({ imageUrl: e.target.value })}
                placeholder="https://example.com/image.png"
                className="h-7 text-xs w-64"
              />
            )}
          </div>
        )}
      </div>

      {/* Editable fields */}
      <div className="p-3 space-y-1.5">
        <FieldRow
          label="作品名称"
          value={item.heading}
          onChange={(v) => u({ heading: v })}
          placeholder="作品标题"
        />
        <FieldRow
          label="简介"
          value={item.subheading || ""}
          onChange={(v) => u({ subheading: v })}
          placeholder="一句话描述"
        />
        <FieldRow
          label="时间"
          value={item.date || ""}
          onChange={(v) => u({ date: v })}
          placeholder="2024.06"
        />
        <div className="flex items-center gap-2 text-xs">
          <span className="w-14 shrink-0 text-muted-foreground">链接</span>
          <Input
            value={item.link || ""}
            onChange={(e) => u({ link: e.target.value })}
            placeholder="https://..."
            className="h-7 text-xs"
          />
          {item.link && (
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline shrink-0 text-xs"
            >
              打开
            </a>
          )}
        </div>
      </div>

      {/* Delete */}
      <div className="px-3 pb-3 flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => removeItem(sectionId, item.id)}
          className="text-destructive text-xs h-7"
        >
          <Trash2 className="w-3 h-3" /> 删除作品
        </Button>
      </div>
    </div>
  );
}

function PortfolioSectionEditor({ sectionId }: { sectionId: string }) {
  const section = useResumeStore((s) =>
    (s.resume.customSections || []).find((sec) => sec.id === sectionId)
  );
  const addItem = useResumeStore((s) => s.addCustomSectionItem);

  if (!section) return null;

  const handleAdd = () => {
    addItem(sectionId, {
      id: generateId(),
      heading: "",
      subheading: "",
      date: "",
      descriptions: [],
      imageUrl: undefined,
      link: "",
    });
  };

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 mb-3">
        {section.items.map((item) => (
          <PortfolioItemCard key={item.id} sectionId={sectionId} item={item} />
        ))}
      </div>
      <Button variant="outline" size="sm" onClick={handleAdd} className="w-full">
        <Plus className="w-4 h-4" /> 添加作品
      </Button>
    </div>
  );
}

// ─── Module selector bar ────────────────────────────────────────────────────
// Each predefined module maps to either a built-in type or a custom section title
const PRESET_MODULES = [
  { key: "education", label: "教育经历",     type: "education" as const },
  { key: "work",      label: "工作/实习经历", type: "work"      as const },
  { key: "campus",    label: "校园经历",     type: "campus"    as const },
  { key: "project",   label: "项目经历",     type: "project"   as const },
  { key: "award",     label: "荣誉奖项",     type: "award"     as const },
  { key: "skill",     label: "专业技能",     type: "skill"     as const },
  { key: "research",  label: "研究经历",     type: "custom"    as const },
  { key: "portfolio", label: "作品集",       type: "custom"    as const },
  { key: "website",   label: "个人网站",     type: "custom"    as const },
  { key: "custom",    label: "自定义",       type: "custom"    as const },
] as const;

function ModuleBar({
  onAddModule,
}: {
  onAddModule: (key: string, label: string, type: string) => void;
}) {
  const resume = useResumeStore((s) => s.resume);

  const isModulePresent = (key: string, type: string): boolean => {
    if (type !== "custom") {
      return resume.moduleOrder.some((m) => m.type === type);
    }
    // custom: match by section title (research / portfolio) or presence of any custom section
    if (key === "custom") return false; // always show as addable
    const label = PRESET_MODULES.find((p) => p.key === key)?.label || "";
    return (resume.customSections || []).some((sec) => sec.title === label);
  };

  const getCount = (key: string, type: string): number => {
    if (type === "education") return resume.education.length;
    if (type === "work") return resume.work.length;
    if (type === "campus") return (resume.campus || []).length;
    if (type === "project") return resume.projects.length;
    if (type === "award") return (resume.awards || []).length;
    if (type === "skill") return resume.skills.length;
    if (type === "custom" && key !== "custom") {
      const label = PRESET_MODULES.find((p) => p.key === key)?.label || "";
      const sec = (resume.customSections || []).find((s) => s.title === label);
      return sec?.items.length || 0;
    }
    return 0;
  };

  return (
    <div className="flex flex-wrap gap-2 mb-6 p-4 bg-card border border-border rounded-xl">
      <p className="w-full text-xs font-medium text-muted-foreground mb-1">经历模块</p>
      {PRESET_MODULES.map((mod) => {
        const present = isModulePresent(mod.key, mod.type);
        const count = getCount(mod.key, mod.type);
        return (
          <button
            key={mod.key}
            onClick={() => {
              if (!present || mod.key === "custom") {
                onAddModule(mod.key, mod.label, mod.type);
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              present
                ? "bg-primary/10 border-primary/30 text-primary cursor-default"
                : "bg-card border-border text-muted-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/5 cursor-pointer"
            }`}
          >
            {present ? (
              <Check className="w-3 h-3" />
            ) : (
              <Plus className="w-3 h-3" />
            )}
            {mod.label}
            {present && count > 0 && (
              <span className="ml-0.5 opacity-60">({count})</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default function ProfilePage() {
  const resume = useResumeStore((s) => s.resume);
  const toggleModuleVisibility = useResumeStore((s) => s.toggleModuleVisibility);
  const updateModuleTitle = useResumeStore((s) => s.updateModuleTitle);
  const addCustomSection = useResumeStore((s) => s.addCustomSection);
  const removeCustomSection = useResumeStore((s) => s.removeCustomSection);
  const searchParams = useSearchParams();
  const router = useRouter();
  const fromUpload = searchParams.get("from") === "upload";

  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(resume.moduleOrder.map((m) => m.id))
  );

  const toggleExpand = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const hasContent =
    resume.personal.name ||
    resume.education.length > 0 ||
    resume.work.length > 0 ||
    resume.projects.length > 0;

  // Handle adding a module from the bar
  const handleAddModule = (key: string, label: string, type: string) => {
    if (type !== "custom") {
      // Built-in modules: just expand if already in moduleOrder (shouldn't reach here normally)
      const existing = resume.moduleOrder.find((m) => m.type === type);
      if (existing) {
        setExpandedSections((prev) => new Set(prev).add(existing.id));
        document.getElementById(`module-${existing.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      return;
    }
    // Custom section: check if one with this label already exists
    const existingCustom = (resume.customSections || []).find((s) => s.title === label);
    if (existingCustom) {
      setExpandedSections((prev) => new Set(prev).add(existingCustom.id));
      document.getElementById(`module-${existingCustom.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    // Create new
    const displayLabel = key === "custom"
      ? `自定义模块 ${(resume.customSections || []).length + 1}`
      : label;
    const newSection: CustomSection = {
      id: generateId(),
      title: displayLabel,
      items: [],
    };
    addCustomSection(newSection);
    setExpandedSections((prev) => new Set(prev).add(newSection.id));
    setTimeout(() => {
      document.getElementById(`module-${newSection.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* 来自上传流程时显示引导下一步的横幅 */}
      {fromUpload && (
        <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-center justify-between gap-4">
          <div>
            <p className="font-medium text-sm text-foreground">简历已解析，请确认并修改内容</p>
            <p className="text-xs text-muted-foreground mt-0.5">检查各模块内容无误后，点击右侧按钮继续下一步</p>
          </div>
          <Button onClick={() => router.push("/analyze")} className="shrink-0">
            确认完成 → 岗位分析
          </Button>
        </div>
      )}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">简历库 / 个人中心</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            管理你的所有简历内容，这里是你的经历总库
          </p>
        </div>
        {!hasContent && (
          <Link href="/upload">
            <Button>
              <Upload className="w-4 h-4" /> 上传简历自动填充
            </Button>
          </Link>
        )}
      </div>

      {/* Module selector bar */}
      <ModuleBar onAddModule={handleAddModule} />

      <div className="space-y-4">
        {resume.moduleOrder
          .sort((a, b) => a.order - b.order)
          .map((mod) => {
            const isExpanded = expandedSections.has(mod.id);

            // Custom section
            if (mod.type === "custom") {
              const sec = (resume.customSections || []).find((s) => s.id === mod.id);
              if (!sec) return null;
              return (
                <Card key={mod.id} id={`module-${mod.id}`} className={!mod.visible ? "opacity-50" : ""}>
                  <CardHeader className="flex flex-row items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                      <button onClick={() => toggleExpand(mod.id)} className="flex items-center gap-2">
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                      <input
                        value={mod.title}
                        onChange={(e) => {
                          updateModuleTitle(mod.id, e.target.value);
                          useResumeStore.getState().updateCustomSectionTitle(mod.id, e.target.value);
                        }}
                        className="font-semibold text-foreground bg-transparent border-none outline-none focus:ring-0 p-0 text-sm"
                      />
                      <Badge variant="secondary">{sec.items.length} 条</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleModuleVisibility(mod.id)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {mod.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`确定删除「${mod.title}」模块吗？`)) {
                            removeCustomSection(mod.id);
                          }
                        }}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        title="删除模块"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </CardHeader>
                  {isExpanded && (
                    <CardContent>
                      {sec.title === "作品集" || sec.title === "个人网站" ? (
                        <PortfolioSectionEditor sectionId={mod.id} />
                      ) : (
                        <CustomSectionEditor sectionId={mod.id} />
                      )}
                    </CardContent>
                  )}
                </Card>
              );
            }

            // Built-in section
            const Component = sectionComponents[mod.type];
            if (!Component) return null;

            return (
              <Card key={mod.id} id={`module-${mod.id}`} className={!mod.visible ? "opacity-50" : ""}>
                <CardHeader className="flex flex-row items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                    <button
                      onClick={() => toggleExpand(mod.id)}
                      className="flex items-center gap-2"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                    <input
                      value={mod.title}
                      onChange={(e) => updateModuleTitle(mod.id, e.target.value)}
                      className="font-semibold text-foreground bg-transparent border-none outline-none focus:ring-0 p-0 text-sm"
                    />
                    {mod.type === "work" && (
                      <Badge variant="secondary">{resume.work.length} 条</Badge>
                    )}
                    {mod.type === "campus" && (
                      <Badge variant="secondary">{(resume.campus || []).length} 条</Badge>
                    )}
                    {mod.type === "project" && (
                      <Badge variant="secondary">{resume.projects.length} 条</Badge>
                    )}
                    {mod.type === "education" && (
                      <Badge variant="secondary">{resume.education.length} 条</Badge>
                    )}
                  </div>
                  <button
                    onClick={() => toggleModuleVisibility(mod.id)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {mod.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </CardHeader>
                {isExpanded && (
                  <CardContent>
                    <Component />
                  </CardContent>
                )}
              </Card>
            );
          })}
      </div>
    </div>
  );
}
