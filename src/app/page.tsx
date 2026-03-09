"use client";

import Link from "next/link";
import { useResumeStore } from "@/lib/store";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import {
  Upload,
  Target,
  Sparkles,
  ClipboardCheck,
  Eye,
  ArrowRight,
  CheckCircle,
  FileText,
} from "lucide-react";

const steps = [
  {
    step: 1,
    href: "/upload",
    icon: Upload,
    title: "上传简历",
    desc: "上传 PDF 简历，AI 自动解析所有模块内容并存入简历库",
  },
  {
    step: 2,
    href: "/analyze",
    icon: Target,
    title: "岗位分析",
    desc: "添加目标岗位 JD，AI 分析岗位要求和关键词",
  },
  {
    step: 3,
    href: "/tailor",
    icon: ClipboardCheck,
    title: "岗位匹配",
    desc: "AI 根据 JD 分析结果智能匹配相关经历，确保简历垂直度",
  },
  {
    step: 4,
    href: "/optimize",
    icon: Sparkles,
    title: "AI 内容优化",
    desc: "根据 JD 关键词优化简历描述，提高 AI 筛选通过率",
  },
  {
    step: 5,
    href: "/preview",
    icon: Eye,
    title: "预览导出",
    desc: "最终检查简历内容，确认无误后导出为精美 PDF",
  },
];

export default function HomePage() {
  const resume = useResumeStore((s) => s.resume);
  const hasResume =
    resume.personal.name ||
    resume.work.length > 0 ||
    resume.projects.length > 0;

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      {/* Hero */}
      <div className="text-center mb-14">
        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-5">
          <FileText className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-3">
          根据 JD 精准优化你的简历
        </h1>
        <p className="text-muted-foreground text-lg max-w-lg mx-auto">
          5 步流程，从上传到导出，AI 帮你分析岗位、匹配经历、优化描述
        </p>
      </div>

      {/* Steps */}
      <div className="space-y-3 mb-12">
        {steps.map((s, i) => (
          <Link key={s.href} href={s.href} className="block group">
            <div className="flex items-center gap-5 p-5 rounded-xl border border-border bg-card hover:border-primary/40 hover:shadow-sm transition-all">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                <s.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-mono">
                    STEP {s.step}
                  </span>
                  <h3 className="font-semibold text-foreground">{s.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {s.desc}
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Start */}
      <div className="text-center space-y-4">
        {hasResume ? (
          <>
            <Badge variant="success">简历库已有数据</Badge>
            <div className="flex justify-center gap-3">
              <Link href="/analyze">
                <Button size="lg">
                  开始分析岗位 <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/profile">
                <Button variant="outline" size="lg">
                  管理简历库
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <Link href="/upload">
            <Button size="lg">
              开始：上传简历 <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
