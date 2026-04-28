import { CourseBasic, SessionWithStudentCount, TeacherWithStats } from "@/types";
import { useState } from "react";
import { TableCell, TableRow } from "../ui/table";
import { BookOpen, ChevronDown, ChevronRight, Users } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { SessionCoursesList } from "./SessionCoursesList";

export function TeacherRow({
    teacher,
    onViewStudents,
    onViewCourse,
    getSessionCourse,
}: {
    teacher: TeacherWithStats;
    onViewStudents: (session: SessionWithStudentCount) => void;
    onViewCourse: (courseId: string) => void;
    getSessionCourse: (sessionId: string) => Promise<CourseBasic[]>;
}) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <TableRow data-testid={`row-teacher-${teacher.id}`}>
                <TableCell>
                        <button className="flex items-center gap-2 hover:text-primary transition-colors">
                            {isOpen ? (
                                <ChevronDown className="h-4 w-4" onClick={() => setIsOpen(!isOpen)}/>
                            ) : (
                                <ChevronRight className="h-4 w-4" onClick={() => setIsOpen(!isOpen)}/>
                            )}
                            <span className="font-medium">{teacher.name}</span>
                        </button>
                </TableCell>
                <TableCell className="text-muted-foreground">{teacher.email}</TableCell>
                <TableCell>
                    <Badge variant="secondary">{teacher.sessionsCount} classe(s)</Badge>
                </TableCell>
                <TableCell>
                    <Badge variant="outline">{teacher.studentsCount} élève(s)</Badge>
                </TableCell>
            </TableRow>

            {isOpen && (
                <TableRow className="bg-muted/30">
                    <TableCell colSpan={4} className="p-0">
                        <div className="p-4 pl-10 space-y-3">
                            {teacher.sessions.length === 0 ? (
                                <p className="text-sm text-muted-foreground">Aucune classe créée</p>
                            ) : (
                                teacher.sessions.map((session) => (
                                    <div
                                        key={session.id}
                                        className="p-3 rounded-lg bg-background border"
                                        data-testid={`session-item-${session.id}`}
                                    >
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <BookOpen className="h-4 w-4 text-muted-foreground" />
                                                <span className="font-medium">{session.name}</span>
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
                                                {session.studentsCount} élève(s)
                                            </Button>
                                        </div>
                                        <SessionCoursesList
                                            sessionId={session.id}
                                            getSessionCourse={getSessionCourse}
                                            onViewCourse={onViewCourse}
                                        />
                                    </div>
                                ))
                            )}
                        </div>
                    </TableCell>
                </TableRow>
            )}
        </>
    );
}