"use client";

import { SessionCard } from "@/components/dashboard";
import { Session } from "@/types";
import { Users } from "lucide-react";
import { EmptySessionCard } from "../EmptySessionCard";
import { useTranslations } from "@/lib/i18n/client";

type ClassListSectionProps = {
    sessions: Session[];
    handleOpenCreateModal: () => void;
    handleSelectSession: (session: Session) => Promise<void>;
    handleRenameSession: (sessionId: string, newName: string) => Promise<Session | null>;
    handleDeleteSession: (sessionId: string) => Promise<boolean>;
    sessionPendingCounts: { [key: string]: number };
}

export function ClassListSection({
    sessions,
    handleOpenCreateModal,
    handleSelectSession,
    handleRenameSession,
    handleDeleteSession,
    sessionPendingCounts,
}: ClassListSectionProps) {
    const t = useTranslations();
    const count = sessions.length;
    const classCountLabel = count === 1
        ? t.teacher.classCount_one.replace('{{count}}', String(count))
        : t.teacher.classCount_other.replace('{{count}}', String(count));

    return (
        <section>
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-600/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                    <h2 className="text-xl font-semibold">{t.teacher.myClasses}</h2>
                    <p className="text-sm text-muted-foreground">{classCountLabel}</p>
                </div>
            </div>

            {sessions.length === 0 ? (
                <EmptySessionCard handleOpenCreateModal={handleOpenCreateModal} />
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {sessions.map((session) => (
                        <SessionCard
                            key={session.id}
                            session={session}
                            isSelected={false}
                            onSelect={handleSelectSession}
                            onRename={handleRenameSession}
                            onDelete={handleDeleteSession}
                            pendingQuestionsCount={sessionPendingCounts[session.id] || 0}
                        />
                    ))}
                </div>
            )}
        </section>
    )
}
