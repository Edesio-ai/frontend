"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import InvitationModal from "@/components/establishment/InvitationModal";
import { TokenElement } from "@/components/establishment/TokenElement";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useEstablishment } from "../_contexts/establishment-context";
import { useTranslations } from "@/lib/i18n/client";
import type { InvitationToken } from "@/types";

export function InvitationSection() {
  const [showInvitationModal, setShowInvitationModal] = useState(false);
  const { invitationTokens, deleteInvitationToken, createInvitationToken } = useEstablishment();
  const t = useTranslations();

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Plus className="h-5 w-5" />
            {t.establishment.invitationCodes}
          </h2>
          <Button onClick={() => setShowInvitationModal(true)} data-testid="button-create-invitation">
            <Plus className="h-4 w-4 mr-2" />
            {t.establishment.newCode}
          </Button>
        </div>

        {invitationTokens.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>{t.establishment.noInvitations}</p>
            <p className="text-sm mt-1">{t.establishment.createCodeHint}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {invitationTokens.map((token: InvitationToken) => (
              <TokenElement key={token.id} token={token} handleDeleteToken={deleteInvitationToken} />
            ))}
          </div>
        )}
      </Card>
      <InvitationModal
        isOpen={showInvitationModal}
        setShowInvitationModal={setShowInvitationModal}
        createInvitationToken={createInvitationToken}
      />
    </>
  );
}
