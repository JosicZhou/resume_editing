"use client";

import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "secondary" | "success" | "warning";
  className?: string;
}

export default function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        {
          "bg-primary/10 text-primary": variant === "default",
          "bg-muted text-muted-foreground": variant === "secondary",
          "bg-green-100 text-green-700": variant === "success",
          "bg-amber-100 text-amber-700": variant === "warning",
        },
        className
      )}
    >
      {children}
    </span>
  );
}
