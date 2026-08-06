import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export function ErrorBanner({ error }: { error: string }) {
  return (
    <Card className="p-4 mb-6 bg-destructive/10 border-destructive/20">
      <div className="flex items-center gap-3">
        <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
        <p className="text-destructive" data-testid="text-error-message">
          {error}
        </p>
      </div>
    </Card>
  );
}
