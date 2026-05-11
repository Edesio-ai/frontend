import { TabsContent } from "@/components/ui/tabs";
import { Session, StudentSessionWithStudent } from "@/types";
import { Loader2, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface StudentTabProps {
    loadingSessionStudents: boolean;
    sessionStudents: StudentSessionWithStudent[];
    selectedSession: Session;
}

export function StudentTab({
    loadingSessionStudents,
    sessionStudents,
    selectedSession,
}: StudentTabProps) {
    return (
        <TabsContent value="students" className="flex-1 overflow-y-auto m-0 mt-0">
            <div className="p-6">
                {loadingSessionStudents ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : sessionStudents.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 flex items-center justify-center mx-auto mb-4">
                            <Users className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="font-semibold text-lg mb-2">Aucun élève inscrit</h3>
                        <p className="text-sm text-muted-foreground max-w-md mx-auto">
                            Partagez le code <span className="font-mono font-semibold text-primary">{selectedSession.code}</span> avec vos élèves pour qu'ils rejoignent cette session.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {sessionStudents.map((sessionsStudents) => (
                            <div
                                key={sessionsStudents.id}
                                className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 border"
                                data-testid={`sessions-students-${sessionsStudents.id}`}
                            >
                                <Avatar className="h-10 w-10">
                                    {sessionsStudents.photoUrl ? (
                                        <AvatarImage src={sessionsStudents.photoUrl} alt={sessionsStudents.name} />
                                    ) : null}
                                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                        {sessionsStudents.name.slice(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">{sessionsStudents.name}</p>
                                    <p className="text-sm text-muted-foreground truncate">{sessionsStudents.email}</p>
                                </div>
                                <div className="text-right text-sm text-muted-foreground">
                                    <p>Inscrit le</p>
                                    <p>{new Date(sessionsStudents.joinedAt).toLocaleDateString("fr-FR")}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </TabsContent>
    );
}