import { CourseBasic } from "@/types";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";

export function SessionCoursesList({
    sessionId,
    getSessionCourse,
    onViewCourse,
  }: {
    sessionId: string;
    getSessionCourse: (sessionId: string) => Promise<CourseBasic[]>;
    onViewCourse: (courseId: string) => void;
  }) {
    const [courses, setCourses] = useState<CourseBasic[]>([]);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      const fetchCourses = async () => {
        setLoading(true);
        const data = await getSessionCourse(sessionId);
        setCourses(data);
        setLoading(false);
      };
      fetchCourses();
    }, [sessionId, getSessionCourse]);
  
    if (loading) {
      return (
        <div className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" /> Chargement des cours...
        </div>
      );
    }
    console.log(courses);
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
              <span>{cours.title}</span>
            </div>
            <div className="flex items-center gap-2">
              {cours.validatedQuestions ? (
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