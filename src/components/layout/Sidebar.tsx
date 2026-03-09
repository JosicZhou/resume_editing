"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Upload,
  FileText,
  Target,
  Sparkles,
  ClipboardCheck,
  Eye,
  History,
} from "lucide-react";

const navItems = [
  { href: "/", label: "简历库", icon: FileText, description: "管理简历内容" },
  { href: "/upload", label: "上传简历", icon: Upload, description: "上传并解析" },
  { href: "/tailor", label: "岗位匹配", icon: Target, description: "JD匹配选择" },
  { href: "/optimize", label: "内容优化", icon: Sparkles, description: "AI优化内容" },
  { href: "/adapt", label: "网申适配", icon: ClipboardCheck, description: "表格截图解析" },
  { href: "/preview", label: "预览导出", icon: Eye, description: "检查并导出PDF" },
  { href: "/history", label: "导出记录", icon: History, description: "历史快照管理" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-border">
        <h1 className="text-xl font-bold text-foreground tracking-tight">
          ResumeForge
        </h1>
        <p className="text-xs text-muted-foreground mt-1">AI 智能简历优化</p>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <div>
                <div className="font-medium">{item.label}</div>
                {isActive && (
                  <div className="text-xs opacity-80 mt-0.5">
                    {item.description}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-border">
        <div className="text-xs text-muted-foreground text-center">
          工作流: 上传 → 匹配 → 优化 → 适配 → 导出
        </div>
      </div>
    </aside>
  );
}
