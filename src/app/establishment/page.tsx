"use client";

import { useState, useEffect } from "react";

import { useEstablishment } from "@/hooks/use-establishment";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SuggestionsModal } from "@/components/SuggestionsModal";
import { SubscriptionBlockModal } from "@/components/SubscriptionBlockModal";
import {
  Building2,
  Users,
  GraduationCap,
  BookOpen,
  LogOut,
  Plus,
  Copy,
  Trash2,
  UserCog,
  ChevronDown,
  ChevronRight,
  Clock,
  CheckCircle2,
  Loader2,
  Mail,
  FileText,
  HelpCircle,
  Eye,
  Lightbulb,
} from "lucide-react";
import { MobileInstallBanner, MobileInstallModal } from "@/components/ui/mobile-install-modal";
import { EmailVerificationBanner } from "@/components/EmailVerificationBanner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { TeacherWithStats, SessionWithStudentCount, Student } from "@/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";

interface CourseBasic {
  id: string;
  titre: string;
  description: string | null;
  questions_validees: boolean;
}

interface CourseDetails {
  cours: { id: string; titre: string; description: string | null; contenu_texte: string | null; questions_validees: boolean };
  questions: { id: string; question: string; type: string; reponse_correcte: string; options: string[] | null }[];
  students: { id: string; nom: string; email: string; photo_url: string | null; reponses_correctes: number; reponses_totales: number }[];
  fichiers: { id: string; nom_fichier: string }[];
}

function StatsCard({
  title,
  value,
  icon: Icon,
  loading,
}: {
  title: string;
  value: number;
  icon: typeof Building2;
  loading: boolean;
}) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <div>
          {loading ? (
            <Skeleton className="h-8 w-16 mb-1" />
          ) : (
            <p className="text-3xl font-bold" data-testid={`stat-${title.toLowerCase().replace(/\s+/g, '-')}`}>
              {value}
            </p>
          )}
          <p className="text-sm text-muted-foreground">{title}</p>
        </div>
      </div>
    </Card>
  );
}

