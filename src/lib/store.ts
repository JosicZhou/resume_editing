"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  ResumeData,
  JobDescription,
  TailoredResume,
  ApplicationForm,
  PersonalInfo,
  Education,
  WorkExperience,
  Project,
  Skill,
  Award,
  CustomSection,
  ResumeModule,
  OptimizePrompts,
  JdAnalysisResult,
  ExportRecord,
  createEmptyResume,
  generateId,
} from "./types";

export interface ApiConfig {
  apiUrl: string;
  apiKey: string;
  model: string;
}

interface ResumeStore {
  resume: ResumeData;
  jobs: JobDescription[];
  tailoredResumes: TailoredResume[];
  applicationForms: ApplicationForm[];
  exportHistory: ExportRecord[];
  currentJobId: string | null;
  currentTailoredId: string | null;
  optimizePrompts: OptimizePrompts;
  apiConfig: ApiConfig;

  setResume: (resume: ResumeData) => void;
  setApiConfig: (config: Partial<ApiConfig>) => void;
  updatePersonal: (personal: Partial<PersonalInfo>) => void;

  addEducation: (edu: Education) => void;
  updateEducation: (id: string, edu: Partial<Education>) => void;
  removeEducation: (id: string) => void;

  addWork: (work: WorkExperience) => void;
  updateWork: (id: string, work: Partial<WorkExperience>) => void;
  removeWork: (id: string) => void;

  addCampus: (campus: WorkExperience) => void;
  updateCampus: (id: string, campus: Partial<WorkExperience>) => void;
  removeCampus: (id: string) => void;

  addProject: (project: Project) => void;
  updateProject: (id: string, project: Partial<Project>) => void;
  removeProject: (id: string) => void;

  // 新增：仅更新岗位版本的预览编辑，不影响简历库
  updateTailoredPreviewWork: (tailoredId: string, workId: string, work: Partial<WorkExperience>) => void;
  updateTailoredPreviewCampus: (tailoredId: string, campusId: string, campus: Partial<WorkExperience>) => void;
  updateTailoredPreviewProject: (tailoredId: string, projectId: string, project: Partial<Project>) => void;

  addSkill: (skill: Skill) => void;
  updateSkill: (id: string, skill: Partial<Skill>) => void;
  removeSkill: (id: string) => void;

  addAward: (award: Award) => void;
  updateAward: (id: string, award: Partial<Award>) => void;
  removeAward: (id: string) => void;

  updateModuleOrder: (modules: ResumeModule[]) => void;
  toggleModuleVisibility: (id: string) => void;
  updateModuleTitle: (id: string, title: string) => void;

  addCustomSection: (section: CustomSection) => void;
  updateCustomSectionTitle: (id: string, title: string) => void;
  removeCustomSection: (id: string) => void;
  addCustomSectionItem: (sectionId: string, item: CustomSection["items"][0]) => void;
  updateCustomSectionItem: (sectionId: string, itemId: string, data: Partial<CustomSection["items"][0]>) => void;
  removeCustomSectionItem: (sectionId: string, itemId: string) => void;

  addJob: (job: JobDescription) => void;
  removeJob: (id: string) => void;
  setCurrentJob: (id: string | null) => void;

  createTailoredResume: (jobId: string) => string;
  updateTailoredResume: (id: string, data: Partial<TailoredResume>) => void;
  setCurrentTailored: (id: string | null) => void;

  setOptimizePrompt: (key: keyof OptimizePrompts, value: string) => void;

  addApplicationForm: (form: ApplicationForm) => void;

  addExportRecord: (record: Omit<ExportRecord, "id" | "exportedAt">) => void;
  removeExportRecord: (id: string) => void;
  updateExportRecord: (id: string, updates: Partial<Pick<ExportRecord, "resumeSnapshot" | "tailoredSnapshot" | "jobTitle" | "company">>) => void;
}

