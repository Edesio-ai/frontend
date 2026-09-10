import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type LoadingSpinnerProps = {
  className?: string;
  label?: string;
  fullPage?: boolean;
};

export function LoadingSpinner({ className, label, fullPage = true }: LoadingSpinnerProps) {
  return (
    <div
      className={cn("flex items-center justify-center bg-background", fullPage && "min-h-screen", className)}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="size-8 animate-spin text-primary" aria-hidden="true" />
        {label ? <p className="text-sm text-muted-foreground">{label}</p> : null}
      </div>
    </div>
  );
}
