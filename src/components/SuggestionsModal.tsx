import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Lightbulb,
  ThumbsUp,
  Loader2,
  Send,
  Sparkles,
  MessageSquarePlus,
  X,
  Trash2
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface Suggestion {
  id: string;
  user_id: string;
  user_email: string | null;
  user_name: string | null;
  category: string;
  title: string;
  contenu: string;
  likes_count: number;
  created_at: string;
  userHasLiked: boolean;
}

interface SuggestionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: "teacher" | "student" | "establishment" | "standalone";
}

const formSchema = z.object({
  title: z.string().min(3, "Le title doit faire au moins 3 caractères").max(200, "Le title est trop long"),
  contenu: z.string().min(10, "La description doit faire au moins 10 caractères").max(2000, "La description est trop longue"),
});

type FormValues = z.infer<typeof formSchema>;

const categoryLabels: Record<string, string> = {
  professeur: "Professeurs",
  eleve: "Élèves",
  etablissement: "Établissements",
  autonome: "Edesio Solo",
};

export function SuggestionsModal({ open, onOpenChange, category }: SuggestionsModalProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [likingIds, setLikingIds] = useState<Set<string>>(new Set());
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      contenu: "",
    },
  });

  const fetchSuggestions = async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user?.id) {
        setCurrentUserId(session.user.id);
      }

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }

      const response = await fetch(`/api/suggestions/${category}`, { headers });
      const data = await response.json();

      if (data.suggestions) {
        setSuggestions(data.suggestions);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchSuggestions();
      setShowForm(false);
      form.reset();
    }
  }, [open, category]);

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        toast({
          title: "Connexion requise",
          description: "Vous devez être connecté pour proposer une suggestion.",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch("/api/suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          category,
          title: values.title,
          contenu: values.contenu,
        }),
      });

      const data = await response.json();

      if (data.suggestion) {
        setSuggestions(prev => [data.suggestion, ...prev]);
        form.reset();
        setShowForm(false);
        toast({
          title: "Suggestion publiée",
          description: "Merci pour votre contribution !",
        });
      } else if (data.error) {
        toast({
          title: "Erreur",
          description: data.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating suggestion:", error);
      toast({
        title: "Erreur",
        description: "Impossible de publier votre suggestion. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (suggestionId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        toast({
          title: "Connexion requise",
          description: "Vous devez être connecté pour voter.",
          variant: "destructive",
        });
        return;
      }

      setLikingIds(prev => new Set(prev).add(suggestionId));

      const response = await fetch(`/api/suggestions/${suggestionId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
      });

      const data = await response.json();

      if (data.likesCount !== undefined) {
        setSuggestions(prev => prev.map(s =>
          s.id === suggestionId
            ? { ...s, likes_count: data.likesCount, userHasLiked: data.liked }
            : s
        ));
      } else if (data.error) {
        toast({
          title: "Erreur",
          description: data.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error liking suggestion:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer votre vote. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setLikingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(suggestionId);
        return newSet;
      });
    }
  };

  const handleDelete = async (suggestionId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        toast({
          title: "Connexion requise",
          description: "Vous devez être connecté pour supprimer une suggestion.",
          variant: "destructive",
        });
        return;
      }

      setDeletingIds(prev => new Set(prev).add(suggestionId));

      const response = await fetch(`/api/suggestions/${suggestionId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
        toast({
          title: "Suggestion supprimée",
          description: "Votre suggestion a été supprimée avec succès.",
        });
      } else if (data.error) {
        toast({
          title: "Erreur",
          description: data.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting suggestion:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la suggestion. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(suggestionId);
        return newSet;
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="!fixed !inset-0 !left-0 !top-0 !translate-x-0 !translate-y-0 !max-w-none !w-screen !h-[100dvh] !rounded-none !border-0 flex flex-col p-0 overflow-hidden [&>button]:hidden sm:!inset-auto sm:!left-1/2 sm:!top-1/2 sm:!-translate-x-1/2 sm:!-translate-y-1/2 sm:!max-w-2xl sm:!w-[95vw] sm:!h-[85vh] sm:!rounded-2xl sm:!border"
      >
        <DialogHeader className="px-4 pt-4 pb-3 border-b flex-shrink-0 sm:px-6 sm:pt-6 sm:pb-4" style={{ paddingTop: 'max(16px, env(safe-area-inset-top))' }}>
          <div className="flex items-center justify-between gap-2">
            <DialogTitle className="flex items-center gap-2 flex-1 min-w-0">
              <Lightbulb className="h-5 w-5 text-amber-500 shrink-0" />
              <span className="truncate leading-normal pb-0.5">Suggestions d'amélioration</span>
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              data-testid="button-close-suggestions"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <DialogDescription>
            Partagez vos idées pour améliorer l'expérience {categoryLabels[category]}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 space-y-4">
          {!showForm ? (
            <Button
              onClick={() => setShowForm(true)}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 text-white shadow-md !ring-0 !ring-offset-0 focus:outline-none border border-amber-600"
              data-testid="button-new-suggestion"
            >
              <MessageSquarePlus className="h-5 w-5 mr-2" />
              Proposer une amélioration
            </Button>
          ) : (
            <Card className="p-4 border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Titre de votre suggestion</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: Ajouter un mode sombre..."
                            {...field}
                            data-testid="input-suggestion-title"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contenu"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Décrivez votre idée en détail..."
                            className="min-h-[100px] resize-none"
                            {...field}
                            data-testid="input-suggestion-content"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowForm(false);
                        form.reset();
                      }}
                      className="flex-1"
                      data-testid="button-cancel-suggestion"
                    >
                      Annuler
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 text-white !ring-0 !ring-offset-0 focus:outline-none border border-amber-600"
                      data-testid="button-submit-suggestion"
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      Publier
                    </Button>
                  </div>
                </form>
              </Form>
            </Card>
          )}

          {suggestions.length > 0 && !isLoading && (
            <p className="text-xs text-muted-foreground text-center mb-2">
              Votez pour les suggestions que vous trouvez utiles
            </p>
          )}

          <div className="space-y-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : suggestions.length === 0 ? (
              <div className="text-center py-12">
                <Sparkles className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">
                  Aucune suggestion pour le moment.
                </p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  Soyez le premier à proposer une amélioration !
                </p>
              </div>
            ) : (
              suggestions.map((suggestion) => (
                <Card
                  key={suggestion.id}
                  className="p-4 hover-elevate transition-all"
                  data-testid={`card-suggestion-${suggestion.id}`}
                >
                  <div className="flex gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-sm sm:text-base line-clamp-2">
                          {suggestion.title}
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                        {suggestion.contenu}
                      </p>
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground min-w-0 flex-shrink">
                          <span className="truncate max-w-[120px] sm:max-w-none">{suggestion.user_email || "Anonyme"}</span>
                          <span>•</span>
                          <span className="whitespace-nowrap">
                            {formatDistanceToNow(new Date(suggestion.created_at), {
                              addSuffix: true,
                              locale: fr
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {currentUserId === suggestion.user_id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(suggestion.id)}
                              disabled={deletingIds.has(suggestion.id)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10 !ring-0 !ring-offset-0 focus:outline-none"
                              data-testid={`button-delete-${suggestion.id}`}
                            >
                              {deletingIds.has(suggestion.id) ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                          <Button
                            variant={suggestion.userHasLiked ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleLike(suggestion.id)}
                            disabled={likingIds.has(suggestion.id)}
                            className={`gap-1.5 !ring-0 !ring-offset-0 focus:outline-none ${suggestion.userHasLiked
                                ? "bg-primary hover:bg-primary/90"
                                : "hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                              }`}
                            data-testid={`button-like-${suggestion.id}`}
                          >
                            {likingIds.has(suggestion.id) ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <ThumbsUp className={`h-4 w-4 ${suggestion.userHasLiked ? "fill-current" : ""}`} />
                            )}
                            <span>Voter</span>
                            <span>{suggestion.likes_count}</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}