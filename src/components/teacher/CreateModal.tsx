import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { BookOpen, FileText, Globe, Loader2, Plus, Sparkles, Upload, Users, X } from "lucide-react";
import { Form, FormMessage } from "../ui/form";
import { FormField } from "../ui/form";
import { FormItem } from "../ui/form";
import { FormLabel } from "../ui/form";
import { FormControl } from "../ui/form";
import { Input } from "../ui/input";
import { Select } from "../ui/select";
import { UseFormReturn } from "react-hook-form";
import { Course, Session, SessionLanguage } from "@/types";
import { toast } from "@/hooks/use-toast";
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Button } from "../ui/button";
import { Dispatch, SetStateAction, useRef, useState } from "react";
import { CreateSessionFormValues } from "@/types/zod.type";
import { Textarea } from "../ui/textarea";


const langueLabels: Record<SessionLanguage, string> = {
    francais: "Français",
    anglais: "Anglais",
    espagnol: "Espagnol",
    allemand: "Allemand",
};

type CreateModalProps = {
    createModalOpen: boolean;
    onOpenChange: (open: boolean) => void;
    form: UseFormReturn<CreateSessionFormValues>;
    createSession: (sessionNom: string, sessionLangue: SessionLanguage) => Promise<Session | null>;
    createCourse: (sessionId: string, coursTitre: string, coursDescription: string, coursContenu: string, pdfFiles: File[] | undefined) => Promise<Course | null>;
    setSelectedPdfFiles: Dispatch<SetStateAction<File[]>>;
    selectedPdfFiles: File[];
    refreshSessions: () => Promise<void>;
    handleCloseCreateModal: () => void;
    setSelectedSession: Dispatch<SetStateAction<Session | null>>;
    setNewlyCreatedCours: Dispatch<SetStateAction<Course | null>>;
}

