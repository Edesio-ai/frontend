import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { FileText, Loader2, Save, Pencil } from 'lucide-react'
import { Course } from '@/types/course.type'

type EditQuestionTesterModalSectionProps = {
    isEditing: boolean;
    setIsEditing: (isEditing: boolean) => void;
    handleSave: () => void;
    isSaving: boolean;
    course: Course;
    editedTitle: string;
    setEditedTitle: (editedTitle: string) => void;
    editedDescription: string;
    setEditedDescription: (editedDescription: string) => void;
    editedContent: string;
    setEditedContent: (editedContent: string) => void;

}

export function EditQuestionTesterModalSection({ isEditing, setIsEditing, handleSave, isSaving, course, editedTitle, setEditedTitle, editedDescription, setEditedDescription, editedContent, setEditedContent }: EditQuestionTesterModalSectionProps) {
    return (
        <>
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <h4 className="font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Contenu du cours
                </h4>
                <div className="flex gap-2">
                    {isEditing ? (
                        <>
                            <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                                Annuler
                            </Button>
                            <Button size="sm" onClick={handleSave} disabled={isSaving}>
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4 mr-1" /> Enregistrer</>}
                            </Button>
                        </>
                    ) : (
                        <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                            <Pencil className="h-4 w-4 mr-1" /> Modifier
                        </Button>
                    )}
                </div>
            </div>

            {isEditing ? (
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium mb-1 block">Titre</label>
                        <Input value={editedTitle} onChange={(e) => setEditedTitle(e.target.value)} />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">Description</label>
                        <Input value={editedDescription} onChange={(e) => setEditedDescription(e.target.value)} placeholder="Description..." />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">Contenu texte</label>
                        <Textarea value={editedContent} onChange={(e) => setEditedContent(e.target.value)} className="min-h-[120px]" placeholder="Contenu..." />
                    </div>
                </div>
            ) : (
                <Card className="p-4 space-y-3">
                    <div>
                        <span className="text-xs text-muted-foreground uppercase">Titre</span>
                        <p className="font-medium">{course.title}</p>
                    </div>
                    {course.description && (
                        <div>
                            <span className="text-xs text-muted-foreground uppercase">Description</span>
                            <p className="text-sm">{course.description}</p>
                        </div>
                    )}
                    {course.contentText && (
                        <div>
                            <span className="text-xs text-muted-foreground uppercase">Contenu</span>
                            <p className="text-sm whitespace-pre-wrap line-clamp-4">{course.contentText}</p>
                        </div>
                    )}
                </Card>
            )}
        </>
    )
}