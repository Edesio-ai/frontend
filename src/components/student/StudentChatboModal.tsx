import { useState, useEffect, useRef, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  User,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Sparkles,
  Trophy,
  X,
  Check,
  Zap,
  Star,
  ArrowRight,
} from "lucide-react";
import { Course, EvaluateAnswerRequest, GenerateCompletionFeedbackRequest, Question } from "@/types";
import { questionService } from "@/services/teaching/question.service";
import { llmService } from "@/services/llm.service";

interface StudentChatbotModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cours: Course;
  questions: Question[];
  studentName?: string;
  studentPhotoUrl?: string | null;
  onComplete?: (totalAnswered: number, correctAnswers: number) => void;
}

interface ChatMessage {
  id: string;
  sender: "bot" | "student";
  text: string;
  type?: "greeting" | "question" | "answer" | "feedback" | "completion" | "no_questions";
  isCorrect?: boolean;
  isPartial?: boolean;
  scoreRatio?: number;
}

interface ShuffledQuestion extends Question {
  shuffledPropositions?: string[];
  shuffleMap?: number[];
}

function generateId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const correctFeedbackMessages = [
  "Bravo ! C'est la bonne réponse !",
  "Excellent ! Tu as tout compris !",
  "Super ! Continue comme ça !",
  "Parfait ! Tu es sur la bonne voie !",
  "Génial ! Tu maîtrises bien le sujet !",
  "Bien joué ! C'est exact !",
  "Formidable ! Tu progresses !",
];

const incorrectFeedbackMessages = [
  "Pas tout à fait...",
  "Ce n'est pas ça...",
  "Hmm, pas exactement...",
  "Presque ! Mais ce n'est pas la bonne réponse.",
  "Pas cette fois...",
];

function getRandomMessage(messages: string[]): string {
  return messages[Math.floor(Math.random() * messages.length)];
}

