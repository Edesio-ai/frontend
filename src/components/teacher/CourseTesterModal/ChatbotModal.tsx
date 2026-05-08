import { ChatbotPreviewPanel } from "@/components/dashboard/ChatbotPreviewPanel";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MessageSquare, RefreshCw, X } from "lucide-react";
import { Course } from "@/types";
import { Question } from "@/types";

interface ChatbotModalProps {
    course: Course;
    allCourses: Course[];
    sessionName: string;
    fetchQuestions: (courseId: string) => Promise<Question[]>;
    chatbotRefreshKey: number;
    setChatbotRefreshKey: (key: number) => void;
    chatbotModalOpen: boolean;
    setChatbotModalOpen: (open: boolean) => void;
}

export function ChatbotModal({ course, allCourses, sessionName, fetchQuestions, chatbotRefreshKey, setChatbotRefreshKey, chatbotModalOpen, setChatbotModalOpen }: ChatbotModalProps) {
    return (
        <Dialog open={chatbotModalOpen} onOpenChange={setChatbotModalOpen}>
            <DialogContent
                className="!fixed !inset-0 !left-0 !top-0 !translate-x-0 !translate-y-0 !max-w-none !w-screen !h-[100dvh] !rounded-none !border-0 flex flex-col p-0 overflow-hidden [&>button]:hidden sm:!inset-auto sm:!left-1/2 sm:!top-1/2 sm:!-translate-x-1/2 sm:!-translate-y-1/2 sm:!max-w-3xl sm:!w-[95vw] sm:!h-[90vh] sm:!rounded-2xl sm:!border"
            >
                <DialogHeader className="px-4 pt-4 pb-3 border-b flex-shrink-0 sm:px-6 sm:pt-6 sm:pb-4" style={{ paddingTop: 'max(16px, env(safe-area-inset-top))' }}>
                    <div className="flex items-center justify-between gap-2">
                        <DialogTitle className="flex items-center gap-2 flex-1 min-w-0">
                            <MessageSquare className="h-5 w-5 text-primary shrink-0" />
                            <span className="truncate">Test du chatbot - {course.title}</span>
                        </DialogTitle>
                        <div className="flex items-center gap-2 shrink-0">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setChatbotRefreshKey(chatbotRefreshKey + 1)}
                                data-testid="button-refresh-chatbot"
                            >
                                <RefreshCw className="h-4 w-4 mr-1" />
                                Rafraîchir
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setChatbotModalOpen(false)}
                                data-testid="button-close-chatbot-modal"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                    <DialogDescription>
                        Simulez l'expérience élève en testant le chatbot avec les questions du course
                    </DialogDescription>
                </DialogHeader>
                <div className="flex-1 min-h-0 overflow-hidden">
                    <ChatbotPreviewPanel
                        course={allCourses}
                        sessionName={sessionName}
                        fetchQuestions={fetchQuestions}
                        refreshKey={chatbotRefreshKey}
                    />
                </div>
            </DialogContent>
        </Dialog>
    )
}