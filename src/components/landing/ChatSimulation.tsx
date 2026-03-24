import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";


interface Message {
    role: "student" | "ai";
    content: string;
}

const messages: Message[] = [
    {
        role: "ai",
        content:
            "Bonjour ! Je suis Edesio. Je vais t'aider à réviser ton cours sur le système solaire. C'est parti !",
    },
    {
        role: "ai",
        content:
            "Question 1 : Quelle est la plus grande planète du système solaire ?\n\nA. Saturne\nB. Jupiter\nC. Neptune",
    },
    {
        role: "student",
        content: "Je pense que c'est Jupiter, donc la réponse B !",
    },
    {
        role: "ai",
        content:
            "Bravo ! C'est la bonne réponse ! Jupiter est la plus grande planète du système solaire, avec un diamètre 11 fois supérieur à celui de la Terre.",
    },
];

export function ChatSimulation() {
    return (
        <Card className="p-4 md:p-6 shadow-2xl bg-card border-card-border relative overflow-hidden">
            {/* Decorative gradient */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />

            <div className="relative z-10">
                <div className="flex items-center gap-3 pb-4 border-b border-border mb-4">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-400" />
                        <div className="w-3 h-3 rounded-full bg-yellow-400" />
                        <div className="w-3 h-3 rounded-full bg-green-400" />
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                        <img src="/edesio-logo-square.png" alt="Edesio" className="w-6 h-6 rounded-md object-cover" />
                        <span className="text-sm text-muted-foreground font-medium">
                            Edesio - Révision
                        </span>
                    </div>
                </div>

                <div className="space-y-4" data-testid="chat-simulation">
                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={`flex gap-3 ${message.role === "student" ? "flex-row-reverse" : ""}`}
                        >
                            <Avatar className="h-8 w-8 shrink-0">
                                <AvatarImage
                                    src={message.role === "ai" ? '/edesio-logo-square.png' : '/teenage-girl-student.png'}
                                    alt={message.role === "ai" ? "Edesio" : "student"}
                                    className="object-cover"
                                />
                                <AvatarFallback
                                    className={
                                        message.role === "ai"
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-secondary text-secondary-foreground"
                                    }
                                >
                                    {message.role === "ai" ? "IA" : "E"}
                                </AvatarFallback>
                            </Avatar>
                            <div
                                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-line ${message.role === "ai"
                                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                        : "bg-secondary text-secondary-foreground"
                                    }`}
                                data-testid={`message-${message.role}-${index}`}
                            >
                                {message.content}
                            </div>
                        </div>
                    ))}

                    <div className="flex gap-3">
                        <Avatar className="h-8 w-8 shrink-0">
                            <AvatarImage src="/edesio-logo-square.png" alt="Edesio" className="object-cover" />
                            <AvatarFallback className="bg-primary text-primary-foreground">
                                IA
                            </AvatarFallback>
                        </Avatar>
                        <div className="bg-primary text-primary-foreground rounded-2xl px-4 py-2.5 shadow-lg shadow-primary/20">
                            <div className="flex gap-1">
                                <span
                                    className="w-2 h-2 rounded-full bg-primary-foreground/70 animate-bounce"
                                    style={{ animationDelay: "0ms" }}
                                />
                                <span
                                    className="w-2 h-2 rounded-full bg-primary-foreground/70 animate-bounce"
                                    style={{ animationDelay: "150ms" }}
                                />
                                <span
                                    className="w-2 h-2 rounded-full bg-primary-foreground/70 animate-bounce"
                                    style={{ animationDelay: "300ms" }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}
