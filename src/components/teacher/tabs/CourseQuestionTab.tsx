import { QuestionsCoursePanel } from "@/components/dashboard";
import { TabsContent } from "@/components/ui/tabs";
import { Course, CourseQuestion } from "@/types";

interface CourseQuestionTabProps {
    sessionId: string;
    fetchCourses: (sessionId: string) => Promise<Course[]>;
    fetchQuestionsCourseForCourse: (courseId: string) => Promise<CourseQuestion[]>;
    answerCourseQuestion: (questionId: string, reponse: string) => Promise<CourseQuestion | null>;
    deleteCourseQuestion: (questionId: string) => Promise<boolean>;
    onPendingCountChange?: () => void;
}

export function CourseQuestionTab({
    sessionId,
    fetchCourses,
    fetchQuestionsCourseForCourse,
    answerCourseQuestion,
    deleteCourseQuestion,
    onPendingCountChange,
}: CourseQuestionTabProps) {
    return (
        <TabsContent value="qa" className="flex-1 overflow-y-auto m-0 mt-0">
            <div className="p-6">
                <QuestionsCoursePanel
                    sessionId={sessionId}
                    fetchCourses={fetchCourses}
                    fetchQuestionsCourseForCourse={fetchQuestionsCourseForCourse}
                    answerCourseQuestion={answerCourseQuestion}
                    deleteCourseQuestion={deleteCourseQuestion}
                    onPendingCountChange={onPendingCountChange}
                />
            </div>
        </TabsContent>
    );
}