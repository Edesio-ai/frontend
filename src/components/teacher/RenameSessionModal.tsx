import { Check, Loader2 } from "lucide-react";
import { Dialog, DialogContent } from "../ui/dialog";
import { DialogHeader } from "../ui/dialog";
import { DialogTitle } from "../ui/dialog";
import { DialogDescription } from "../ui/dialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

type RenameSessionModalProps = {
    renameModalOpen: boolean;
    setRenameModalOpen: (open: boolean) => void;
    newName: string;
    setNewName: (newName: string) => void;
    isRenaming: boolean;
    handleConfirmRename: () => void;
}
export function RenameSessionModal({ renameModalOpen, setRenameModalOpen, newName, setNewName, isRenaming, handleConfirmRename }: RenameSessionModalProps) {
    return (
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
    )
}