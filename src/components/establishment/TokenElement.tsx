import { CheckCircle2, Clock, Copy, Mail, Trash2 } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { InvitationToken } from "@/types";
import { useState } from "react";

type TokenElementProps = {
    token: InvitationToken;
    handleDeleteToken: (id: string) => void;
}
export function TokenElement({ token, handleDeleteToken }: TokenElementProps) {
    const [copiedToken, setCopiedToken] = useState<string | null>(null);
    
    const isTokenExpired = (expiresAt: string) => {
        return new Date(expiresAt) < new Date();
    };

    const handleCopyToken = (token: string) => {
        navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_APP_URL}/register/teacher-invitation/${token}`);
        setCopiedToken(token);
        setTimeout(() => setCopiedToken(null), 2000);
    };
    const expired = isTokenExpired(token.expiresAt);
    const used = !!token.usedAt;
    return (
        <div
            key={token.id}
            className={`flex items-center justify-between p-4 rounded-lg border ${expired || used ? "bg-muted/50 opacity-60" : "bg-background"
                }`}
            data-testid={`invitation-token-${token.id}`}
        >
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-4">
                    <code className="bg-muted px-3 py-1 rounded font-mono text-sm">
                        {token.token}
                    </code>
                    {used ? (
                        <Badge variant="secondary" className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Utilisé
                        </Badge>
                    ) : expired ? (
                        <Badge variant="destructive" className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Expiré
                        </Badge>
                    ) : (
                        <Badge variant="outline" className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Expire le {new Date(token.expiresAt).toLocaleDateString("fr-FR")}
                        </Badge>
                    )}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        <span>{token.invitedEmail}</span>
                    </div>
                    {token.availableChatbots !== undefined && token.availableChatbots! > 0 && (
                        <Badge variant="outline" className="text-xs">
                            {token.availableChatbots} chatbot{token.availableChatbots! > 1 ? "s" : ""}
                        </Badge>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2">
                {!expired && !used && (
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopyToken(token.token)}
                        data-testid={`button-copy-token-${token.id}`}
                    >
                        {copiedToken === token.token ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                            <Copy className="h-4 w-4" />
                        )}
                    </Button>
                )}
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteToken(token.id)}
                    data-testid={`button-delete-token-${token.id}`}
                >
                    <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
            </div>
        </div>
    );
}