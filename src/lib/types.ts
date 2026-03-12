export interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  github?: string;
  website?: string;
  summary?: string;
  interests?: string;
  avatar?: string;      // base64 data URL — 头像
  schoolLogo?: string;  // base64 data URL — 学校/机构 logo（显示在 header 右侧）
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  major: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  highlights: string[];
  rankTags?: string[]; // e.g. ["QS前100", "USNEWS100"]
}

export interface WorkExperience {
  id: string;
  company: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  descriptions: string[];
  tags: string[];
}

export interface Project {
  id: string;
  name: string;
  role?: string;
  location?: string;
  startDate: string;
  endDate: string;
  descriptions: string[];
  techStack: string[];
  tags: string[];
}

export interface Skill {
  id: string;
  category: string;
  items: string[];
}

export interface Award {
  id: string;
  name: string;
  date: string;
  description?: string;
}

export interface CustomSection {
  id: string;
  title: string;
  items: {
    id: string;
    heading: string;
    subheading?: string;
    date?: string;
    descriptions: string[];
    imageUrl?: string;   // base64 or external URL for portfolio images
    link?: string;       // external link (portfolio URL)
  }[];
}

export type ResumeModuleType =
  | "personal"
  | "education"
  | "work"
  | "campus"
  | "project"
  | "skill"
  | "award"
  | "custom";

export interface ResumeModule {
  id: string;
  type: ResumeModuleType;
  title: string;
  visible: boolean;
  order: number;
}

export interface ResumeData {
  personal: PersonalInfo;
  education: Education[];
  work: WorkExperience[];
  campus: WorkExperience[];
  projects: Project[];
  skills: Skill[];
  awards: Award[];
  customSections: CustomSection[];
  moduleOrder: ResumeModule[];
}

export interface JobDescription {
  id: string;
  title: string;
  company: string;
  rawText: string;
  keywords: string[];
  requirements: string[];
  createdAt: string;
}

export interface TailoredResume {
  id: string;
  jobId: string;
  selectedModules: ResumeModule[];
  selectedWorkIds: string[];
  selectedCampusIds: string[];
  selectedProjectIds: string[];
  selectedEducationIds: string[];
  optimizedContent: Partial<ResumeData> | null;
  status: "selecting" | "optimizing" | "reviewing" | "finalized";
  sectionTitleOverrides: Record<string, string>;
  jdAnalysis: JdAnalysisResult | null;
  jdRawResponse: string;
  optimizeStep: 1 | 2 | 3;
  rewrittenDescriptions: Record<string, string[]>;
  polishedDescriptions: Record<string, string[]>;
  optimizedSkills: Record<string, string[]>; // skillId → updated items
  selectedAwardIds: string[];
  selectedSkillIds: string[];
  selectedCustomSectionIds: string[];
  useOriginalIds: string[]; // IDs of work/project/campus that user chose to use original version
}

export interface JdAnalysisResult {
  abilityPositioning: string;
  hardSkills: string[];
  softSkills: string[];
  experienceKeywords: string[];
  painPoints: string[];
  companyCulture: string;
  rawResponse: string;
}

export interface ExportRecord {
  id: string;
  exportedAt: string; // ISO timestamp
  jobTitle: string;
  company: string;
  resumeSnapshot: ResumeData;
  tailoredSnapshot: TailoredResume | null;
}

export interface OptimizePrompts {
  jdAnalysis: string;
  resumeRewrite: string;
  languagePolish: string;
  skillOptimize: string;
}

export interface ApplicationForm {
  id: string;
  screenshotUrl: string;
  parsedFields: {
    fieldName: string;
    originalLabel: string;
    suggestedValue: string;
  }[];
}

export function createEmptyResume(): ResumeData {
  return {
    personal: {
      name: "",
      email: "",
      phone: "",
      location: "",
    },
    education: [],
    work: [],
    campus: [],
    projects: [],
    skills: [],
    awards: [],
    customSections: [],
    moduleOrder: [
      { id: "personal", type: "personal", title: "个人信息", visible: true, order: 0 },
      { id: "education", type: "education", title: "教育经历", visible: true, order: 1 },
      { id: "work", type: "work", title: "工作/实习经历", visible: true, order: 2 },
      { id: "campus", type: "campus", title: "校园经历", visible: true, order: 3 },
      { id: "project", type: "project", title: "项目经历", visible: true, order: 4 },
      { id: "skill", type: "skill", title: "专业技能", visible: true, order: 5 },
      { id: "award", type: "award", title: "荣誉奖项", visible: true, order: 6 },
    ],
  };
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}
