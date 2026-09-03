"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Loader2, Mail, Plus } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "@/lib/i18n/client";
import { ApiError } from "@/lib/api-error";
import { translateApiError } from "@/lib/i18n/api-errors";
import { useToast } from "@/hooks/use-toast";

type InvitationModalProps = {
  isOpen: boolean;
  setShowInvitationModal: (open: boolean) => void;
  createInvitationToken: (email: string, days: number, chatbots: number) => Promise<boolean | null>;
};

export default function InvitationModal({
  isOpen,
  setShowInvitationModal,
  createInvitationToken,
}: InvitationModalProps) {
  const t = useTranslations();
  const { toast } = useToast();
  const [inviteEmail, setInviteEmail] = useState("");
  const [availableChatbots, setAvailableChatobots] = useState(0);
  const [isCreatingInvitation, setIsCreatingInvitation] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isValidEmail = inviteEmail.includes("@") && inviteEmail.includes(".");

  const handleClose = () => {
    setShowInvitationModal(false);
    setInviteEmail("");
    setAvailableChatobots(0);
    setErrorMessage(null);
  };

  const handleEmailChange = (value: string) => {
    setInviteEmail(value);
    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  const handleCreateInvitation = async () => {
    setIsCreatingInvitation(true);
    setErrorMessage(null);

    try {
      const result = await createInvitationToken(inviteEmail, 7, availableChatbots);
      if (result) {
        toast({
          title: t.hooks.establishment.invitationCreated,
        });
        handleClose();
      }
    } catch (err) {
      const fallback = t.hooks.establishment.invitationError;
      const message =
        err instanceof ApiError
          ? translateApiError(err.code, err.message, {
              invitationEmailAlreadyRegistered: t.establishment.invitationModal.emailAlreadyRegistered,
            })
          : fallback;
      setErrorMessage(message);
    } finally {
      setIsCreatingInvitation(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.establishment.invitationModal.title}</DialogTitle>
          <DialogDescription>{t.establishment.invitationModal.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="invite-email">{t.establishment.invitationModal.email}</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="invite-email"
                type="email"
                placeholder={t.establishment.invitationModal.emailPlaceholder}
                value={inviteEmail}
                onChange={(e) => handleEmailChange(e.target.value)}
                className="pl-10"
                aria-invalid={!!errorMessage}
                data-testid="input-invite-email"
              />
            </div>
            {errorMessage ? (
              <p className="text-sm text-destructive" data-testid="text-invite-email-error">
                {errorMessage}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">{t.establishment.invitationModal.emailHint}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="chatbots-count">{t.establishment.invitationModal.allocatedChatbots}</Label>
            <Input
              id="chatbots-count"
              type="number"
              min="0"
              max="100"
              value={availableChatbots}
              onChange={(e) => setAvailableChatobots(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-32"
              data-testid="input-chatbots-count"
            />
            <p className="text-xs text-muted-foreground">{t.establishment.invitationModal.allocatedChatbotsHint}</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {t.establishment.invitationModal.cancel}
          </Button>
          <Button
            onClick={handleCreateInvitation}
            disabled={isCreatingInvitation || !isValidEmail}
            data-testid="button-confirm-create-invitation"
          >
            {isCreatingInvitation ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t.establishment.invitationModal.creating}
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                {t.establishment.invitationModal.create}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
