"use client";

import { Button } from "../ui/button";

import { Plus, Users } from "lucide-react";
import { Card } from "../ui/card";
import { useTranslations } from "@/lib/i18n/client";

type EmptySessionCardProps = {
    handleOpenCreateModal: () => void;
}

export function EmptySessionCard({ handleOpenCreateModal }: EmptySessionCardProps) {
    const t = useTranslations();

    return (
        <Card className="p-10 text-center bg-card/50 backdrop-blur-sm border-dashed">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">{t.teacher.emptyTitle}</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                {t.teacher.emptyCardHint}
            </p>
            <Button onClick={handleOpenCreateModal} className="shadow-lg shadow-primary/25" data-testid="button-create-first-session">
                <Plus className="h-4 w-4 mr-2" />
                {t.teacher.createFirst}
            </Button>
        </Card>
    )
}
