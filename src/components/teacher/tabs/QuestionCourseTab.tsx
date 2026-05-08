import { QuestionsCoursePanel } from "@/components/dashboard";
import { TabsContent } from "@/components/ui/tabs";
import { Course, CourseQuestion } from "@/types";

interface QuestionCourseTabProps {
    sessionId: string;
    fetchCourses: (sessionId: string) => Promise<Course[]>;
    fetchQuestionsCourseForCourse: (courseId: string) => Promise<CourseQuestion[]>;
    answerQuestionCourse: (questionId: string, reponse: string) => Promise<CourseQuestion | null>;
    deleteQuestionCourse: (questionId: string) => Promise<boolean>;
    onPendingCountChange?: () => void;
}

export function QuestionCourseTab({
    sessionId,
    fetchCourses,
    fetchQuestionsCourseForCourse,
    answerQuestionCourse,
    deleteQuestionCourse,
    onPendingCountChange,
}: QuestionCourseTabProps) {
    return (
        <TabsContent value="qa" className="flex-1 overflow-y-auto m-0 mt-0">
            <div className="p-6">
                <QuestionsCoursePanel
                    sessionId={sessionId}
                    fetchCourses={fetchCourses}
                    fetchQuestionsCourseForCourse={fetchQuestionsCourseForCourse}
                    answerQuestionCourse={answerQuestionCourse}
                    deleteQuestionCourse={deleteQuestionCourse}
                    onPendingCountChange={onPendingCountChange}
                />
            </div>
        </TabsContent>
    );
}