const DEFAULT_PROMPTS: OptimizePrompts = {
  jdAnalysis: `你是一个专业的招聘分析助手。我正在投递{company_name}{job_title}这个岗位。

请严格按照以下JSON格式输出分析结果，不要添加任何解释、前言、后缀或markdown标记：

{{
  "abilityPositioning": "能力定位描述（分析这个岗位侧重执行、协调、决策还是管理）",
  "hardSkills": ["技能1", "技能2", "技能3"],
  "softSkills": ["能力1", "能力2", "能力3"],
  "experienceKeywords": ["经验1", "经验2", "经验3"],
  "painPoints": ["痛点1", "痛点2", "痛点3"],
  "companyCulture": "公司文化描述（通过分析岗位JD的文风，总结公司或用人团队的文化）"
}}

分析要求：
1. abilityPositioning：分析这个岗位侧重执行、协调、决策还是管理
2. hardSkills：提炼5-10个胜任这个岗位所需的硬技能关键词（数组）
3. softSkills：提炼5-10个所需的软能力关键词（数组）
4. experienceKeywords：提炼5-10个相关经验关键词（数组）
5. painPoints：分析这个岗位需要解决的痛点（数组）
6. companyCulture：通过分析岗位JD的文风，总结公司或用人团队的文化

该岗位的JD如下:
{job_description}

重要：请直接输出JSON对象，不要包含任何其他文字、解释或markdown代码块标记。`,

  resumeRewrite: `这是我目前的简历:
{resume_preview}

目标岗位JD如下:
{job_description}

请你根据{job_description}修改我的简历，提升简历与岗位要求的匹配度，请按照以下步骤修改:
1.将我的原始简历话术修改得更符合岗位的专业性，以提高ATS匹配度。
2.将以下关键词有选择地精准地融入我的简历中: {keywords}，如果有同义内容，可以直接替换为岗位中的关键词，如"需求挖掘"可以直接改成"需求调研"。
3.对我简历中的过往经历进行重写，体现{ability_positioning}的工作思维
4.每条描述以"关键词：描述"的格式撰写，关键词为该条描述最核心的能力或成果词。
5.不要凭空捏造我的背景经历，不要将a经历的内容放到b经历里说。不要混淆我的经历。

请以JSON格式输出每条经历的修改结果，格式为:
{{"work": [{{"id": "原id", "descriptions": ["修改后描述1", "修改后描述2"]}}], "projects": [{{"id": "原id", "descriptions": ["修改后描述1"]}}]}}`,

  languagePolish: `请你扮演一名资深编辑，润色该经历的语言。
要求如下：
1.请重点关注句子的开头动词，将比较平淡、通用的动词(如"负责","完成","进行")替换为更具力量感、更专业的行动动词(Action Verbs)，以更好地体现我的主动性、领导力、执行力或取得的成果。
2.表达去AI化，要贴近互联网职场环境。

我的原始经历描述如下：
{experience_content}

请直接输出润色后的描述列表，每行一条，不要编号。`,

  skillOptimize: `这是我当前简历中的专业技能板块：
{skills_preview}

目标岗位JD如下：
{job_description}

JD 中提炼出的技能关键词：{keywords}

请在不删除我已有技能的基础上，将上述关键词中我尚未具备的技能补充到最匹配的类别中。
要求：
1. 保留我已有的全部技能项，不得删除或修改任何已有内容
2. 将 JD 要求但我尚未列出的技能关键词，加入到最合适的类别中
3. 如需新增类别，请命名为「其他技能」（除非已有更合适的已有类别）
4. 每个类别的 items 为字符串数组，每项是一个独立的技能词

请以 JSON 格式输出更新后的完整技能列表：
{{"skills": [{{"id": "原id", "category": "类别名", "items": ["技能1", "技能2", "技能3"]}}]}}`,
};

