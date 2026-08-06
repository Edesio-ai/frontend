import { CourseList } from "@/app/(teaching)/teacher/_components/course-list";
import { TabsContent } from "@/components/ui/tabs";
import type { Session, Course } from "@/types";

interface CourseTabProps {
  session: Session;
  newlyCreatedCours: Course | null;
  setNewlyCreatedCourse: (course: Course | null) => void;
}

export function CourseTab({ session, newlyCreatedCours, setNewlyCreatedCourse }: CourseTabProps) {
  return (
    <TabsContent value="course" className="flex-1 overflow-y-auto m-0 mt-0">
      <div className="p-6">
        <CourseList
          session={session}
          initialCoursToOpen={newlyCreatedCours}
          onInitialCoursOpened={() => setNewlyCreatedCourse(null)}
        />
      </div>
    </TabsContent>
  );
}
