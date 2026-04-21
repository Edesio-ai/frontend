import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useChatbotPreview, type ChatMessage } from "@/hooks/use-chatbot-preview.hook";
import type { Course, Question } from "@/types";
import { propositionLabels } from "@/lib/proposition-labels";
import { 
  Send, 
  User, 
  BookOpen,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Sparkles,
  MessageCircle,
  Zap,
  Trophy,
  Star
} from "lucide-react";

interface ChatbotPreviewPanelProps {
  course: Course[];
  sessionName: string;
  fetchQuestions: (coursId: string) => Promise<Question[]>;
  refreshKey: number;
}

function TypingIndicator() {
  return (
    <div className="flex gap-3" data-testid="typing-indicator">
      <Avatar className="h-10 w-10 flex-shrink-0 ring-2 ring-primary/20 shadow-md">
        <AvatarImage src="/edesio-logo-square.png" alt="Edesio" className="object-cover" />
        <AvatarFallback className="bg-primary/10 text-primary">IA</AvatarFallback>
      </Avatar>
      <div className="bg-card border border-border rounded-2xl rounded-tl-md px-5 py-4 shadow-sm">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2.5 h-2.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2.5 h-2.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isBot = message.sender === "bot";

  return (
    <div
      className={`flex gap-3 ${isBot ? "" : "flex-row-reverse"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
      data-testid={`message-${message.id}`}
    >
      <Avatar
        className={`h-10 w-10 flex-shrink-0 shadow-md ${
          isBot 
            ? "ring-2 ring-primary/20" 
            : "ring-2 ring-emerald-500/30"
        }`}
      >
        {isBot ? (
          <AvatarImage src="/edesio-logo-square.png" alt="Edesio" className="object-cover" />
        ) : null}
        <AvatarFallback className={isBot ? "bg-primary/10 text-primary text-sm font-semibold" : "bg-gradient-to-br from-emerald-500 to-green-600 text-white font-bold text-sm"}>
          {isBot ? "IA" : <User className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>
      <div
        className={`max-w-[85%] shadow-sm ${
          isBot 
            ? "bg-card border border-border text-foreground rounded-2xl rounded-tl-md" 
            : "bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-2xl rounded-tr-md"
        } ${
          message.type === "feedback" && message.isCorrect === true
            ? "!border-2 !border-emerald-400/60 !bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/40 dark:to-green-900/40"
            : ""
        } ${
          message.type === "feedback" && message.isCorrect === false && message.isPartial
            ? "!border-2 !border-orange-400/60 !bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/40 dark:to-amber-900/40"
            : ""
        } ${
          message.type === "feedback" && message.isCorrect === false && !message.isPartial
            ? "!border-2 !border-red-400/60 !bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/40 dark:to-rose-900/40"
            : ""
        } ${
          message.type === "completion" && message.scoreRatio !== undefined && message.scoreRatio >= 0.7
            ? "!border-2 !border-emerald-400/60 !bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/40 dark:to-green-900/40"
            : ""
        } ${
          message.type === "completion" && message.scoreRatio !== undefined && message.scoreRatio >= 0.5 && message.scoreRatio < 0.7
            ? "!border-2 !border-orange-400/60 !bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/40 dark:to-amber-900/40"
            : ""
        } ${
          message.type === "completion" && (message.scoreRatio === undefined || message.scoreRatio < 0.5)
            ? "!border-2 !border-red-400/60 !bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/40 dark:to-rose-900/40"
            : ""
        } px-4 py-3`}
      >
        {message.type === "completion" && (
          <div className={`flex items-center gap-2 mb-2 pb-2 border-b ${
            message.scoreRatio !== undefined && message.scoreRatio >= 0.7 
              ? "border-emerald-300/30" 
              : message.scoreRatio !== undefined && message.scoreRatio >= 0.5 
                ? "border-orange-300/30" 
                : "border-red-300/30"
          }`}>
            <div className={`p-1.5 rounded-full ${
              message.scoreRatio !== undefined && message.scoreRatio >= 0.7 
                ? "bg-emerald-500/20" 
                : message.scoreRatio !== undefined && message.scoreRatio >= 0.5 
                  ? "bg-orange-500/20" 
                  : "bg-red-500/20"
            }`}>
              <Trophy className={`h-4 w-4 ${
                message.scoreRatio !== undefined && message.scoreRatio >= 0.7 
                  ? "text-emerald-600 dark:text-emerald-400" 
                  : message.scoreRatio !== undefined && message.scoreRatio >= 0.5 
                    ? "text-orange-600 dark:text-orange-400" 
                    : "text-red-600 dark:text-red-400"
              }`} />
            </div>
            <span className={`font-bold text-sm ${
              message.scoreRatio !== undefined && message.scoreRatio >= 0.7 
                ? "text-emerald-700 dark:text-emerald-300" 
                : message.scoreRatio !== undefined && message.scoreRatio >= 0.5 
                  ? "text-orange-700 dark:text-orange-300" 
                  : "text-red-700 dark:text-red-300"
            }`}>Session terminée !</span>
          </div>
        )}
        <p className="text-sm sm:text-base whitespace-pre-wrap leading-relaxed">{message.text}</p>
        {message.type === "feedback" && (
          <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-current/10">
            {message.isCorrect ? (
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <div className="p-1 rounded-full bg-emerald-500/20">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <span className="text-sm font-semibold">Bonne réponse ! +1 point</span>
              </div>
            ) : message.isPartial ? (
              <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                <div className="p-1 rounded-full bg-orange-500/20">
                  <Star className="h-4 w-4" />
                </div>
                <span className="text-sm font-semibold">Réponse partielle +0.5 point</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <div className="p-1 rounded-full bg-red-500/20">
                  <XCircle className="h-4 w-4" />
                </div>
                <span className="text-sm font-semibold">À revoir</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function CourseSelectionDropdown({
  course,
  onSelect,
}: {
  course: Course[];
  onSelect: (c: Course) => void;
}) {
  const handleValueChange = (coursId: string) => {
    const selected = course.find((c) => c.id === coursId);
    if (selected) {
      onSelect(selected);
    }
  };

  return (
    <div className="bg-gradient-to-br from-primary/20 to-violet-500/20 rounded-xl p-5 border-2 border-primary/30 shadow-md space-y-3 animate-in fade-in slide-in-from-bottom-3 duration-300">
      <div className="flex items-center justify-center gap-2 text-base font-semibold text-foreground">
        <BookOpen className="h-5 w-5 text-primary" />
        <span>Choisis le course à réviser</span>
      </div>
      <Select onValueChange={handleValueChange}>
        <SelectTrigger className="w-full h-12 text-base bg-background border-2 border-primary/40 focus:ring-primary/50 focus:border-primary font-medium" data-testid="select-course-dropdown">
          <SelectValue placeholder="Sélectionne un cours..." />
        </SelectTrigger>
        <SelectContent>
          {course.map((c) => (
            <SelectItem 
              key={c.id} 
              value={c.id}
              className="py-3"
              data-testid={`select-course-item-${c.id}`}
            >
              {c.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function QCMOptions({
  question,
  onSelect,
}: {
  question: Question;
  onSelect: (answer: string) => void;
}) {
  const labels = propositionLabels(question.proposals);
  if (labels.length === 0) return null;

  return (
    <div className="py-4 animate-in fade-in slide-in-from-bottom-3 duration-300" data-testid="qcm-options-container">
      <div className="flex items-center justify-center gap-2 mb-4 text-xs text-muted-foreground">
        <Zap className="h-3.5 w-3.5 text-primary" />
        <span>Clique sur ta réponse</span>
      </div>
      <div className="grid grid-cols-2 gap-3 px-2">
        {labels.map((prop, i) => (
          <button
            key={i}
            onClick={() => onSelect(String.fromCharCode(65 + i))}
            className="group relative flex items-start gap-3 p-4 rounded-xl bg-[#EAF2FF] border border-[#D0E2FF] text-[#1E40AF] font-medium text-left transition-all duration-200 shadow-sm hover:bg-[#DCEAFF] hover:border-[#A5C8FF] active:scale-[0.98] min-h-[68px]"
            data-testid={`button-qcm-option-${i}`}
          >
            <span className="flex-shrink-0 w-7 h-7 rounded-md bg-white border border-[#D0E2FF] flex items-center justify-center text-sm font-bold mt-0.5">
              {String.fromCharCode(65 + i)}
            </span>
            <span className="text-sm leading-snug flex-1">{prop}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function ChatbotPreviewPanel({
  course,
  sessionName,
  fetchQuestions,
  refreshKey,
}: ChatbotPreviewPanelProps) {
  const chatbot = useChatbotPreview();
  const [inputValue, setInputValue] = useState("");
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [hasAskedCourse, setHasAskedCourse] = useState(false);
  const [lastAskedQuestionIndex, setLastAskedQuestionIndex] = useState(-1);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatbot.reset();
    setHasAskedCourse(false);
    setLastAskedQuestionIndex(-1);
    setInputValue("");
    if (course.length > 0) {
      chatbot.initializeWithCours(course, sessionName);
    }
  }, [refreshKey, sessionName]);

  useEffect(() => {
    if (chatbot.chatbotState === "greeting" && !hasAskedCourse) {
      const timer = setTimeout(() => {
        chatbot.proceedToCoursSelection();
        setHasAskedCourse(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [chatbot.chatbotState, hasAskedCourse]);

  useEffect(() => {
    if (
      chatbot.chatbotState === "asking_questions" && 
      chatbot.selectedCours && 
      chatbot.currentQuestionIndex < chatbot.questions.length &&
      chatbot.currentQuestionIndex !== lastAskedQuestionIndex
    ) {
      const timer = setTimeout(() => {
        const questionData = chatbot.askCurrentQuestion();
        if (questionData) {
          chatbot.addBotMessage(questionData.text, "question", { questionId: questionData.question.id });
          setLastAskedQuestionIndex(chatbot.currentQuestionIndex);
        }
      }, chatbot.currentQuestionIndex === 0 ? 1000 : 1500);
      return () => clearTimeout(timer);
    }
  }, [chatbot.chatbotState, chatbot.selectedCours, chatbot.currentQuestionIndex, chatbot.questions.length, lastAskedQuestionIndex]);

  useEffect(() => {
    if (chatbot.chatbotState === "completed" && chatbot.selectedCours && chatbot.questions.length > 0) {
      const timer = setTimeout(() => {
        const totalQuestions = chatbot.questions.length;
        const scoreRatio = totalQuestions > 0 ? chatbot.score / totalQuestions : 0;
        chatbot.addBotMessage(
          `Bravo ! Tu as terminé la révision de "${chatbot.selectedCours?.title}" !\n\nTon score : ${chatbot.score}/${totalQuestions} bonnes réponses.\n\nContinue comme ça !`,
          "completion",
          { scoreRatio }
        );
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [chatbot.chatbotState, chatbot.selectedCours, chatbot.score, chatbot.questions.length]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatbot.messages.length]);

  const handleCoursSelect = async (selectedCours: Course) => {
    setIsLoadingQuestions(true);
    const questions = await fetchQuestions(selectedCours.id);
    chatbot.selectCours(selectedCours, questions);
    setIsLoadingQuestions(false);
    setLastAskedQuestionIndex(-1);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    if (chatbot.chatbotState === "asking_questions") {
      chatbot.submitAnswer(inputValue.trim());
      setInputValue("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleReset = () => {
    chatbot.reset();
    setHasAskedCourse(false);
    setLastAskedQuestionIndex(-1);
    setInputValue("");
    if (course.length > 0) {
      chatbot.initializeWithCours(course, sessionName);
    }
  };

  const currentQuestion = chatbot.getCurrentQuestion();
  const showCourseSelection = 
    chatbot.messages.some((m:ChatMessage) => m.type === "course_selection") && 
    !chatbot.selectedCours &&
    course.length > 0;
  // Show QCM buttons when asking a question OR during retry mode for QCM
  const showQCMOptions =
    chatbot.chatbotState === "asking_questions" &&
    (currentQuestion?.type === "single" || currentQuestion?.type === "multiple") &&
    (chatbot.messages[chatbot.messages.length - 1]?.type === "question" || chatbot.retryMode);

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-background to-muted/20" data-testid="chatbot-preview-panel">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-primary/10 via-violet-500/5 to-transparent backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-violet-600 p-0.5 shadow-lg shadow-primary/20">
              <img src="/edesio-logo-square.png" alt="Edesio" className="w-full h-full rounded-[10px] object-cover bg-white dark:bg-background" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-background flex items-center justify-center">
              <Sparkles className="h-2.5 w-2.5 text-white" />
            </div>
          </div>
          <div>
            <h3 className="font-bold text-sm">Edesio</h3>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-xs text-muted-foreground">Prévisualisation</p>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleReset}
          className="rounded-xl hover:bg-primary/10"
          data-testid="button-reset-chatbot"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        data-testid="chatbot-messages"
      >
        {chatbot.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="relative mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-violet-500/20 flex items-center justify-center">
                <MessageCircle className="h-8 w-8 text-primary/50" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                <Sparkles className="h-3 w-3 text-primary" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Le chatbot démarre...</p>
            {course.length === 0 && (
              <p className="text-xs text-muted-foreground/70">Ajoutez des course pour tester</p>
            )}
          </div>
        ) : (
          <>
            {chatbot.messages.map((message: ChatMessage) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            
            {isLoadingQuestions && <TypingIndicator />}
          </>
        )}
      </div>

      {showCourseSelection && !isLoadingQuestions && (
        <div className="px-4 pb-4">
          <CourseSelectionDropdown course={course} onSelect={handleCoursSelect} />
        </div>
      )}

      {showQCMOptions && currentQuestion && (
        <div className="px-4 pb-4">
          <QCMOptions 
            question={currentQuestion} 
            onSelect={(answer) => {
              chatbot.submitAnswer(answer);
            }} 
          />
        </div>
      )}

      {chatbot.chatbotState === "asking_questions" && currentQuestion?.type === "open" && (
        <div className="px-4 pb-4 border-t pt-4 bg-muted/30">
          <div className="flex gap-2 items-center">
            <div className="flex-1 relative">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Tape ta réponse ici..."
                className="h-11 pr-12 rounded-xl bg-background/80 border-border/50 focus-visible:ring-primary/30"
                data-testid="input-chatbot-answer"
              />
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
              size="icon"
              className="h-11 w-11 rounded-xl bg-gradient-to-r from-primary to-violet-600 hover:opacity-90 shadow-lg shadow-primary/25"
              data-testid="button-send-answer"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {(chatbot.chatbotState === "completed" || chatbot.chatbotState === "idle") && chatbot.messages.length > 0 && (
        <div className="px-4 pb-4 pt-3 border-t bg-muted/30">
          <Button
            variant="outline"
            className="w-full h-11 rounded-xl border-primary/20 hover:bg-primary/5 hover:border-primary/30 !ring-0 !ring-offset-0 focus:outline-none"
            onClick={handleReset}
            data-testid="button-restart-chatbot"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Recommencer
          </Button>
        </div>
      )}
    </div>
  );
}