function SessionStudentsModal({
  session,
  students,
  isOpen,
  onClose,
  loading,
}: {
  session: SessionWithStudentCount | null;
  students: Student[];
  isOpen: boolean;
  onClose: () => void;
  loading: boolean;
}) {
  if (!session) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Élèves de {session.nom}
          </DialogTitle>
          <DialogDescription>
            {session.students_count} élève(s) inscrit(s) à cette session
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Aucun élève inscrit à cette session
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Élève</TableHead>
                <TableHead>Email</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id} data-testid={`row-student-${student.id}`}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={student.photo_url || undefined} />
                        <AvatarFallback>
                          {student.nom.split(" ").map((n) => n[0]).join("").toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{student.nom}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {student.email}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} data-testid="button-close-students-modal">
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function InvitationModal({
  isOpen,
  onClose,
  onCreate,
  isCreating,
  email,
  onEmailChange,
  chatbotsAlloues,
  onChatbotsChange,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreate: () => void;
  isCreating: boolean;
  email: string;
  onEmailChange: (email: string) => void;
  chatbotsAlloues: number;
  onChatbotsChange: (count: number) => void;
}) {
  const isValidEmail = email.includes("@") && email.includes(".");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Inviter un professeur</DialogTitle>
          <DialogDescription>
            Entrez l'adresse email du professeur que vous souhaitez inviter.
            Un code d'invitation sera généré et ne pourra être utilisé que par cette adresse email.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="invite-email">Adresse email du professeur</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="invite-email"
                type="email"
                placeholder="professeur@example.com"
                value={email}
                onChange={(e) => onEmailChange(e.target.value)}
                className="pl-10"
                data-testid="input-invite-email"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Le code sera valide pendant 7 jours et ne pourra être utilisé que par cette adresse email.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="chatbots-count">Nombre de chatbots alloués</Label>
            <Input
              id="chatbots-count"
              type="number"
              min="0"
              max="100"
              value={chatbotsAlloues}
              onChange={(e) => onChatbotsChange(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-32"
              data-testid="input-chatbots-count"
            />
            <p className="text-xs text-muted-foreground">
              Nombre de sessions/chatbots que ce professeur pourra créer.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button
            onClick={onCreate}
            disabled={isCreating || !isValidEmail}
            data-testid="button-confirm-create-invitation"
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Création...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Créer l'invitation
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CourseViewModal({
  isOpen,
  onClose,
  courseDetails,
  loading,
}: {
  isOpen: boolean;
  onClose: () => void;
  courseDetails: CourseDetails | null;
  loading: boolean;
}) {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2">
            <BookOpen className="h-5 w-5" />
            {courseDetails?.cours.titre || "Cours"}
          </DialogTitle>
          {courseDetails?.cours.description && (
            <DialogDescription>
              {courseDetails.cours.description}
            </DialogDescription>
          )}
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : courseDetails ? (
          <div className="flex-1 overflow-y-auto space-y-6 py-4">
            {courseDetails.cours.contenu_texte && (
              <div className="space-y-2">
                <h3 className="font-medium text-sm flex flex-wrap items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Contenu texte
                </h3>
                <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg whitespace-pre-wrap">
                  {courseDetails.cours.contenu_texte}
                </p>
              </div>
            )}

            {courseDetails.fichiers.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium text-sm flex flex-wrap items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Fichiers PDF ({courseDetails.fichiers.length})
                </h3>
                <div className="space-y-1">
                  {courseDetails.fichiers.map((f) => (
                    <div key={f.id} className="flex items-center gap-2 p-2 rounded bg-muted/30 text-sm">
                      <FileText className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{f.nom_fichier}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <h3 className="font-medium text-sm flex flex-wrap items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                Questions ({courseDetails.questions.length})
              </h3>
              {courseDetails.questions.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucune question créée.</p>
              ) : (
                <Accordion type="single" collapsible className="w-full">
                  {courseDetails.questions.map((q, index) => (
                    <AccordionItem key={q.id} value={q.id}>
                      <AccordionTrigger className="text-sm text-left">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant={q.type === "qcm" ? "default" : "outline"} className="text-xs">
                            {q.type === "qcm" ? "QCM" : "Ouverte"}
                          </Badge>
                          <span>Q{index + 1}: {q.question.length > 80 ? q.question.substring(0, 80) + "..." : q.question}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2 pl-4">
                          <p className="text-sm"><strong>Question:</strong> {q.question}</p>
                          {q.type === "qcm" && q.options && (
                            <div className="space-y-1">
                              <p className="text-sm font-medium">Options:</p>
                              <ul className="list-disc list-inside text-sm text-muted-foreground">
                                {q.options.map((opt, i) => (
                                  <li key={i} className={opt === q.reponse_correcte ? "text-green-600 font-medium" : ""}>
                                    {opt} {opt === q.reponse_correcte && "(Correcte)"}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          <p className="text-sm"><strong>Réponse correcte:</strong> <span className="text-green-600">{q.reponse_correcte}</span></p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="font-medium text-sm flex flex-wrap items-center gap-2">
                <Users className="h-4 w-4" />
                Élèves ayant travaillé sur ce cours ({courseDetails.students.length})
              </h3>
              {courseDetails.students.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun élève n'a encore travaillé sur ce cours.</p>
              ) : (
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {courseDetails.students.map((student) => (
                    <div key={student.id} className="flex flex-wrap items-center justify-between gap-2 p-2 rounded bg-muted/30 text-sm">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={student.photo_url || undefined} />
                          <AvatarFallback className="text-xs">
                            {student.nom.split(" ").map((n) => n[0]).join("").toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{student.nom}</span>
                      </div>
                      <Badge variant="outline">
                        {student.reponses_correctes}/{student.reponses_totales} réponses correctes
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Impossible de charger les détails du cours.
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} data-testid="button-close-course-modal">
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SessionCoursesList({
  sessionId,
  getSessionCours,
  onViewCourse,
}: {
  sessionId: string;
  getSessionCours: (sessionId: string) => Promise<CourseBasic[]>;
  onViewCourse: (coursId: string) => void;
}) {
  const [courses, setCourses] = useState<CourseBasic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      const data = await getSessionCours(sessionId);
      setCourses(data);
      setLoading(false);
    };
    fetchCourses();
  }, [sessionId, getSessionCours]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" /> Chargement des cours...
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <p className="text-xs text-muted-foreground py-1">Aucun cours dans cette classe</p>
    );
  }

  return (
    <div className="space-y-1 mt-2">
      {courses.map((cours) => (
        <button
          key={cours.id}
          onClick={() => onViewCourse(cours.id)}
          className="w-full flex flex-wrap items-center justify-between gap-2 p-2 rounded bg-muted/50 text-sm hover:bg-muted transition-colors text-left"
          data-testid={`button-view-course-${cours.id}`}
        >
          <div className="flex flex-wrap items-center gap-2">
            <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{cours.titre}</span>
          </div>
          <div className="flex items-center gap-2">
            {cours.questions_validees ? (
              <Badge variant="default" className="text-xs">Publié</Badge>
            ) : (
              <Badge variant="outline" className="text-xs">Brouillon</Badge>
            )}
            <Eye className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
        </button>
      ))}
    </div>
  );
}

function ProfesseurRow({
  professeur,
  onViewStudents,
  onViewCourse,
  getSessionCours,
}: {
  professeur: TeacherWithStats;
  onViewStudents: (session: SessionWithStudentCount) => void;
  onViewCourse: (coursId: string) => void;
  getSessionCours: (sessionId: string) => Promise<CourseBasic[]>;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <TableRow data-testid={`row-professeur-${professeur.id}`}>
        <TableCell>
          <CollapsibleTrigger asChild>
            <button className="flex items-center gap-2 hover:text-primary transition-colors">
              {isOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              <span className="font-medium">{professeur.nom}</span>
            </button>
          </CollapsibleTrigger>
        </TableCell>
        <TableCell className="text-muted-foreground">{professeur.email}</TableCell>
        <TableCell>
          <Badge variant="secondary">{professeur.sessions_count} classe(s)</Badge>
        </TableCell>
        <TableCell>
          <Badge variant="outline">{professeur.students_count} élève(s)</Badge>
        </TableCell>
      </TableRow>

      <CollapsibleContent asChild>
        <TableRow className="bg-muted/30">
          <TableCell colSpan={4} className="p-0">
            <div className="p-4 pl-10 space-y-3">
              {professeur.sessions.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucune classe créée</p>
              ) : (
                professeur.sessions.map((session) => (
                  <div
                    key={session.id}
                    className="p-3 rounded-lg bg-background border"
                    data-testid={`session-item-${session.id}`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{session.nom}</span>
                        <Badge variant="outline" className="text-xs">
                          {session.code}
                        </Badge>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onViewStudents(session)}
                        data-testid={`button-view-students-${session.id}`}
                      >
                        <Users className="h-4 w-4 mr-1" />
                        {session.students_count} élève(s)
                      </Button>
                    </div>
                    <SessionCoursesList
                      sessionId={session.id}
                      getSessionCours={getSessionCours}
                      onViewCourse={onViewCourse}
                    />
                  </div>
                ))
              )}
            </div>
          </TableCell>
        </TableRow>
      </CollapsibleContent>
    </Collapsible>
  );
}

export default function Etablissement() {
  const router = useRouter();
  const { signOut, getUserRole, loading: authLoading, user } = useAuth();
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
  const [isCreatingInvitation, setIsCreatingInvitation] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [chatbotsAlloues, setChatbotsAlloues] = useState(0);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const [selectedSession, setSelectedSession] = useState<SessionWithStudentCount | null>(null);
  const [sessionStudents, setSessionStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const [selectedCourseDetails, setSelectedCourseDetails] = useState<CourseDetails | null>(null);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [loadingCourse, setLoadingCourse] = useState(false);

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

  // Wait for auth to load before checking role
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
    await signOut();
    router.push("/");
  };

  const handleCreateInvitation = async () => {
    setIsCreatingInvitation(true);
    const result = await createInvitationToken(inviteEmail, 7, chatbotsAlloues);
    setIsCreatingInvitation(false);
    if (result) {
      setShowInvitationModal(false);
      setInviteEmail("");
      setChatbotsAlloues(0);
    }
  };

  const handleCopyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
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

  const isTokenExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
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
            <StatsCard
              title="Professeurs"
              value={stats.totalProfesseurs}
              icon={GraduationCap}
              loading={loading}
            />
            <StatsCard
              title="Classes"
              value={stats.totalSessions}
              icon={BookOpen}
              loading={loading}
            />
            <StatsCard
              title="Élèves"
              value={stats.totalEleves}
              icon={Users}
              loading={loading}
            />
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
                {invitationTokens.map((token: { id: string; token: string; expires_at: string; used_at: string | null; invited_email: string; chatbots_alloues?: number }) => {
                  const expired = isTokenExpired(token.expires_at);
                  const used = !!token.used_at;

                  return (
                    <div
                      key={token.id}
                      className={`flex items-center justify-between p-4 rounded-lg border ${expired || used ? "bg-muted/50 opacity-60" : "bg-background"
                        }`}
                      data-testid={`invitation-token-${token.id}`}
                    >
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-4">
                          <code className="bg-muted px-3 py-1 rounded font-mono text-sm">
                            {token.token}
                          </code>
                          {used ? (
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Utilisé
                            </Badge>
                          ) : expired ? (
                            <Badge variant="destructive" className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Expiré
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Expire le {new Date(token.expires_at).toLocaleDateString("fr-FR")}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Mail className="h-3 w-3" />
                            <span>{token.invited_email}</span>
                          </div>
                          {(token as { chatbots_alloues?: number }).chatbots_alloues !== undefined && (token as { chatbots_alloues?: number }).chatbots_alloues! > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {(token as { chatbots_alloues?: number }).chatbots_alloues} chatbot{(token as { chatbots_alloues?: number }).chatbots_alloues! > 1 ? "s" : ""}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {!expired && !used && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCopyToken(token.token)}
                            data-testid={`button-copy-token-${token.id}`}
                          >
                            {copiedToken === token.token ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteInvitationToken(token.id)}
                          data-testid={`button-delete-token-${token.id}`}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold flex items-center gap-2 mb-6">
              <GraduationCap className="h-5 w-5" />
              Professeurs ({stats.totalProfesseurs})
            </h2>

            {professeurs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Aucun professeur dans votre établissement</p>
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
                      professeur={prof}
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
          onClose={() => {
            setShowInvitationModal(false);
            setInviteEmail("");
            setChatbotsAlloues(0);
          }}
          onCreate={handleCreateInvitation}
          isCreating={isCreatingInvitation}
          email={inviteEmail}
          onEmailChange={setInviteEmail}
          chatbotsAlloues={chatbotsAlloues}
          onChatbotsChange={setChatbotsAlloues}
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
