import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs } from "@/components/ui/tabs";
import { BookOpen } from "lucide-react";
import { CourseTab } from "./tabs/course-tab";
import { StudentTab } from "./tabs/student-tab";
import { CourseQuestionTab } from "./tabs/course-question-tab";
import { TabsListHeader } from "./tabs/tab-list";
import { Course, Session, StudentSessionWithStudent } from "@/types";

interface SessionWorkspaceProps {
  selectedSession: Session | null;
  sessionTab: "course" | "students" | "qa";
  sessionStudents: StudentSessionWithStudent[];
  pendingQuestionsCount: number;
  newlyCreatedCours: Course | null;
  setNewlyCreatedCourse: (course: Course | null) => void;
  loadingSessionStudents: boolean;
  handleCloseSessionModal: () => void;
  handleTabChange: (value: string) => void;
  refreshPendingCount: (sessionId: string) => Promise<void>;
}

export function SessionWorkspace({
  selectedSession,
  sessionTab,
  sessionStudents,
  pendingQuestionsCount,
  newlyCreatedCours,
  setNewlyCreatedCourse,
  loadingSessionStudents,
  handleCloseSessionModal,
  handleTabChange,
  refreshPendingCount,
}: SessionWorkspaceProps) {
  return (
    <Dialog open={!!selectedSession} onOpenChange={(open) => !open && handleCloseSessionModal()}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-primary-foreground" />
            </div>
            {selectedSession?.name}
          </DialogTitle>
          <DialogDescription>Manage the lessons for this session and view enrolled students.</DialogDescription>
        </DialogHeader>

        {selectedSession && (
          <Tabs value={sessionTab} onValueChange={handleTabChange} className="flex-1 flex flex-col overflow-hidden">
            <TabsListHeader sessionStudents={sessionStudents} pendingQuestionsCount={pendingQuestionsCount} />
            <CourseTab
              session={selectedSession}
              newlyCreatedCours={newlyCreatedCours}
              setNewlyCreatedCourse={setNewlyCreatedCourse}
            />
            <StudentTab
              loadingSessionStudents={loadingSessionStudents}
              sessionStudents={sessionStudents}
              selectedSession={selectedSession}
            />
            <CourseQuestionTab
              sessionId={selectedSession.id}
              onPendingCountChange={() => void refreshPendingCount(selectedSession.id)}
            />
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
