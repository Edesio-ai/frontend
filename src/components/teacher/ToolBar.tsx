import { ChevronRight, Loader2, Plus, Search, Users } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Session } from "@/types";

type ToolBarProps = {
    setSelectedSession: (session: Session) => void;
    handleOpenCreateModal: () => void;
    sessions: Session[];
}
export function ToolBar({ setSelectedSession, handleOpenCreateModal, sessions }: ToolBarProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);

    const [searchResults, setSearchResults] = useState<Session[]>([]);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);


    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        if (!searchQuery.trim()) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);

        searchTimeoutRef.current = setTimeout(() => {
            const query = searchQuery.toLowerCase();
            const filtered = sessions.filter(
                (session) => session.name.toLowerCase().includes(query)
            );
            setSearchResults(filtered);
            setIsSearching(false);
        }, 300);

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [searchQuery, sessions]);

    const handleSelectSearchResult = (session: Session) => {
        setSearchQuery("");
        setSelectedSession(session);
    };
    return (
        <section>
            <Card className="p-6 bg-card/80 backdrop-blur-sm border-border/50 shadow-xl" data-testid="card-search-and-create">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher une classe..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-background/50"
                            data-testid="input-search-sessions"
                        />

                        {searchQuery && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg z-10 max-h-80 overflow-y-auto">
                                {isSearching ? (
                                    <div className="p-4 text-center text-muted-foreground">
                                        <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                                    </div>
                                ) : searchResults.length === 0 ? (
                                    <div className="p-4 text-center text-muted-foreground">
                                        Aucune classe trouvée pour "{searchQuery}"
                                    </div>
                                ) : (
                                    <div className="py-2">
                                        {searchResults.map((session) => (
                                            <button
                                                key={session.id}
                                                className="w-full px-4 py-3 text-left hover:bg-muted/50 flex items-center gap-3"
                                                onClick={() => handleSelectSearchResult(session)}
                                                data-testid={`search-result-${session.id}`}
                                            >
                                                <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium truncate">{session.name}</p>
                                                    <p className="text-sm text-muted-foreground truncate">
                                                        Code: {session.code}
                                                    </p>
                                                </div>
                                                <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <Button
                        onClick={handleOpenCreateModal}
                        className="shadow-lg shadow-primary/25"
                        data-testid="button-open-create-modal"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Nouvelle classe
                    </Button>
                </div>
            </Card>
        </section>
    )
}