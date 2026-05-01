import { KeyRound, Loader2, Sparkles } from "lucide-react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";

type JoinSessionModalProps = {
    joinModalOpen: boolean;
    setJoinModalOpen: (open: boolean) => void;
    joinCode: string;
    setJoinCode: (code: string) => void;
    joinError: string;
    setJoinError: (error: string) => void;
    handleJoinSession: () => void;
    isJoining: boolean;
}

export function JoinSessionModal({
    joinModalOpen,
    setJoinModalOpen,
    joinCode,
    setJoinCode,
    joinError,
    setJoinError,
    handleJoinSession,
    isJoining,
}: JoinSessionModalProps) {
    return (
        <Dialog open={joinModalOpen} onOpenChange={setJoinModalOpen}>
        <DialogContent data-testid="modal-join-session">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <KeyRound className="h-4 w-4 text-primary-foreground" />
              </div>
              Rejoindre une session
            </DialogTitle>
            <DialogDescription>
              Entre le code donné par ton professeur pour accéder à la session de révision.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Input
                placeholder="Code de session (ex: ABC123)"
                value={joinCode}
                onChange={(e) => {
                  setJoinCode(e.target.value.toUpperCase());
                  setJoinError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleJoinSession();
                  }
                }}
                className="text-center text-xl tracking-widest uppercase h-14 font-mono"
                data-testid="input-join-code"
              />
              {joinError && (
                <p className="text-sm text-destructive text-center">{joinError}</p>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setJoinModalOpen(false);
                  setJoinCode("");
                  setJoinError("");
                }}
                data-testid="button-cancel-join"
              >
                Annuler
              </Button>
              <Button
                className="flex-1 shadow-lg shadow-primary/25"
                onClick={handleJoinSession}
                disabled={isJoining || !joinCode.trim()}
                data-testid="button-confirm-join"
              >
                {isJoining ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Rejoindre
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
}