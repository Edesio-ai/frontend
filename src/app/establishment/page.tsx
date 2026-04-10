"use client";

import { useState, useEffect, useMemo } from "react";

import { useEstablishment } from "@/hooks/use-establishment";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import InvitationModal from "@/components/establishment/InvitationModal";

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SuggestionsModal } from "@/components/SuggestionsModal";
import { SubscriptionBlockModal } from "@/components/SubscriptionBlockModal";
import {
  Building2,
  Users,
  GraduationCap,
  BookOpen,
  LogOut,
  Plus,
  UserCog,
  Lightbulb,
} from "lucide-react";
import { MobileInstallBanner, MobileInstallModal } from "@/components/ui/mobile-install-modal";
import { EmailVerificationBanner } from "@/components/EmailVerificationBanner";

import type { TeacherWithStats, SessionWithStudentCount, Student, InvitationToken, CourseDetails } from "@/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { TokenElement } from "@/components/establishment/TokenElement";
import { ProfesseurRow } from "@/components/establishment/ProfesseurRow";
import { CourseViewModal } from "@/components/establishment/CourseViewModal";
import { StatsCard } from "@/components/establishment/StatsCard";
import { SessionStudentsModal } from "@/components/establishment/SessionStudentModal";

export default function Establishment() {
  const router = useRouter();
  const { logout, getUserRole, loading: authLoading, user } = useAuth();
  const {
    establishment,
    professeurs,
    invitationTokens,
    stats,
    loading,
    error,
    createInvitationToken,
    deleteInvitationToken,
    getSessionStudents,
    getSessionCours,
    getCourseDetails,
  } = useEstablishment();

  const [showInvitationModal, setShowInvitationModal] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [showSuggestionsModal, setShowSuggestionsModal] = useState(false);


  const [selectedSession, setSelectedSession] = useState<SessionWithStudentCount | null>(null);
  const [sessionStudents, setSessionStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const [selectedCourseDetails, setSelectedCourseDetails] = useState<CourseDetails | null>(null);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [loadingCourse, setLoadingCourse] = useState(false);

  const statsDashboard = useMemo(() => {
    return [
      {
        title: "Professeurs", 
        value: stats.totalTeachers,
        icon: GraduationCap,
        loading: loading,
      },
      {
        title: "Classes",
        value: stats.totalSessions,
        icon: BookOpen,
        loading: loading,
      },
      {
        title: "Élèves",
        value: stats.totalStudents,
        icon: Users,
        loading: loading,
      },
  ];
  }, [professeurs, stats]);

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
      } else if (role === "standalone") {
        router.replace("/standalone");
      } else {
        router.replace("/student");
      }
    }
  }, [authLoading, user, role, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-muted/30 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid md:grid-cols-3 gap-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }
  // Prevent rendering while redirecting unauthorized roles/users
  if (!user || (role && role !== "establishment")) {
    return null;
  }
  const handleSignOut = async () => {
    await logout();
    router.push("/");
  };

  const handleViewStudents = async (session: SessionWithStudentCount) => {
    setSelectedSession(session);
    setLoadingStudents(true);
    const students = await getSessionStudents(session.id);
    setSessionStudents(students);
    setLoadingStudents(false);
  };

  const handleViewCourse = async (coursId: string) => {
    setShowCourseModal(true);
    setLoadingCourse(true);
    setSelectedCourseDetails(null);
    const details = await getCourseDetails(coursId);
    setSelectedCourseDetails(details);
    setLoadingCourse(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid md:grid-cols-3 gap-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-6">
        <Card className="p-8 max-w-md text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Réessayer</Button>
        </Card>
      </div>
    );
  }

  return (
    <SubscriptionBlockModal>
      <div className="min-h-screen bg-muted/30">
        <header className="bg-background border-b sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="font-bold text-lg" data-testid="text-establishment-name">
                  {establishment?.name || "Établissement"}
                </h1>
                <p className="text-sm text-muted-foreground">Tableau de bord administrateur</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSuggestionsModal(true)}
                className="border-amber-300 text-amber-600 dark:border-amber-600 dark:text-amber-400"
                data-testid="button-suggestions"
              >
                <Lightbulb className="h-4 w-4 mr-1.5" />
                Suggestions
              </Button>
              <Link href="/profil">
                <Button variant="ghost" data-testid="button-profile">
                  <UserCog className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Profil</span>
                </Button>
              </Link>
              <Button variant="ghost" onClick={handleSignOut} data-testid="button-signout">
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Déconnexion</span>
              </Button>
            </div>
          </div>
        </header>

        <EmailVerificationBanner />
        <MobileInstallBanner onOpenModal={() => setShowInstallModal(true)} />
        <MobileInstallModal open={showInstallModal} onOpenChange={setShowInstallModal} />
        <SuggestionsModal open={showSuggestionsModal} onOpenChange={setShowSuggestionsModal} category="establishment" />

        <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
          <div className="grid md:grid-cols-3 gap-4">
            {statsDashboard.map((stat) => (
              <StatsCard key={stat.title} title={stat.title} value={stat.value} icon={stat.icon} loading={stat.loading} />
            ))}
          </div>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Codes d'invitation
              </h2>
              <Button onClick={() => setShowInvitationModal(true)} data-testid="button-create-invitation">
                <Plus className="h-4 w-4 mr-2" />
                Nouveau code
              </Button>
            </div>

            {invitationTokens.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Aucun code d'invitation créé</p>
                <p className="text-sm mt-1">
                  Créez un code pour permettre aux professeurs de rejoindre votre établissement
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {invitationTokens.map((token: InvitationToken) => (
                  <TokenElement key={token.id} token={token} handleDeleteToken={deleteInvitationToken} />
                ))}
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold flex items-center gap-2 mb-6">
              <GraduationCap className="h-5 w-5" />
              Professeurs ({stats.totalTeachers})
            </h2>

            {professeurs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Aucun teacher dans votre établissement</p>
                <p className="text-sm mt-1">
                  Partagez un code d'invitation pour que les professeurs puissent rejoindre
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Classes</TableHead>
                    <TableHead>Élèves</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {professeurs.map((prof: TeacherWithStats) => (
                    <ProfesseurRow
                      key={prof.id}
                      teacher={prof}
                      onViewStudents={handleViewStudents}
                      onViewCourse={handleViewCourse}
                      getSessionCours={getSessionCours}
                    />
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </main>

        <InvitationModal
          isOpen={showInvitationModal}
          setShowInvitationModal={setShowInvitationModal}
          createInvitationToken={createInvitationToken}
        />

        <SessionStudentsModal
          session={selectedSession}
          students={sessionStudents}
          isOpen={!!selectedSession}
          onClose={() => setSelectedSession(null)}
          loading={loadingStudents}
        />

        <CourseViewModal
          isOpen={showCourseModal}
          onClose={() => {
            setShowCourseModal(false);
            setSelectedCourseDetails(null);
          }}
          courseDetails={selectedCourseDetails}
          loading={loadingCourse}
        />
      </div>
    </SubscriptionBlockModal>
  );
}
