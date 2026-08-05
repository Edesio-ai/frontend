"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTranslations } from "@/lib/i18n/client";

export function ErrorModal({ error }: { error: string }) {
  const t = useTranslations();
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-6">
      <Card className="p-8 max-w-md text-center">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>{t.establishment.retry}</Button>
      </Card>
    </div>
  );
}
