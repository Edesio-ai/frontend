import { CourseList } from "@/components/dashboard/CourseList";
import { TabsContent } from "@/components/ui/tabs";
import { Session } from "@/types";
import { Course, CourseFile, CourseRanking } from "@/types/course.type";
import { Question } from "@/types/question.type";
import { UpdateQuestionRequest } from "@/types/question.type";

interface CourseTabProps {
    session: Session;
    fetchCourses: (sessionId: string) => Promise<Course[]>;
    createCourse: (sessionId: string, title: string, description: string, contentText: string, pdfFiles?: File[]) => Promise<Course | null>;
    updateCourse: (courseId: string, title: string, description: string | null, contentText: string | null) => Promise<Course | null>;
    deleteCourse: (courseId: string) => Promise<boolean>;
    reorderCourse: (courseIds: string[]) => Promise<boolean>;
    uploadPdfForCourse: (courseId: string, file: File) => Promise<CourseFile | null>;
    fetchCourseFiles: (courseId: string) => Promise<CourseFile[]>;
    deleteCourseFile: (file: CourseFile) => Promise<boolean>;
    getPdfUrl: (fileId: string, fileName: string) => Promise<void>;
    fetchQuestions: (courseId: string) => Promise<Question[]>;
    updateQuestion: (questionId: string, updates: UpdateQuestionRequest) => Promise<Question | null>;
    deleteQuestion: (questionId: string) => Promise<boolean>;
    createQuestion: (courseId: string, questionData: { type: "single" | "multiple" | "open"; questionText: string; proposals?: string[]; correctAnswers?: string[]; explanation?: string }) => Promise<Question | null>;
    reorderQuestions: (questionIds: string[]) => Promise<boolean>;
    generateQuestions: (courseId: string, config?: { totalQuestions?: number; qcmCount?: number; ouverteCount?: number }) => Promise<{ success: boolean; questionsCreated?: number; error?: string }>;
    validateQuestions: (courseId: string) => Promise<{ success: boolean; course?: Course; error?: string }>;
    fetchCourseRanking: (courseId: string) => Promise<CourseRanking[]>;
    newlyCreatedCours: Course | null;
    setNewlyCreatedCourse: (course: Course | null) => void;
}

export function CourseTab({ 
    session,
    fetchCourses,
    createCourse,
    updateCourse,
    deleteCourse,
    reorderCourse,
    uploadPdfForCourse,
    fetchCourseFiles,
    deleteCourseFile,
    getPdfUrl,
    fetchQuestions,
    updateQuestion,
    deleteQuestion,
    createQuestion,
    reorderQuestions,
    generateQuestions,
    validateQuestions,
    fetchCourseRanking,
    newlyCreatedCours,
    setNewlyCreatedCourse
}: CourseTabProps) {
  return (
    <TabsContent value="course" className="flex-1 overflow-y-auto m-0 mt-0">
    <div className="p-6">
      <CourseList
        session={session}
        fetchCourses={fetchCourses}
        createCourse={createCourse}
        updateCourse={updateCourse}
        deleteCourse={deleteCourse}
        reorderCourse={reorderCourse}
        uploadPdfForCourse={uploadPdfForCourse}
        fetchCourseFiles={fetchCourseFiles}
        deleteCourseFile={deleteCourseFile}
        getPdfUrl={getPdfUrl}
        fetchQuestions={fetchQuestions}
        updateQuestion={updateQuestion}
        deleteQuestion={deleteQuestion}
        createQuestion={createQuestion}
        reorderQuestions={reorderQuestions}
        generateQuestions={generateQuestions}
        validateQuestions={validateQuestions}
        fetchCourseRanking={fetchCourseRanking}
        initialCoursToOpen={newlyCreatedCours}
        onInitialCoursOpened={() => setNewlyCreatedCourse(null)}
      />
    </div>
  </TabsContent>
  );
}