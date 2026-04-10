import { Student, SessionWithStudentCount } from "@/types";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader } from "../ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Loader2, Users } from "lucide-react";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Avatar, AvatarImage } from "../ui/avatar";
import { AvatarFallback } from "@radix-ui/react-avatar";

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
    if (!session) return null;
  
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Élèves de {session.name}
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