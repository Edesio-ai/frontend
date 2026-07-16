import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Loader2, Mail, Plus } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "@/lib/i18n/client";

type InvitationModalProps = {
    isOpen: boolean;
    setShowInvitationModal: (open: boolean) => void;
    createInvitationToken: (email: string, days: number, chatbots: number) => Promise<boolean | null>;
}

export default function InvitationModal({
    isOpen,
    setShowInvitationModal,
    createInvitationToken,
}: InvitationModalProps) {
    const t = useTranslations();
    const [inviteEmail, setInviteEmail] = useState("");
    const [availableChatbots, setAvailableChatobots] = useState(0);
    const [isCreatingInvitation, setIsCreatingInvitation] = useState(false);

    const isValidEmail = inviteEmail.includes("@") && inviteEmail.includes(".");

    const handleClose = () => {
        setShowInvitationModal(false);
        setInviteEmail("");
        setAvailableChatobots(0);
    }

    const handleCreateInvitation = async () => {
        setIsCreatingInvitation(true);
        const result = await createInvitationToken(inviteEmail, 7, availableChatbots);
        setIsCreatingInvitation(false);
        if (result) {
          setShowInvitationModal(false);
          setInviteEmail("");
          setAvailableChatobots(0);
        }
      };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t.establishment.invitationModal.title}</DialogTitle>
                    <DialogDescription>
                        Entrez l'adresse email du professeur que vous souhaitez inviter.
                        Un code d'invitation sera généré et ne pourra être utilisé que par cette adresse email.
                    </DialogDescription>
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
                                onChange={(e) => setInviteEmail(e.target.value)}
                                className="pl-10"
                                data-testid="input-invite-email"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Le code sera valide pendant 7 jours et ne pourra être utilisé que par cette adresse email.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="chatbots-count">Nombre de chatbots alloués</Label>
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
                        <p className="text-xs text-muted-foreground">
                            Nombre de sessions/chatbots que ce professeur pourra créer.
                        </p>
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