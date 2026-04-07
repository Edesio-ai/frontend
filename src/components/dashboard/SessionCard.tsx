import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Session } from "@/types";
import { Calendar, Copy, BookOpen, Check, Trash2, Users, Loader2, MessageCircle, Pencil } from "lucide-react";
import { useState } from "react";

interface SessionCardProps {
  session: Session;
  isSelected: boolean;
  onSelect: (session: Session) => void;
  onDelete?: (sessionId: string) => Promise<boolean>;
  onRename?: (sessionId: string, newName: string) => Promise<Session | null>;
  pendingQuestionsCount?: number;
}

export function SessionCard({ session, isSelected, onSelect, onDelete, onRename, pendingQuestionsCount = 0 }: SessionCardProps) {
  const [copied, setCopied] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [newName, setNewName] = useState(session.nom);
  const [isRenaming, setIsRenaming] = useState(false);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const handleCopyCode = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(session.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!onDelete) return;
    setIsDeleting(true);
    const success = await onDelete(session.id);
    setIsDeleting(false);
    if (success) {
      setDeleteModalOpen(false);
    }
  };

  const handleRenameClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNewName(session.nom);
    setRenameModalOpen(true);
  };

  const handleConfirmRename = async () => {
    if (!onRename || !newName.trim()) return;
    setIsRenaming(true);
    const updatedSession = await onRename(session.id, newName.trim());
    setIsRenaming(false);
    if (updatedSession) {
      setRenameModalOpen(false);
    }
  };

  return (
    <>
      <Card
        className={`relative overflow-hidden cursor-pointer transition-all hover-elevate group ${
          isSelected
            ? "ring-2 ring-primary bg-primary/5"
            : ""
        }`}
        onClick={() => onSelect(session)}
        data-testid={`card-session-${session.id}`}
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-primary/80 to-primary/60" />
        
        <div className="p-5">
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0">
                  <Users className="h-5 w-5 text-primary" />
                  {pendingQuestionsCount > 0 && (
                    <span 
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center"
                      data-testid={`badge-pending-questions-${session.id}`}
                    >
                      {pendingQuestionsCount > 9 ? "9+" : pendingQuestionsCount}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-lg leading-tight break-words" data-testid={`text-session-name-${session.id}`}>
                  {session.nom}
                </h3>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {onRename && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground opacity-60 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
                    onClick={handleRenameClick}
                    data-testid={`button-rename-session-${session.id}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground opacity-60 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity hover:text-destructive hover:bg-destructive/10 focus-visible:text-destructive focus-visible:bg-destructive/10"
                    onClick={handleDeleteClick}
                    data-testid={`button-delete-session-${session.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium">
                Code de session à communiquer à vos élèves
              </p>
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className="font-mono text-base px-4 py-1.5 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20"
                  data-testid={`badge-session-code-${session.id}`}
                >
                  {session.code}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleCopyCode}
                  data-testid={`button-copy-code-${session.id}`}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(session.created_at)}</span>
              </div>
            </div>

            <Button
              variant={isSelected ? "default" : "outline"}
              size="sm"
              className="w-full"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(session);
              }}
              data-testid={`button-manage-courses-${session.id}`}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Gérer les cours
            </Button>
          </div>
        </div>
      </Card>

      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent data-testid="modal-delete-session">
          <DialogHeader>
            <DialogTitle className="text-destructive">Supprimer la session ?</DialogTitle>
            <DialogDescription>
              Cette action est irréversible. Tous les cours, fichiers PDF et questions associés à la session "{session.nom}" seront définitivement supprimés.
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setDeleteModalOpen(false)}
              disabled={isDeleting}
              data-testid="button-cancel-delete"
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              data-testid="button-confirm-delete"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Suppression...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={renameModalOpen} onOpenChange={setRenameModalOpen}>
        <DialogContent data-testid="modal-rename-session">
          <DialogHeader>
            <DialogTitle>Renommer la session</DialogTitle>
            <DialogDescription>
              Modifiez le nom de votre session. Ce changement sera visible par vos élèves.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nom de la session"
              data-testid="input-rename-session"
            />
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setRenameModalOpen(false)}
                disabled={isRenaming}
                data-testid="button-cancel-rename"
              >
                Annuler
              </Button>
              <Button
                className="flex-1"
                onClick={handleConfirmRename}
                disabled={isRenaming || !newName.trim()}
                data-testid="button-confirm-rename"
              >
                {isRenaming ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Enregistrer
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