function validateOpenAnswer(userAnswer: string, correctAnswer: string): boolean {
  const normalize = (str: string) => str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(w => w.length > 2);

  const userWords = normalize(userAnswer);
  const correctWords = normalize(correctAnswer);
  
  if (userWords.length === 0 || correctWords.length === 0) {
    return false;
  }

  const matchedWords = correctWords.filter(cw => 
    userWords.some(uw => uw === cw || uw.includes(cw) || cw.includes(uw))
  );
  
  const matchRatio = matchedWords.length / correctWords.length;
  return matchRatio >= 0.5;
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

function MessageBubble({ 
  message, 
  studentName,
  studentPhotoUrl 
}: { 
  message: ChatMessage;
  studentName?: string;
  studentPhotoUrl?: string | null;
}) {
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
        ) : studentPhotoUrl ? (
          <AvatarImage src={studentPhotoUrl} alt={studentName || "Élève"} className="object-cover" />
        ) : null}
        <AvatarFallback className={isBot ? "bg-primary/10 text-primary text-sm font-semibold" : "bg-gradient-to-br from-emerald-500 to-green-600 text-white font-bold text-sm"}>
          {isBot ? "IA" : studentName ? studentName.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
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

function QCMOptions({
  propositions,
  onSelect,
  disabled,
}: {
  propositions: string[];
  onSelect: (index: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="py-4 animate-in fade-in slide-in-from-bottom-3 duration-300" data-testid="qcm-options-container">
      <div className="flex items-center justify-center gap-2 mb-4 text-xs text-muted-foreground">
        <Zap className="h-3.5 w-3.5 text-primary" />
        <span>Clique sur ta réponse</span>
      </div>
      <div className="grid grid-cols-2 gap-3 px-2">
        {propositions.map((prop, i) => (
          <button
            key={i}
            onClick={() => onSelect(i)}
            disabled={disabled}
            className={`group relative flex items-start gap-3 p-4 rounded-xl bg-[#EAF2FF] border border-[#D0E2FF] text-[#1E40AF] font-medium text-left transition-all duration-200 shadow-sm ${!disabled ? 'hover:bg-[#DCEAFF] hover:border-[#A5C8FF] active:scale-[0.98]' : 'opacity-60'} min-h-[68px]`}
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

function MultiOptions({
  propositions,
  selectedIndices,
  onToggle,
  onValidate,
  disabled,
}: {
  propositions: string[];
  selectedIndices: number[];
  onToggle: (index: number) => void;
  onValidate: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="py-4 space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-300" data-testid="multi-options-container">
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Star className="h-3.5 w-3.5 text-primary" />
        <span>Sélectionne toutes les bonnes réponses</span>
      </div>
      <div className="grid grid-cols-2 gap-3 px-2">
        {propositions.map((prop, i) => {
          const isSelected = selectedIndices.includes(i);
          return (
            <button
              key={i}
              onClick={() => onToggle(i)}
              disabled={disabled}
              className={`group flex items-start gap-3 p-4 rounded-xl font-medium text-sm transition-all duration-200 min-h-[68px] ${
                isSelected 
                  ? 'bg-[#3B82F6] border-2 border-[#2563EB] text-white shadow-md' 
                  : 'bg-[#EAF2FF] border border-[#D0E2FF] text-[#1E40AF] shadow-sm'
              } ${!disabled ? (isSelected ? 'hover:bg-[#2563EB]' : 'hover:bg-[#DCEAFF] hover:border-[#A5C8FF]') + ' active:scale-[0.98]' : 'opacity-60'}`}
              data-testid={`button-multi-option-${i}`}
            >
              <span className={`flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-sm font-bold mt-0.5 ${
                isSelected ? 'bg-white/20 border border-white/30' : 'bg-white border border-[#D0E2FF]'
              }`}>
                {String.fromCharCode(65 + i)}
              </span>
              <span className="flex-1 text-left leading-snug">{prop}</span>
              {isSelected && <Check className="h-5 w-5 flex-shrink-0 mt-0.5" />}
            </button>
          );
        })}
      </div>
      <div className="flex justify-center pt-2">
        <Button
          onClick={onValidate}
          disabled={selectedIndices.length === 0 || disabled}
          className="px-8 h-11 rounded-xl"
          data-testid="button-validate-multi"
        >
          <Check className="h-4 w-4 mr-2" />
          Valider ({selectedIndices.length} sélectionnée{selectedIndices.length > 1 ? 's' : ''})
        </Button>
      </div>
    </div>
  );
}

export function StudentChatbotModal({
  open,
  onOpenChange,
  cours,
  questions,
  studentName,
  studentPhotoUrl,
  onComplete,
}: StudentChatbotModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [chatState, setChatState] = useState<"idle" | "greeting" | "asking" | "completed">("idle");
  const [selectedMultiIndices, setSelectedMultiIndices] = useState<number[]>([]);
  const [waitingForAcknowledge, setWaitingForAcknowledge] = useState(false);
  const [lastAnswerResult, setLastAnswerResult] = useState<"correct" | "partial" | "wrong" | null>(null);
  const [showTyping, setShowTyping] = useState(false);
  const [isRetryAttempt, setIsRetryAttempt] = useState(false);
  const [waitingForRetry, setWaitingForRetry] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatStateRef = useRef(chatState);
  chatStateRef.current = chatState;
  const studentNameRef = useRef(studentName);
  studentNameRef.current = studentName;
  const coursTitleRef = useRef(cours.title);
  coursTitleRef.current = cours.title;
  const [conversationNonce, setConversationNonce] = useState(0);
  const askQuestionRef = useRef<(index: number) => void>(() => {});

  const shuffledQuestions = useMemo(() => {
    if (questions.length === 0) return [];
    
    const shuffled = shuffleArray<Question>(questions);
    
    return shuffled.map(q => {
      if ((q.type === "single" || q.type === "multiple") && q.proposals && q.proposals.length > 0) {
        const indices = q.proposals.map((_, i) => i);
        const shuffledIndices = shuffleArray(indices);
        const shuffledPropositions = shuffledIndices.map(i => q.proposals[i]);
        
        return {
          ...q,
          shuffledPropositions,
          shuffleMap: shuffledIndices,
        } as ShuffledQuestion;
      }
      return q as ShuffledQuestion;
    });
  }, [questions]);

  const addMessage = (message: Omit<ChatMessage, "id">) => {
    setMessages((prev) => [...prev, { ...message, id: generateId() }]);
  };

  const showCompletion = async (finalScore: number, finalTotal: number) => {
    const ratio = finalTotal > 0 ? finalScore / finalTotal : 0;
    const scoreDisplay = finalScore % 1 === 0 ? finalScore : finalScore.toFixed(1);
    
    try {
      const body: GenerateCompletionFeedbackRequest = {
        courseTitle: cours.title,
        score: finalScore,
        total: finalTotal,
        studentName: studentName || undefined,
      }
      const data = await llmService.generateCompletionFeedback(body);
      const aiFeedback = data.feedback || "Bravo pour avoir terminé cette révision !";
      
      addMessage({
        sender: "bot",
        text: `Tu as terminé la révision de "${cours.title}" !\n\nTon score : ${scoreDisplay}/${finalTotal} points.\n\n${aiFeedback}`,
        type: "completion",
        scoreRatio: ratio,
      });
    } catch (error) {
      console.error("Error fetching completion feedback:", error);
      addMessage({
        sender: "bot",
        text: `Tu as terminé la révision de "${cours.title}" !\n\nTon score : ${scoreDisplay}/${finalTotal} points.\n\nBravo pour avoir terminé cette session de révision !`,
        type: "completion",
        scoreRatio: ratio,
      });
    }
    
    setChatState("completed");
    if (onComplete) {
      console.log("Calling onComplete with:", { finalTotal, finalScore });
      onComplete(finalTotal, finalScore);
    } else {
      console.warn("onComplete callback is not defined!");
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  const askQuestion = (index: number) => {
    if (index >= shuffledQuestions.length) {
      setChatState("completed");
      return;
    }

    const question = shuffledQuestions[index];
    
    let questionText = `Question ${index + 1}/${shuffledQuestions.length}\n\n${question.questionText}`;

    if (question.type === "multiple") {
      questionText += "\n\n(Plusieurs réponses possibles)";
    }

    addMessage({
      sender: "bot",
      text: questionText,
      type: "question",
    });
    setSelectedMultiIndices([]);
    setChatState("asking");
  };

  askQuestionRef.current = askQuestion;

  useEffect(() => {
    if (!open || chatStateRef.current !== "idle") {
      return;
    }

    let cancelled = false;
    let t1: ReturnType<typeof setTimeout> | undefined;
    let t2: ReturnType<typeof setTimeout> | undefined;
    let t3: ReturnType<typeof setTimeout> | undefined;

    const name = studentNameRef.current;
    const title = coursTitleRef.current;

    if (shuffledQuestions.length > 0) {
      setMessages([]);
      setCurrentQuestionIndex(0);
      setScore(0);
      setTotalAnswered(0);
      setInputValue("");
      setSelectedMultiIndices([]);

      t1 = setTimeout(() => {
        if (cancelled) return;
        setChatState("greeting");
        addMessage({
          sender: "bot",
          text: `Bonjour${name ? ` ${name}` : ""} ! Je suis Edesio, je vais t'aider à réviser "${title}".`,
          type: "greeting",
        });

        if (cancelled) return;

        t2 = setTimeout(() => {
          if (cancelled) return;
          addMessage({
            sender: "bot",
            text: `J'ai ${shuffledQuestions.length} questions pour toi. Prêt(e) à réviser ?`,
            type: "greeting",
          });
          if (cancelled) return;
          t3 = setTimeout(() => {
            if (cancelled) return;
            askQuestionRef.current(0);
          }, 1000);
        }, 1500);
      }, 500);
    } else {
      setMessages([]);
      t1 = setTimeout(() => {
        if (cancelled) return;
        setChatState("greeting");
        addMessage({
          sender: "bot",
          text: `Bonjour${name ? ` ${name}` : ""} ! Je suis Edesio. Malheureusement, il n'y a pas encore de questions pour "${title}".`,
          type: "greeting",
        });
        if (cancelled) return;
        t2 = setTimeout(() => {
          if (cancelled) return;
          addMessage({
            sender: "bot",
            text: "Demande à ton professeur de générer des questions pour ce cours !",
            type: "no_questions",
          });
          setChatState("completed");
        }, 1500);
      }, 500);
    }

    return () => {
      cancelled = true;
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [open, cours.id, shuffledQuestions.length, conversationNonce]);

  const handleQCMAnswer = (selectedIndex: number) => {
    if (isProcessing || waitingForAcknowledge) return;
    if (chatState !== "asking" && !waitingForRetry) return;

    const question = shuffledQuestions[currentQuestionIndex];
    if (!question) return;
    
    setWaitingForRetry(false);

    setIsProcessing(true);
    const propositions = question.shuffledPropositions || question.proposals;
    const selectedOption = propositions?.[selectedIndex] || "";
    
    addMessage({
      sender: "student",
      text: `${String.fromCharCode(65 + selectedIndex)}. ${selectedOption}`,
      type: "answer",
    });

        const isCorrect = selectedOption === question.correctAnswers?.[0];
    processAnswer(isCorrect, question.correctAnswers?.[0] || "", question.explanation || "");
  };

  const handleMultiAnswer = () => {
    if (isProcessing || waitingForAcknowledge || selectedMultiIndices.length === 0) return;
    if (chatState !== "asking" && !waitingForRetry) return;

    const question = shuffledQuestions[currentQuestionIndex];
    if (!question) return;
    
    setWaitingForRetry(false);

    setIsProcessing(true);
    const propositions = question.shuffledPropositions || question.proposals;
    const selectedOptions = selectedMultiIndices
      .sort((a, b) => a - b)
      .map(i => propositions?.[i] || "");
    
    const answerText = selectedMultiIndices
      .sort((a, b) => a - b)
      .map(i => `${String.fromCharCode(65 + i)}. ${propositions?.[i]}`)
      .join(", ");
    
    addMessage({
      sender: "student",
      text: answerText,
      type: "answer",
    });

    const correctAnswers = question.correctAnswers || [];
    const isCorrect = 
      selectedOptions.length === correctAnswers.length &&
      selectedOptions.every(opt => correctAnswers.includes(opt)) &&
      correctAnswers.every(ans => selectedOptions.includes(ans));

    const correctDisplay = correctAnswers.join(", ");
    processAnswer(isCorrect, correctDisplay, question.explanation || "");
  };

  const handleOpenAnswer = async (answer: string) => {
    if (isProcessing || waitingForAcknowledge) return;
    if (chatState !== "asking" && !waitingForRetry) return;

    const question = shuffledQuestions[currentQuestionIndex];
    if (!question) return;

    setIsProcessing(true);
    setShowTyping(true);
    
    addMessage({
      sender: "student",
      text: answer,
      type: "answer",
    });

    try {
      const body: EvaluateAnswerRequest = {
        questionText: question.questionText,
        correctAnswer: question.correctAnswers?.[0] || "",
        answer: answer,
        explanation: question.explanation || "",
      }

      const evaluation = await llmService.evaluateAnswer(body);

      processOpenAnswer(evaluation.score, evaluation.feedback, question.correctAnswers?.[0] || "", evaluation.missingElements);
    } catch (error) {
      console.error("Error evaluating answer:", error);
      setShowTyping(false);
      const isCorrect = validateOpenAnswer(answer, question.correctAnswers?.[0] || "");
      processAnswer(isCorrect, question.correctAnswers?.[0] || "", question.explanation || "");
    }
  };

  const processOpenAnswer = (
    scorePoints: number, 
    feedback: string, 
    correctAnswer: string,
    missingElements?: string[]
  ) => {
    setShowTyping(false);
    setWaitingForRetry(false);

    const isFullyCorrect = scorePoints >= 0.7;

    const shouldCountQuestion = isFullyCorrect || isRetryAttempt;
    
    if (shouldCountQuestion) {
      setScore((prev) => prev + scorePoints);
      setTotalAnswered((prev) => prev + 1);
    }

    setTimeout(() => {
      if (isFullyCorrect) {
        const successMessage = isRetryAttempt 
          ? "Bravo ! C'est la bonne réponse ! Continue comme ça."
          : feedback;
        
        addMessage({
          sender: "bot",
          text: successMessage,
          type: "feedback",
          isCorrect: true,
        });

        setIsRetryAttempt(false);
        setLastAnswerResult("correct");
        setWaitingForAcknowledge(true);
        setIsProcessing(false);
      } else {
        if (!isRetryAttempt) {
          addMessage({
            sender: "bot",
            text: `${feedback}\n\nRéponse attendue : ${correctAnswer}\n\nQu'est-ce qui te semble être l'élément clé de cette réponse ?`,
            type: "feedback",
            isCorrect: false,
          });
          setIsRetryAttempt(true);
          setWaitingForRetry(true);
          setIsProcessing(false);
        } else {
          addMessage({
            sender: "bot",
            text: `${feedback}\n\nPas de souci, tu pourras revoir cette notion plus tard. Passons à la suite !`,
            type: "feedback",
            isCorrect: false,
          });
          setIsRetryAttempt(false);
          setLastAnswerResult("wrong");
          setWaitingForAcknowledge(true);
          setIsProcessing(false);
        }
      }
    }, 500);
  };

  const processAnswer = (isCorrect: boolean, correctAnswer: string, explication?: string | null) => {
    // Only count the question when we're done with it (not on first failed attempt for QCM)
    const shouldCountQuestion = isCorrect || isRetryAttempt;
    
    if (shouldCountQuestion) {
      setScore((prev) => prev + (isCorrect ? 1 : 0));
      setTotalAnswered((prev) => prev + 1);
    }

    setTimeout(() => {
      if (isCorrect) {
        const successMessage = isRetryAttempt 
          ? `Bravo ! C'est bien ça !${explication ? `\n\n${explication}` : ""}`
          : `${getRandomMessage(correctFeedbackMessages)}${explication ? `\n\n${explication}` : ""}`;
        
        addMessage({
          sender: "bot",
          text: successMessage,
          type: "feedback",
          isCorrect: true,
        });
        setIsRetryAttempt(false);
        setLastAnswerResult("correct");
        setWaitingForAcknowledge(true);
        setIsProcessing(false);
      } else if (!isRetryAttempt) {
        // First attempt failed - give them a chance to retry
        addMessage({
          sender: "bot",
          text: `${getRandomMessage(incorrectFeedbackMessages)} La bonne réponse est : ${correctAnswer}\n\nQu'est-ce qui te semble être l'élément clé de cette réponse ?`,
          type: "feedback",
          isCorrect: false,
        });
        setIsRetryAttempt(true);
        setWaitingForRetry(true);
        setIsProcessing(false);
      } else {
        // Second attempt also failed - move on
        addMessage({
          sender: "bot",
          text: `La bonne réponse était : ${correctAnswer}. Pas de souci, passons à la suite !${explication ? `\n\n${explication}` : ""}`,
          type: "feedback",
          isCorrect: false,
        });
        setIsRetryAttempt(false);
        setLastAnswerResult("wrong");
        setWaitingForAcknowledge(true);
        setIsProcessing(false);
      }
    }, 500);
  };

  const handleAcknowledge = async () => {
    setWaitingForAcknowledge(false);
    setLastAnswerResult(null);
    const nextIndex = currentQuestionIndex + 1;
    setCurrentQuestionIndex(nextIndex);

    if (nextIndex >= shuffledQuestions.length) {
      await showCompletion(score, shuffledQuestions.length);
    } else {
      askQuestion(nextIndex);
    }
  };

  const handleSendMessage = () => {
    if (!inputValue.trim() || isProcessing) return;
    handleOpenAnswer(inputValue.trim());
    setInputValue("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    const handleGlobalKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Enter" && waitingForAcknowledge) {
        e.preventDefault();
        handleAcknowledge();
      }
    };
    
    if (waitingForAcknowledge) {
      window.addEventListener("keydown", handleGlobalKeyPress);
      return () => window.removeEventListener("keydown", handleGlobalKeyPress);
    }
  }, [waitingForAcknowledge]);

  const handleReset = () => {
    setMessages([]);
    setCurrentQuestionIndex(0);
    setScore(0);
    setTotalAnswered(0);
    setInputValue("");
    setIsProcessing(false);
    setSelectedMultiIndices([]);
    setWaitingForAcknowledge(false);
    setLastAnswerResult(null);
    setShowTyping(false);
    setIsRetryAttempt(false);
    setWaitingForRetry(false);
    setChatState("idle");
    setConversationNonce((n) => n + 1);
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      handleReset();
    }
    onOpenChange(isOpen);
  };

  const toggleMultiOption = (index: number) => {
    setSelectedMultiIndices(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const currentQuestion = shuffledQuestions[currentQuestionIndex];
  const currentPropositions = currentQuestion?.shuffledPropositions || currentQuestion?.proposals;
  
  const showQCMOptions =
    (chatState === "asking" || waitingForRetry) &&
    currentQuestion?.type === "single" &&
    !isProcessing &&
    !waitingForAcknowledge;
  
  const showMultiOptions =
    (chatState === "asking" || waitingForRetry) &&
    currentQuestion?.type === "multiple" &&
    !isProcessing &&
    !waitingForAcknowledge;
  
  const showTextInput =
    (chatState === "asking" || waitingForRetry) &&
    currentQuestion?.type === "open" &&
    !isProcessing &&
    !waitingForAcknowledge;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="!fixed !inset-0 !left-0 !top-0 !translate-x-0 !translate-y-0 !max-w-none !w-screen !h-[100dvh] !rounded-none !border-0 flex flex-col p-0 overflow-hidden [&>button]:hidden sm:!inset-auto sm:!left-1/2 sm:!top-1/2 sm:!-translate-x-1/2 sm:!-translate-y-1/2 sm:!max-w-2xl sm:!w-[95vw] sm:!h-[85vh] sm:!rounded-2xl sm:!border"
        data-testid="modal-student-chatbot"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="flex-shrink-0 px-4 py-3 border-b bg-gradient-to-r from-primary/10 via-violet-500/5 to-transparent backdrop-blur-sm" style={{ paddingTop: 'max(12px, env(safe-area-inset-top))' }}>
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-violet-600 p-0.5 shadow-lg shadow-primary/25">
                <img 
                  src="/edesio-logo-square.png" 
                  alt="Edesio" 
                  className="w-full h-full rounded-[10px] object-cover bg-white dark:bg-background" 
                />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-background flex items-center justify-center shadow-sm">
                <Sparkles className="h-2.5 w-2.5 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-base font-bold leading-tight">Edesio</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground truncate flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {cours.title}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {shuffledQuestions.length > 0 && (chatState === "asking" || waitingForAcknowledge || waitingForRetry) && (
                <Badge className="text-xs px-2.5 py-1 font-semibold mr-1 bg-emerald-500 hover:bg-emerald-600 text-white border-0">
                  {currentQuestionIndex + 1}/{shuffledQuestions.length}
                </Badge>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleReset}
                className="rounded-xl hover:bg-primary/10"
                data-testid="button-reset-student-chatbot"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleClose(false)}
                className="rounded-xl hover:bg-destructive/10 hover:text-destructive"
                data-testid="button-close-student-chatbot"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-background to-muted/20"
          data-testid="student-chatbot-messages"
          style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}
        >
          {messages.map((message) => (
            <MessageBubble 
              key={message.id} 
              message={message} 
              studentName={studentName}
              studentPhotoUrl={studentPhotoUrl}
            />
          ))}
          {(isProcessing || showTyping) && <TypingIndicator />}
        </div>

        {showQCMOptions && currentPropositions && (
          <div className="flex-shrink-0 px-2 border-t bg-muted/30 backdrop-blur-sm">
            <QCMOptions
              propositions={currentPropositions}
              onSelect={handleQCMAnswer}
              disabled={isProcessing}
            />
          </div>
        )}

        {showMultiOptions && currentPropositions && (
          <div className="flex-shrink-0 px-2 border-t bg-muted/30 backdrop-blur-sm">
            <MultiOptions
              propositions={currentPropositions}
              selectedIndices={selectedMultiIndices}
              onToggle={toggleMultiOption}
              onValidate={handleMultiAnswer}
              disabled={isProcessing}
            />
          </div>
        )}

        {waitingForAcknowledge && (
          <div 
            className={`flex-shrink-0 px-4 py-4 border-t backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2 duration-300 ${
              lastAnswerResult === "correct" 
                ? "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20" 
                : lastAnswerResult === "partial"
                ? "bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20"
                : "bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20"
            }`} 
            style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}
          >
            <div className="flex justify-center">
              <Button
                onClick={handleAcknowledge}
                className={`w-full max-w-xs h-12 rounded-xl font-semibold shadow-md !ring-0 !ring-offset-0 focus:outline-none ${
                  currentQuestionIndex + 1 >= shuffledQuestions.length
                    ? "bg-gradient-to-r from-primary to-violet-600 hover:opacity-90 text-white border border-violet-700"
                    : lastAnswerResult === "correct"
                    ? "bg-[#16A34A] hover:bg-[#15803D] text-white border border-[#15803D]"
                    : lastAnswerResult === "partial"
                    ? "bg-[#F59E0B] hover:bg-[#D97706] text-white border border-[#D97706]"
                    : "bg-[#3B82F6] hover:bg-[#2563EB] text-white border border-[#2563EB]"
                }`}
                data-testid="button-acknowledge"
              >
                {currentQuestionIndex + 1 >= shuffledQuestions.length ? (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Voir mes résultats
                  </>
                ) : (
                  <>
                    <ArrowRight className="h-5 w-5 mr-2" />
                    Question suivante
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {showTextInput && (
          <div className="flex-shrink-0 px-4 py-4 border-t bg-muted/30 backdrop-blur-sm" style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
            <div className="flex gap-3 items-end">
              <div className="flex-1 relative">
                <Textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Tape ta réponse ici..."
                  className="min-h-[48px] max-h-[120px] py-3 px-4 rounded-xl bg-background/80 border-border/50 focus-visible:ring-primary/30 text-base resize-none overflow-y-auto"
                  data-testid="input-student-answer"
                  disabled={isProcessing}
                  rows={1}
                  style={{ height: 'auto' }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = Math.min(target.scrollHeight, 120) + 'px';
                  }}
                />
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isProcessing}
                size="icon"
                className="h-12 w-12 rounded-xl bg-gradient-to-r from-primary to-violet-600 hover:opacity-90 shadow-lg shadow-primary/25 flex-shrink-0"
                data-testid="button-send-student-answer"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center hidden sm:block">Appuie sur Entrée pour envoyer</p>
          </div>
        )}

        {chatState === "completed" && messages.length > 0 && (
          <div className="flex-shrink-0 px-4 py-4 border-t bg-muted/30 backdrop-blur-sm" style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 h-12 rounded-xl border-primary/20 hover:bg-primary/5 hover:border-primary/30 !ring-0 !ring-offset-0 focus:outline-none"
                onClick={handleReset}
                data-testid="button-restart-session"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Recommencer
              </Button>
              <Button
                className="flex-1 h-12 rounded-xl bg-gradient-to-r from-primary to-violet-600 hover:opacity-90 shadow-lg shadow-primary/25 !ring-0 !ring-offset-0 focus:outline-none border border-violet-700"
                onClick={() => handleClose(false)}
                data-testid="button-finish-session"
              >
                <Check className="h-4 w-4 mr-2" />
                Terminer
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
