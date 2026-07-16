import { Student, SessionWithStudentCount } from "@/types";
import { Button } from "../ui/button";
import { useTranslations } from "@/lib/i18n/client";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Loader2, Users } from "lucide-react";
import { Avatar, AvatarImage } from "../ui/avatar";
import { AvatarFallback } from "../ui/avatar";

export function SessionStudentsModal({
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
    const t = useTranslations();
    if (!session) return null;
  
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t.establishment.sessionStudentModal.title.replace('{session}', session.name)}
            </DialogTitle>
            <DialogDescription>
              {session.studentsCount} enrolled student(s)
            </DialogDescription>
          </DialogHeader>
  
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t.establishment.sessionStudentModal.empty}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Email</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id} data-testid={`row-student-${student.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={student.photoUrl || undefined} />
                          <AvatarFallback>
                            {student.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{student.name}</span>
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
              {t.establishment.sessionStudentModal.close}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }