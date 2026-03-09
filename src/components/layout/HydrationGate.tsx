"use client";

import { useEffect, useState } from "react";
import { useResumeStore } from "@/lib/store";
import { Loader2 } from "lucide-react";

export default function HydrationGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    useResumeStore.persist.rehydrate();
    setHydrated(true);
  }, []);

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <>{children}</>;
}
