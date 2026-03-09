"use client";

import { useState, useEffect } from "react";
import { useResumeStore } from "@/lib/store";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Settings, X, RefreshCw } from "lucide-react";

interface ApiConfigModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ApiConfigModal({ open, onClose }: ApiConfigModalProps) {
  const apiConfig = useResumeStore((s) => s.apiConfig);
  const setApiConfig = useResumeStore((s) => s.setApiConfig);

  const [url, setUrl] = useState(apiConfig.apiUrl);
  const [key, setKey] = useState(apiConfig.apiKey);
  const [model, setModel] = useState(apiConfig.model);
  const [models, setModels] = useState<string[]>([]);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [modelsError, setModelsError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setUrl(apiConfig.apiUrl);
      setKey(apiConfig.apiKey);
      setModel(apiConfig.model);
      setModels([]);
      setModelsError(null);
    }
  }, [open, apiConfig.apiUrl, apiConfig.apiKey, apiConfig.model]);

  const fetchModels = async () => {
    if (!url.trim() || !key.trim()) {
      setModelsError("请先填写 API 地址和 Key");
      return;
    }
    setModelsLoading(true);
    setModelsError(null);
    try {
      const res = await fetch("/api/list-models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiUrl: url.trim(), apiKey: key }),
      });
      const data = await res.json();
      if (!res.ok) {
        setModelsError(data.error || data.detail || "获取失败");
        setModels([]);
        return;
      }
      setModels(Array.isArray(data.models) ? data.models : []);
      setModelsError(null);
    } catch (e) {
      setModelsError(e instanceof Error ? e.message : "请求失败");
      setModels([]);
    } finally {
      setModelsLoading(false);
    }
  };

  const handleSave = () => {
    setApiConfig({ apiUrl: url.trim(), apiKey: key, model: model.trim() });
    onClose();
  };

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-[100]"
        onClick={onClose}
        aria-hidden
      />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-md px-4">
        <Card className="shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between py-3">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm">API 设置</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                API 地址 (URL)
              </label>
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="如 https://api.xxx.com/v1/chat/completions"
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                填写你实际使用的聊天接口完整 URL，模型列表将根据该地址获取。
              </p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                API Key (Token)
              </label>
              <Input
                type="password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="Bearer 后的 Token，请勿泄露"
                className="text-sm"
                autoComplete="off"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                模型 (Model)
              </label>
              <div className="flex gap-2">
                {models.length > 0 ? (
                  <select
                    value={models.includes(model) ? model : ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v) setModel(v);
                    }}
                    className="flex h-10 rounded-lg border border-border bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring flex-1"
                  >
                    <option value="">请选择模型</option>
                    {models.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Input
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="输入模型 ID（与接口文档一致）"
                    className="flex-1 font-mono text-sm"
                  />
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={fetchModels}
                  disabled={modelsLoading}
                  title="从当前 API 地址获取可用模型列表"
                >
                  {modelsLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                </Button>
              </div>
              {modelsError && (
                <p className="text-xs text-amber-600 mt-1">{modelsError}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                点击右侧按钮根据当前 URL 拉取可用模型；若接口不支持或拉取失败，请按文档手动输入模型名。
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              请求格式为 OpenAI 兼容：POST JSON，含 model、messages、temperature；Authorization: Bearer &lt;Key&gt;。
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={onClose}>
                取消
              </Button>
              <Button onClick={handleSave}>保存</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
