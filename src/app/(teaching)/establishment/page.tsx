"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Users, GraduationCap, BookOpen } from "lucide-react";

import { useEstablishment } from "./_contexts/establishment-context";
import { useTranslations } from "@/lib/i18n/client";
import { SubscriptionBlockModal } from "@/components/SubscriptionBlockModal";
import { StatsCard } from "@/components/establishment/StatsCard";
import { useAuth } from "@/contexts/auth-context";
import { EstablishmentSkeleton } from "./_components/skeleton";
import { ErrorModal } from "./_components/error-modal";
import { EstablishmentHeader } from "./_components/establishment-header";
import { InvitationSection } from "./_components/invitation-section";
import { TeacherSection } from "./_components/teacher-section";

export default function Establishment() {
  const t = useTranslations();
  const router = useRouter();
  const { getUserRole, loading: authLoading, user } = useAuth();
  const { stats, loading, error } = useEstablishment();

  const statsDashboard = useMemo(() => {
    const pluralLabel = (count: number, one: string, other: string) => (count === 1 ? one : other);

    return [
      {
        title: pluralLabel(stats.totalTeachers, t.establishment.teachers_one, t.establishment.teachers_other),
        value: stats.totalTeachers,
        icon: GraduationCap,
        loading,
      },
      {
        title: pluralLabel(stats.totalSessions, t.establishment.classes_one, t.establishment.classes_other),
        value: stats.totalSessions,
        icon: BookOpen,
        loading,
      },
      {
        title: pluralLabel(stats.totalStudents, t.establishment.students_one, t.establishment.students_other),
        value: stats.totalStudents,
        icon: Users,
        loading,
      },
    ];
  }, [stats, t, loading]);

  const role = getUserRole();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }

    if (role && role !== "establishment") {
      if (role === "teacher") {
        router.replace("/teacher");
      } else if (role === "self-learner") {
        router.replace("/self-learner");
      } else {
        router.replace("/student");
      }
    }
  }, [authLoading, user, role, router]);

  if (authLoading) {
    return <EstablishmentSkeleton />;
  }

  if (!user || (role && role !== "establishment")) {
    return null;
  }

  if (loading) {
    return <EstablishmentSkeleton />;
  }

  if (error) {
    return <ErrorModal error={error} />;
  }

  return (
    <SubscriptionBlockModal>
      <div className="min-h-screen bg-muted/30">
        <EstablishmentHeader />
        <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
          <div className="grid md:grid-cols-3 gap-4">
            {statsDashboard.map((stat) => (
              <StatsCard
                key={stat.title}
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                loading={stat.loading}
              />
            ))}
          </div>
          <InvitationSection />
          <TeacherSection />
        </main>
      </div>
    </SubscriptionBlockModal>
  );
}