export function CreateModal({
    createModalOpen,
    onOpenChange,
    form,
    createSession,
    createCourse,
    setSelectedPdfFiles,
    selectedPdfFiles,
    refreshSessions,
    handleCloseCreateModal,
    setSelectedSession,
    setNewlyCreatedCours,
}: CreateModalProps) {
    const [isCreating, setIsCreating] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            setSelectedPdfFiles((prev: File[]) => [...prev, ...Array.from(files)]);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const removeSelectedFile = (index: number) => {
        setSelectedPdfFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const onCreateSubmit = async (data: CreateSessionFormValues) => {
        console.log("🚀 ~ onCreateSubmit ~ data:", data)
        setIsCreating(true);
        const { sessionName, sessionLanguage, courseTitle, courseDescription, courseContent } = data;

        try {
            const newSession = await createSession(sessionName, sessionLanguage);

            if (!newSession) {
                toast({
                    title: "Erreur",
                    description: "Impossible de créer la session. Veuillez réessayer.",
                    variant: "destructive",
                });
                setIsCreating(false);
                return;
            }

            const newCourse = await createCourse(
                newSession.id,
                courseTitle,
                courseDescription || "",
                courseContent || "",
                selectedPdfFiles.length > 0 ? selectedPdfFiles : undefined
            );

            await refreshSessions();
            handleCloseCreateModal();

            if (!newCourse) {
                toast({
                    title: "Attention",
                    description: "La session a été créée mais le cours n'a pas pu être ajouté. Vous pouvez l'ajouter manuellement.",
                    variant: "destructive",
                });
                setSelectedSession(newSession);
            } else {
                toast({
                    title: "Succès",
                    description: "Session et cours créés avec succès !",
                });
                setNewlyCreatedCours(newCourse);
                setSelectedSession(newSession);
            }
        } catch (err) {
            console.error("Error in creation flow:", err);
            toast({
                title: "Erreur",
                description: "Une erreur inattendue s'est produite. Veuillez réessayer.",
                variant: "destructive",
            });
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <Dialog open={createModalOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col p-0">
                <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
                    <DialogTitle className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                            <Plus className="h-4 w-4 text-primary-foreground" />
                        </div>
                        Créer une nouvelle classe
                    </DialogTitle>
                    <DialogDescription>
                        Créez une classe et ajoutez votre premier cours en même temps.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto px-6 py-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onCreateSubmit)} className="space-y-6">
                            <div className="space-y-4">
                                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    Classe
                                </h4>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <FormField
                                        control={form.control}
                                        name="sessionName"
                                        render={({ field }) => (
                                            <FormItem className="flex-1">
                                                <FormLabel>Nom de la classe</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Ex: 3ème B – Histoire"
                                                        {...field}
                                                        data-testid="input-new-session-name"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="sessionLanguage"
                                        render={({ field }) => (
                                            <FormItem className="w-full sm:w-44">
                                                <FormLabel>Langue du cours</FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    value={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger data-testid="select-new-session-language">
                                                            <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                                                            <SelectValue placeholder="Langue" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {(Object.keys(langueLabels) as SessionLanguage[]).map((lang) => (
                                                            <SelectItem key={lang} value={lang}>
                                                                {langueLabels[lang]}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            <div className="border-t pt-6 space-y-4">
                                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                                    <BookOpen className="h-4 w-4" />
                                    Premier cours
                                </h4>

                                <FormField
                                    control={form.control}
                                    name="courseTitle"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Titre du cours</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Ex: La Révolution française"
                                                    {...field}
                                                    data-testid="input-new-course-title"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="courseDescription"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description courte <span className="text-muted-foreground font-normal">(optionnel)</span></FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Ex: Introduction aux causes et conséquences"
                                                    {...field}
                                                    data-testid="input-new-course-description"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="space-y-2">
                                    <FormLabel>Fichiers PDF</FormLabel>
                                    <p className="text-xs text-muted-foreground">
                                        Ajoutez un ou plusieurs fichiers PDF contenant le contenu du cours
                                    </p>
                                    <div className="space-y-2">
                                        <input
                                            type="file"
                                            accept="application/pdf"
                                            onChange={handleFileSelect}
                                            className="hidden"
                                            ref={fileInputRef}
                                            multiple
                                            data-testid="input-new-course-pdf"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => fileInputRef.current?.click()}
                                            data-testid="button-select-pdf-new"
                                        >
                                            <Upload className="h-4 w-4 mr-2" />
                                            {selectedPdfFiles.length > 0 ? "Ajouter d'autres PDFs" : "Sélectionner des PDFs"}
                                        </Button>
                                        {selectedPdfFiles.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {selectedPdfFiles.map((file, index) => (
                                                    <div
                                                        key={`${file.name}-${file.size}-${index}`}
                                                        className="flex items-center gap-2 text-sm bg-primary/10 border border-primary/20 rounded-md px-2 py-1"
                                                    >
                                                        <FileText className="h-3.5 w-3.5 text-primary" />
                                                        <span className="max-w-[200px] truncate">{file.name}</span>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-5 w-5"
                                                            onClick={() => removeSelectedFile(index)}
                                                            data-testid={`button-remove-pdf-new-${index}`}
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <FormField
                                    control={form.control}
                                    name="courseContent"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Contenu texte additionnel
                                                <span className="text-muted-foreground font-normal ml-2">(optionnel)</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Vous pouvez ajouter du texte supplémentaire ici, ou laisser vide si vous utilisez uniquement des PDFs..."
                                                    className="min-h-[100px] resize-y"
                                                    {...field}
                                                    data-testid="textarea-new-course-content"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-4 border-t">
                                <Button type="button" variant="outline" onClick={handleCloseCreateModal}>
                                    Annuler
                                </Button>
                                <Button type="submit" disabled={isCreating} className="shadow-lg shadow-primary/25" data-testid="button-create-session-and-course">
                                    {isCreating ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            Création...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="h-4 w-4 mr-2" />
                                            Créer la session et le cours
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    )
}