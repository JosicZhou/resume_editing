"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Upload,
  Target,
  Sparkles,
  ClipboardCheck,
  Eye,
  User,
  Check,
  KeyRound,
  History,
} from "lucide-react";
import ApiConfigModal from "./ApiConfigModal";

const steps = [
  { href: "/upload",   label: "上传简历", icon: Upload,         step: 1 },
  { href: "/analyze",  label: "岗位分析", icon: Target,         step: 2 },
  { href: "/tailor",   label: "岗位匹配", icon: ClipboardCheck, step: 3 },
  { href: "/optimize", label: "内容优化", icon: Sparkles,       step: 4 },
  { href: "/preview",  label: "预览导出", icon: Eye,            step: 5 },
];

export default function TopNav() {
  const pathname = usePathname();
  const [apiModalOpen, setApiModalOpen] = useState(false);

  const currentStepIndex = steps.findIndex((s) => pathname.startsWith(s.href));

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border">
      <div className="max-w-6xl mx-auto px-6">
        {/* Top row: logo + API 设置 + profile */}
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">RF</span>
            </div>
            <span className="font-bold text-foreground tracking-tight">
              ResumeForge
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setApiModalOpen(true)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors",
                "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <KeyRound className="w-4 h-4" />
              <span>API 设置</span>
            </button>
            <Link
              href="/history"
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors",
                pathname === "/history"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <History className="w-4 h-4" />
              <span>导出记录</span>
            </Link>
            <Link
              href="/profile"
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors",
                pathname === "/profile"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <User className="w-4 h-4" />
              <span>简历库</span>
            </Link>
          </div>
        </div>

        <ApiConfigModal open={apiModalOpen} onClose={() => setApiModalOpen(false)} />

        {/* Step bar */}
        {pathname !== "/" && pathname !== "/profile" && pathname !== "/history" && (
          <div className="flex items-center justify-center pb-3 -mt-1">
            {steps.map((step, i) => {
              const isActive = pathname.startsWith(step.href);
              const isPast = currentStepIndex > i;
              const isFuture = currentStepIndex < i;

              return (
                <div key={step.href} className="flex items-center">
                  <Link
                    href={step.href}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                      isActive &&
                        "bg-primary text-primary-foreground shadow-sm",
                      isPast &&
                        "bg-green-100 text-green-700 hover:bg-green-200",
                      isFuture &&
                        "text-muted-foreground hover:bg-accent",
                      !isActive && !isPast && !isFuture &&
                        "text-muted-foreground"
                    )}
                  >
                    {isPast ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <step.icon className="w-3.5 h-3.5" />
                    )}
                    <span className="hidden sm:inline">{step.label}</span>
                    <span className="sm:hidden">{step.step}</span>
                  </Link>
                  {i < steps.length - 1 && (
                    <div
                      className={cn(
                        "w-8 h-px mx-1",
                        isPast ? "bg-green-300" : "bg-border"
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
}
