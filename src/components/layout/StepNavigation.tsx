"use client";

import { useRouter, usePathname } from "next/navigation";
import Button from "@/components/ui/Button";
import { ArrowLeft, ArrowRight } from "lucide-react";

const stepOrder = ["/upload", "/analyze", "/tailor", "/optimize", "/preview"];

interface StepNavigationProps {
  onNext?: () => boolean | void;
  nextLabel?: string;
  nextDisabled?: boolean;
}

export default function StepNavigation({
  onNext,
  nextLabel,
  nextDisabled,
}: StepNavigationProps) {
  const router = useRouter();
  const pathname = usePathname();

  const currentIndex = stepOrder.indexOf(pathname);
  const prevStep = currentIndex > 0 ? stepOrder[currentIndex - 1] : null;
  const nextStep =
    currentIndex < stepOrder.length - 1 ? stepOrder[currentIndex + 1] : null;

  const handleNext = () => {
    if (onNext) {
      const result = onNext();
      if (result === false) return;
    }
    if (nextStep) router.push(nextStep);
  };

  if (currentIndex < 0) return null;

  return (
    <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
      <div>
        {prevStep && (
          <Button variant="outline" onClick={() => router.push(prevStep)}>
            <ArrowLeft className="w-4 h-4" />
            上一步
          </Button>
        )}
      </div>
      <div className="text-xs text-muted-foreground">
        步骤 {currentIndex + 1} / {stepOrder.length}
      </div>
      <div>
        {nextStep && (
          <Button onClick={handleNext} disabled={nextDisabled}>
            {nextLabel || "下一步"}
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
