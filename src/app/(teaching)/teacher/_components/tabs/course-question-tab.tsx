import { QuestionsCoursePanel } from "@/components/dashboard";
import { TabsContent } from "@/components/ui/tabs";

interface CourseQuestionTabProps {
  sessionId: string;
  onPendingCountChange?: () => void;
}

export function CourseQuestionTab({ sessionId, onPendingCountChange }: CourseQuestionTabProps) {
  return (
    <TabsContent value="qa" className="m-0 mt-0 flex-1 overflow-y-auto">
      <div className="p-6">
        <QuestionsCoursePanel sessionId={sessionId} onPendingCountChange={onPendingCountChange} />
      </div>
    </TabsContent>
  );
}