export const useResumeStore = create<ResumeStore>()(
  persist(
    (set, get) => ({
      resume: createEmptyResume(),
      jobs: [],
      tailoredResumes: [],
      applicationForms: [],
      exportHistory: [],
      currentJobId: null,
      currentTailoredId: null,
      optimizePrompts: DEFAULT_PROMPTS,
      apiConfig: {
        apiUrl: "",
        apiKey: "",
        model: "",
      },

      setResume: (resume) => set({ resume }),
      setApiConfig: (config) =>
        set((s) => ({
          apiConfig: { ...s.apiConfig, ...config },
        })),

      updatePersonal: (personal) =>
        set((s) => ({
          resume: { ...s.resume, personal: { ...s.resume.personal, ...personal } },
        })),

      addEducation: (edu) =>
        set((s) => ({
          resume: { ...s.resume, education: [...s.resume.education, edu] },
        })),
      updateEducation: (id, edu) =>
        set((s) => ({
          resume: {
            ...s.resume,
            education: s.resume.education.map((e) =>
              e.id === id ? { ...e, ...edu } : e
            ),
          },
        })),
      removeEducation: (id) =>
        set((s) => ({
          resume: {
            ...s.resume,
            education: s.resume.education.filter((e) => e.id !== id),
          },
        })),

      addWork: (work) =>
        set((s) => ({
          resume: { ...s.resume, work: [...s.resume.work, work] },
        })),
      updateWork: (id, work) =>
        set((s) => {
          // 更新简历库中的工作经历
          const updatedResume = {
            ...s.resume,
            work: s.resume.work.map((w) =>
              w.id === id ? { ...w, ...work } : w
            ),
          };

          // 清除所有岗位版本中该项的 previewEdits，因为简历库是最高优先级
          const updatedTailoredResumes = s.tailoredResumes.map((tr) => {
            if (tr.previewEdits?.work?.[id]) {
              const { [id]: removed, ...restWork } = tr.previewEdits.work;
              return {
                ...tr,
                previewEdits: {
                  ...tr.previewEdits,
                  work: restWork,
                },
              };
            }
            return tr;
          });

          return {
            resume: updatedResume,
            tailoredResumes: updatedTailoredResumes,
          };
        }),
      removeWork: (id) =>
        set((s) => ({
          resume: { ...s.resume, work: s.resume.work.filter((w) => w.id !== id) },
        })),

      addCampus: (campus) =>
        set((s) => ({
          resume: { ...s.resume, campus: [...(s.resume.campus || []), campus] },
        })),
      updateCampus: (id, campus) =>
        set((s) => {
          // 更新简历库中的校园经历
          const updatedResume = {
            ...s.resume,
            campus: (s.resume.campus || []).map((c) =>
              c.id === id ? { ...c, ...campus } : c
            ),
          };

          // 清除所有岗位版本中该项的 previewEdits
          const updatedTailoredResumes = s.tailoredResumes.map((tr) => {
            if (tr.previewEdits?.campus?.[id]) {
              const { [id]: removed, ...restCampus } = tr.previewEdits.campus;
              return {
                ...tr,
                previewEdits: {
                  ...tr.previewEdits,
                  campus: restCampus,
                },
              };
            }
            return tr;
          });

          return {
            resume: updatedResume,
            tailoredResumes: updatedTailoredResumes,
          };
        }),
      removeCampus: (id) =>
        set((s) => ({
          resume: { ...s.resume, campus: (s.resume.campus || []).filter((c) => c.id !== id) },
        })),

      addProject: (project) =>
        set((s) => ({
          resume: { ...s.resume, projects: [...s.resume.projects, project] },
        })),
      updateProject: (id, project) =>
        set((s) => {
          // 更新简历库中的项目经历
          const updatedResume = {
            ...s.resume,
            projects: s.resume.projects.map((p) =>
              p.id === id ? { ...p, ...project } : p
            ),
          };

          // 清除所有岗位版本中该项的 previewEdits
          const updatedTailoredResumes = s.tailoredResumes.map((tr) => {
            if (tr.previewEdits?.projects?.[id]) {
              const { [id]: removed, ...restProjects } = tr.previewEdits.projects;
              return {
                ...tr,
                previewEdits: {
                  ...tr.previewEdits,
                  projects: restProjects,
                },
              };
            }
            return tr;
          });

          return {
            resume: updatedResume,
            tailoredResumes: updatedTailoredResumes,
          };
        }),
      removeProject: (id) =>
        set((s) => ({
          resume: {
            ...s.resume,
            projects: s.resume.projects.filter((p) => p.id !== id),
          },
        })),

      addSkill: (skill) =>
        set((s) => ({
          resume: { ...s.resume, skills: [...s.resume.skills, skill] },
        })),
      updateSkill: (id, skill) =>
        set((s) => ({
          resume: {
            ...s.resume,
            skills: s.resume.skills.map((sk) =>
              sk.id === id ? { ...sk, ...skill } : sk
            ),
          },
        })),
      removeSkill: (id) =>
        set((s) => ({
          resume: { ...s.resume, skills: s.resume.skills.filter((sk) => sk.id !== id) },
        })),

      addAward: (award) =>
        set((s) => ({
          resume: { ...s.resume, awards: [...s.resume.awards, award] },
        })),
      updateAward: (id, award) =>
        set((s) => ({
          resume: {
            ...s.resume,
            awards: s.resume.awards.map((a) =>
              a.id === id ? { ...a, ...award } : a
            ),
          },
        })),
      removeAward: (id) =>
        set((s) => ({
          resume: { ...s.resume, awards: s.resume.awards.filter((a) => a.id !== id) },
        })),

      updateModuleOrder: (modules) =>
        set((s) => ({
          resume: { ...s.resume, moduleOrder: modules },
        })),
      toggleModuleVisibility: (id) =>
        set((s) => ({
          resume: {
            ...s.resume,
            moduleOrder: s.resume.moduleOrder.map((m) =>
              m.id === id ? { ...m, visible: !m.visible } : m
            ),
          },
        })),
      updateModuleTitle: (id, title) =>
        set((s) => ({
          resume: {
            ...s.resume,
            moduleOrder: s.resume.moduleOrder.map((m) =>
              m.id === id ? { ...m, title } : m
            ),
          },
        })),

      addCustomSection: (section) =>
        set((s) => ({
          resume: {
            ...s.resume,
            customSections: [...(s.resume.customSections || []), section],
            moduleOrder: [
              ...s.resume.moduleOrder,
              {
                id: section.id,
                type: "custom" as const,
                title: section.title,
                visible: true,
                order: s.resume.moduleOrder.length,
              },
            ],
          },
        })),

      updateCustomSectionTitle: (id, title) =>
        set((s) => ({
          resume: {
            ...s.resume,
            customSections: (s.resume.customSections || []).map((sec) =>
              sec.id === id ? { ...sec, title } : sec
            ),
            moduleOrder: s.resume.moduleOrder.map((m) =>
              m.id === id ? { ...m, title } : m
            ),
          },
        })),

      removeCustomSection: (id) =>
        set((s) => ({
          resume: {
            ...s.resume,
            customSections: (s.resume.customSections || []).filter((sec) => sec.id !== id),
            moduleOrder: s.resume.moduleOrder.filter((m) => m.id !== id),
          },
        })),

      addCustomSectionItem: (sectionId, item) =>
        set((s) => ({
          resume: {
            ...s.resume,
            customSections: (s.resume.customSections || []).map((sec) =>
              sec.id === sectionId ? { ...sec, items: [...sec.items, item] } : sec
            ),
          },
        })),

      updateCustomSectionItem: (sectionId, itemId, data) =>
        set((s) => ({
          resume: {
            ...s.resume,
            customSections: (s.resume.customSections || []).map((sec) =>
              sec.id === sectionId
                ? { ...sec, items: sec.items.map((it) => it.id === itemId ? { ...it, ...data } : it) }
                : sec
            ),
          },
        })),

      removeCustomSectionItem: (sectionId, itemId) =>
        set((s) => ({
          resume: {
            ...s.resume,
            customSections: (s.resume.customSections || []).map((sec) =>
              sec.id === sectionId
                ? { ...sec, items: sec.items.filter((it) => it.id !== itemId) }
                : sec
            ),
          },
        })),

      addJob: (job) => set((s) => ({ jobs: [...s.jobs, job] })),
      removeJob: (id) =>
        set((s) => ({ jobs: s.jobs.filter((j) => j.id !== id) })),
      setCurrentJob: (id) => set({ currentJobId: id }),

      createTailoredResume: (jobId) => {
        const id = generateId();
        const { resume } = get();
        const tailored: TailoredResume = {
          id,
          jobId,
          selectedModules: [...resume.moduleOrder],
          selectedWorkIds: resume.work.map((w) => w.id),
          selectedCampusIds: (resume.campus || []).map((c) => c.id),
          selectedProjectIds: resume.projects.map((p) => p.id),
          selectedEducationIds: resume.education.map((e) => e.id),
          selectedAwardIds: (resume.awards || []).map((a) => a.id),
          selectedSkillIds: resume.skills.map((sk) => sk.id),
          selectedCustomSectionIds: (resume.customSections || []).map((sec) => sec.id),
          optimizedContent: null,
          status: "selecting",
          sectionTitleOverrides: {},
          jdAnalysis: null,
          jdRawResponse: "",
          optimizeStep: 1,
          rewrittenDescriptions: {},
          polishedDescriptions: {},
          optimizedSkills: {},
          useOriginalIds: [],
          previewEdits: {},
        };
        set((s) => ({
          tailoredResumes: [...s.tailoredResumes, tailored],
          currentTailoredId: id,
        }));
        return id;
      },
      updateTailoredResume: (id, data) =>
        set((s) => ({
          tailoredResumes: s.tailoredResumes.map((t) =>
            t.id === id ? { ...t, ...data } : t
          ),
        })),
      setCurrentTailored: (id) => set({ currentTailoredId: id }),

      // 新增：仅更新岗位版本的预览编辑，不影响简历库
      updateTailoredPreviewWork: (tailoredId, workId, work) =>
        set((s) => ({
          tailoredResumes: s.tailoredResumes.map((t) =>
            t.id === tailoredId
              ? {
                  ...t,
                  previewEdits: {
                    ...t.previewEdits,
                    work: {
                      ...t.previewEdits?.work,
                      [workId]: {
                        ...t.previewEdits?.work?.[workId],
                        ...work,
                      },
                    },
                  },
                }
              : t
          ),
        })),

      updateTailoredPreviewCampus: (tailoredId, campusId, campus) =>
        set((s) => ({
          tailoredResumes: s.tailoredResumes.map((t) =>
            t.id === tailoredId
              ? {
                  ...t,
                  previewEdits: {
                    ...t.previewEdits,
                    campus: {
                      ...t.previewEdits?.campus,
                      [campusId]: {
                        ...t.previewEdits?.campus?.[campusId],
                        ...campus,
                      },
                    },
                  },
                }
              : t
          ),
        })),

      updateTailoredPreviewProject: (tailoredId, projectId, project) =>
        set((s) => ({
          tailoredResumes: s.tailoredResumes.map((t) =>
            t.id === tailoredId
              ? {
                  ...t,
                  previewEdits: {
                    ...t.previewEdits,
                    projects: {
                      ...t.previewEdits?.projects,
                      [projectId]: {
                        ...t.previewEdits?.projects?.[projectId],
                        ...project,
                      },
                    },
                  },
                }
              : t
          ),
        })),

      setOptimizePrompt: (key, value) =>
        set((s) => ({
          optimizePrompts: { ...s.optimizePrompts, [key]: value },
        })),

      addApplicationForm: (form) =>
        set((s) => ({ applicationForms: [...s.applicationForms, form] })),

      addExportRecord: (record) =>
        set((s) => ({
          exportHistory: [
            {
              ...record,
              id: generateId(),
              exportedAt: new Date().toISOString(),
            },
            ...s.exportHistory,
          ],
        })),

      removeExportRecord: (id) =>
        set((s) => ({
          exportHistory: s.exportHistory.filter((r) => r.id !== id),
        })),

      updateExportRecord: (id, updates) =>
        set((s) => ({
          exportHistory: s.exportHistory.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        })),
    }),
    {
      name: "resume-store",
      skipHydration: true,
      version: 14,
      migrate: (persistedState: any, version: number) => {
        if (version < 6) {
          return { ...persistedState, optimizePrompts: DEFAULT_PROMPTS };
        }
        if (version < 7) {
          const state = persistedState as any;
          return {
            ...state,
            resume: {
              ...state.resume,
              campus: state.resume?.campus || [],
              moduleOrder: state.resume?.moduleOrder?.some((m: any) => m.type === "campus")
                ? state.resume.moduleOrder
                : [
                    ...(state.resume?.moduleOrder || []),
                    { id: "campus", type: "campus", title: "校园经历", visible: true, order: 3 },
                  ],
            },
            tailoredResumes: (state.tailoredResumes || []).map((t: any) => ({
              ...t,
              selectedCampusIds: t.selectedCampusIds || [],
            })),
          };
        }
        if (version < 8) {
          const state = persistedState as any;
          return {
            ...state,
            optimizePrompts: {
              ...DEFAULT_PROMPTS,
              ...(state.optimizePrompts || {}),
              skillOptimize: DEFAULT_PROMPTS.skillOptimize,
            },
            tailoredResumes: (state.tailoredResumes || []).map((t: any) => ({
              ...t,
              optimizedSkills: t.optimizedSkills || {},
            })),
          };
        }
        if (version < 9) {
          const state = persistedState as any;
          return {
            ...state,
            tailoredResumes: (state.tailoredResumes || []).map((t: any) => ({
              ...t,
              selectedAwardIds: t.selectedAwardIds || [],
            })),
          };
        }
        if (version < 10) {
          const state = persistedState as any;
          return {
            ...state,
            tailoredResumes: (state.tailoredResumes || []).map((t: any) => ({
              ...t,
              selectedSkillIds: t.selectedSkillIds || [],
              selectedCustomSectionIds: t.selectedCustomSectionIds || [],
            })),
          };
        }
        if (version < 11) {
          const state = persistedState as any;
          return {
            ...state,
            exportHistory: state.exportHistory || [],
          };
        }
        if (version < 12) {
          const state = persistedState as any;
          return {
            ...state,
            tailoredResumes: (state.tailoredResumes || []).map((t: any) => ({
              ...t,
              useOriginalIds: t.useOriginalIds || [],
            })),
          };
        }
        if (version < 14) {
          const state = persistedState as any;
          return {
            ...state,
            resume: {
              ...state.resume,
              work: (state.resume?.work || []).map((w: any) => ({
                ...w,
                subModules: w.subModules || [],
              })),
              campus: (state.resume?.campus || []).map((c: any) => ({
                ...c,
                subModules: c.subModules || [],
              })),
            },
          };
        }
        return persistedState;
      },
    }
  )
);
