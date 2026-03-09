"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, ServerCrash, CheckCircle } from "lucide-react";
import Button from "@/components/ui/Button";

type Status = "checking" | "online" | "starting" | "offline";

interface Props {
  /** 服务上线后触发 */
  onOnline?: () => void;
}

export default function ServerWakeup({ onOnline }: Props) {
  const [status, setStatus] = useState<Status>("checking");
  const [seconds, setSeconds] = useState(0);

  const check = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch("/api/server-status");
      const data = await res.json();
      return data.status === "online";
    } catch {
      return false;
    }
  }, []);

  // 首次自动检测
  useEffect(() => {
    check().then((online) => {
      setStatus(online ? "online" : "offline");
      if (online) onOnline?.();
    });
  }, [check, onOnline]);

  // 在 "starting" 状态时每 5 秒自动轮询 + 更新秒数
  useEffect(() => {
    if (status !== "starting") return;

    const interval = setInterval(async () => {
      setSeconds((s) => s + 5);
      const online = await check();
      if (online) {
        setStatus("online");
        onOnline?.();
      }
    }, 5000);

    const ticker = setInterval(() => setSeconds((s) => s + 1), 1000);

    return () => {
      clearInterval(interval);
      clearInterval(ticker);
    };
  }, [status, check, onOnline]);

  const handleWake = async () => {
    setStatus("starting");
    setSeconds(0);

    // 主动发送唤醒请求到 Render 服务器
    console.log("🚀 发送唤醒请求...");
    try {
      const response = await fetch("/api/server-status?wake=true", {
        method: "GET",
      });
      const data = await response.json();
      console.log("✅ 唤醒请求响应:", data);
    } catch (error) {
      console.error("❌ 唤醒请求失败:", error);
    }

    // 立即 ping 一次，有可能已经唤醒
    const online = await check();
    if (online) {
      setStatus("online");
      onOnline?.();
    }
  };

  if (status === "checking") {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>正在检测服务器状态...</span>
      </div>
    );
  }

  if (status === "online") {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600 py-2">
        <CheckCircle className="w-4 h-4" />
        <span>服务器已就绪</span>
      </div>
    );
  }

  if (status === "starting") {
    return (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <div className="flex items-center gap-2 text-blue-700 mb-3">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="font-medium">服务器启动中</span>
          <span className="ml-auto text-blue-500 text-sm">{seconds}s</span>
        </div>
        <div className="space-y-2 text-sm text-blue-600">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span>正在唤醒服务器，请耐心等待...</span>
          </div>
          <div className="flex items-center gap-2 text-blue-400">
            <div className="w-2 h-2 rounded-full bg-blue-200" />
            <span>启动完成后将自动解锁功能</span>
          </div>
        </div>
      </div>
    );
  }

  // offline
  return (
    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
      <div className="flex items-center gap-2 text-amber-700 mb-2">
        <ServerCrash className="w-4 h-4" />
        <span className="font-medium">服务器当前处于休眠状态</span>
      </div>
      <p className="text-sm text-amber-600 mb-3">
        首次使用需要启动服务器，约需 30~60 秒，启动后即可正常使用。
      </p>
      <Button onClick={handleWake}>启动服务器</Button>
    </div>
  );
}
