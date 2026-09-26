"use client";

import { useActionState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Loader2, Mail, Plus } from "lucide-react";
import { useTranslations, type Dictionary } from "@/lib/i18n/client";
import { useToast } from "@/hooks/use-toast";
import { sendTeacherInvitationAction } from "@/app/(teaching)/_actions/establishment-actions";
import { initialInviteTeacherState } from "@/app/(teaching)/establishment/state";
import { useEstablishment } from "@/app/(teaching)/establishment/_contexts/establishment-context";
import type { InviteTeacherState } from "@/types";

type InvitationModalProps = {
  isOpen: boolean;
  setShowInvitationModal: (open: boolean) => void;
};

type InviteFormErrors = Dictionary["establishment"]["invitationsPage"]["form"]["errors"];

function getFieldError(errors: InviteFormErrors, alreadyRegistered: string, code?: string) {
  if (!code) return undefined;
  if (code === "emailAlreadyRegistered") return alreadyRegistered;
  return code in errors ? errors[code as keyof InviteFormErrors] : errors.defaultError;
}

export default function InvitationModal({ isOpen, setShowInvitationModal }: InvitationModalProps) {
  const handleClose = () => {
    setShowInvitationModal(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent>{isOpen ? <InvitationModalForm onClose={handleClose} /> : null}</DialogContent>
    </Dialog>
  );
}

function InvitationModalForm({ onClose }: { onClose: () => void }) {
  const t = useTranslations();
  const { toast } = useToast();
  const { refreshInvitationTokens } = useEstablishment();
  const formErrors = t.establishment.invitationsPage.form.errors;

  const [state, formAction, isPending] = useActionState(async (prev: InviteTeacherState, formData: FormData) => {
    const next = await sendTeacherInvitationAction(prev, formData);

    if (next.invitedEmail && !next.error) {
      toast({
        title: t.hooks.establishment.invitationCreated,
      });
      await refreshInvitationTokens();
      onClose();
    }

    return next;
  }, initialInviteTeacherState);

  const alreadyRegistered = t.establishment.invitationModal.emailAlreadyRegistered;
  const firstnameError = getFieldError(formErrors, alreadyRegistered, state.fieldErrors.firstname?.[0]);
  const lastnameError = getFieldError(formErrors, alreadyRegistered, state.fieldErrors.lastname?.[0]);
  const emailError = getFieldError(formErrors, alreadyRegistered, state.fieldErrors.email?.[0]);
  const assignedChatbotsError = getFieldError(formErrors, alreadyRegistered, state.fieldErrors.assignedChatbots?.[0]);
  const formError = getFieldError(formErrors, alreadyRegistered, state.error ?? undefined);

  return (
    <form noValidate action={formAction}>
      <DialogHeader>
        <DialogTitle>{t.establishment.invitationModal.title}</DialogTitle>
        <DialogDescription>{t.establishment.invitationModal.description}</DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="invite-firstname">{t.establishment.invitationModal.firstname}</Label>
            <Input
              id="invite-firstname"
              name="firstname"
              defaultValue={state.values.firstname}
              placeholder={t.establishment.invitationModal.firstnamePlaceholder}
              autoComplete="given-name"
              aria-invalid={Boolean(firstnameError)}
              data-testid="input-invite-firstname"
            />
            {firstnameError ? <p className="text-sm text-destructive">{firstnameError}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="invite-lastname">{t.establishment.invitationModal.lastname}</Label>
            <Input
              id="invite-lastname"
              name="lastname"
              defaultValue={state.values.lastname}
              placeholder={t.establishment.invitationModal.lastnamePlaceholder}
              autoComplete="family-name"
              aria-invalid={Boolean(lastnameError)}
              data-testid="input-invite-lastname"
            />
            {lastnameError ? <p className="text-sm text-destructive">{lastnameError}</p> : null}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="invite-email">{t.establishment.invitationModal.email}</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="invite-email"
              name="email"
              type="email"
              inputMode="email"
              placeholder={t.establishment.invitationModal.emailPlaceholder}
              defaultValue={state.values.email}
              className="pl-10"
              autoComplete="email"
              aria-invalid={Boolean(emailError || formError)}
              data-testid="input-invite-email"
            />
          </div>
          {emailError || formError ? (
            <p className="text-sm text-destructive" data-testid="text-invite-email-error">
              {emailError ?? formError}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">{t.establishment.invitationModal.emailHint}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="chatbots-count">{t.establishment.invitationModal.allocatedChatbots}</Label>
          <Input
            id="chatbots-count"
            name="assignedChatbots"
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            defaultValue={state.values.assignedChatbots}
            className="w-32"
            aria-invalid={Boolean(assignedChatbotsError)}
            data-testid="input-chatbots-count"
          />
          {assignedChatbotsError ? (
            <p className="text-sm text-destructive">{assignedChatbotsError}</p>
          ) : (
            <p className="text-xs text-muted-foreground">{t.establishment.invitationModal.allocatedChatbotsHint}</p>
          )}
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          {t.establishment.invitationModal.cancel}
        </Button>
        <Button type="submit" disabled={isPending} data-testid="button-confirm-create-invitation">
          {isPending ? (
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
    </form>
  );
}
