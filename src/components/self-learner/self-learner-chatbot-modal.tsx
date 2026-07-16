"use client";

import { useState, useEffect, useRef } from "react";
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
import type { EvaluateAnswerRequest, GenerateCompletionFeedbackRequest, SelfLearnerCourse, SelfLearnerQuestion } from "@/types";
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
  Loader2,
} from "lucide-react";
import { selfLearnerQuestionService } from "@/services/teaching/self-learner-question.service";
import { llmService } from "@/services/llm.service";
import { useAuth } from "@/hooks/use-auth";
import { useTranslations } from "@/lib/i18n/client";

interface SelfLearnerChatbotModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cours: SelfLearnerCourse;
  generateQuestions?: (coursId: string) => Promise<{ success: boolean; error?: string }>;
}

interface ChatMessage {
  id: string;
  sender: "bot" | "user";
  text: string;
  type?: "greeting" | "question" | "answer" | "feedback" | "completion" | "no_questions";
  isCorrect?: boolean;
  isPartial?: boolean;
  scoreRatio?: number;
}

interface ShuffledQuestion extends SelfLearnerQuestion {
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
      <Avatar className="h-10 w-10 flex-shrink-0 ring-2 ring-amber-500/20 shadow-md">
        <AvatarImage src="/edesio-logo-square.png" alt="Edesio" className="object-cover" />
        <AvatarFallback className="bg-amber-500/10 text-amber-500">IA</AvatarFallback>
      </Avatar>
      <div className="bg-card border border-border rounded-2xl rounded-tl-md px-5 py-4 shadow-sm">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 bg-amber-500/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2.5 h-2.5 bg-amber-500/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2.5 h-2.5 bg-amber-500/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message, t }: { message: ChatMessage; t: ReturnType<typeof useTranslations> }) {
  const isBot = message.sender === "bot";

  return (
    <div
      className={`flex gap-3 ${isBot ? "" : "flex-row-reverse"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
      data-testid={`message-${message.id}`}
    >
      <Avatar
        className={`h-10 w-10 flex-shrink-0 shadow-md ${
          isBot 
            ? "ring-2 ring-amber-500/20" 
            : "ring-2 ring-amber-500/30"
        }`}
      >
        {isBot ? (
          <AvatarImage src="/edesio-logo-square.png" alt="Edesio" className="object-cover" />
        ) : null}
        <AvatarFallback className={isBot ? "bg-amber-500/10 text-amber-500 text-sm font-semibold" : "bg-gradient-to-br from-amber-500 to-amber-600 text-white font-bold text-sm"}>
          {isBot ? "IA" : <User className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>
      <div
        className={`max-w-[85%] shadow-sm ${
          isBot 
            ? "bg-card border border-border text-foreground rounded-2xl rounded-tl-md" 
            : "bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-2xl rounded-tr-md"
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
            }`}>{t.chatbot.sessionEnded}</span>
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
                <span className="text-sm font-semibold">{t.chatbot.goodAnswer}</span>
              </div>
            ) : message.isPartial ? (
              <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                <div className="p-1 rounded-full bg-orange-500/20">
                  <Star className="h-4 w-4" />
                </div>
                <span className="text-sm font-semibold">{t.chatbot.partialAnswer}</span>
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
        <Zap className="h-3.5 w-3.5 text-amber-500" />
        <span>Clique sur ta réponse</span>
      </div>
      <div className="grid grid-cols-2 gap-3 px-2">
        {propositions.map((prop, i) => (
          <button
            key={i}
            onClick={() => onSelect(i)}
            disabled={disabled}
            className={`group relative flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 text-amber-800 dark:text-amber-200 font-medium text-left transition-all duration-200 shadow-sm ${!disabled ? 'hover:bg-amber-100 dark:hover:bg-amber-900/40 hover:border-amber-300 dark:hover:border-amber-600 active:scale-[0.98]' : 'opacity-60'} min-h-[68px]`}
            data-testid={`button-qcm-option-${i}`}
          >
            <span className="flex-shrink-0 w-7 h-7 rounded-md bg-white dark:bg-amber-800/50 border border-amber-200 dark:border-amber-700 flex items-center justify-center text-sm font-bold mt-0.5">
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
        <Star className="h-3.5 w-3.5 text-amber-500" />
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
                  ? 'bg-amber-500 border-2 border-amber-600 text-white shadow-md' 
                  : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 text-amber-800 dark:text-amber-200 shadow-sm'
              } ${!disabled ? (isSelected ? 'hover:bg-amber-600' : 'hover:bg-amber-100 dark:hover:bg-amber-900/40 hover:border-amber-300 dark:hover:border-amber-600') + ' active:scale-[0.98]' : 'opacity-60'}`}
              data-testid={`button-multi-option-${i}`}
            >
              <span className={`flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-sm font-bold mt-0.5 ${
                isSelected ? 'bg-white/20 border border-white/30' : 'bg-white dark:bg-amber-800/50 border border-amber-200 dark:border-amber-700'
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
          className="px-8 h-11 rounded-xl bg-amber-500 hover:bg-amber-600"
          data-testid="button-validate-multi"
        >
          <Check className="h-4 w-4 mr-2" />
          Valider ({selectedIndices.length} sélectionnée{selectedIndices.length > 1 ? 's' : ''})
        </Button>
      </div>
    </div>
  );
}

export function SelfLearnerChatbotModal({ open, onOpenChange, cours, generateQuestions }: SelfLearnerChatbotModalProps) {
  const t = useTranslations();
  const correctFeedbackMessages: string[] = t.chatbot.correctAnswers;
  const incorrectFeedbackMessages: string[] = t.chatbot.encouragementsAfterWrong;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [chatState, setChatState] = useState<"idle" | "loading" | "greeting" | "asking" | "completed">("idle");
  const [selectedMultiIndices, setSelectedMultiIndices] = useState<number[]>([]);
  const [waitingForAcknowledge, setWaitingForAcknowledge] = useState(false);
  const [lastAnswerResult, setLastAnswerResult] = useState<"correct" | "partial" | "wrong" | null>(null);
  const [showTyping, setShowTyping] = useState(false);
  const [isRetryAttempt, setIsRetryAttempt] = useState(false);
  const [waitingForRetry, setWaitingForRetry] = useState(false);
  const [shuffledQuestions, setShuffledQuestions] = useState<ShuffledQuestion[]>([]);
  const [isGeneratingNew, setIsGeneratingNew] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const loadStartedRef = useRef(false);
  const { user } = useAuth();

  const addMessage = (message: Omit<ChatMessage, "id">) => {
    setMessages((prev) => [...prev, { ...message, id: generateId() }]);
  };

  const loadAndStartQuiz = async () => {
    setChatState("loading");
    setMessages([]);
    setCurrentQuestionIndex(0);
    setScore(0);
    setTotalAnswered(0);
    setSelectedMultiIndices([]);
    setWaitingForAcknowledge(false);
    setLastAnswerResult(null);
    setIsRetryAttempt(false);
    setWaitingForRetry(false);

    const questions = await selfLearnerQuestionService.getSelfLearnerQuestions(cours.id);

    if (questions.length === 0) {
      setChatState("greeting");
      setTimeout(() => {
        addMessage({
          sender: "bot",
          text: getRandomMessage(t.chatbot.greetings),
          type: "greeting",
        });
        setTimeout(() => {
          addMessage({
            sender: "bot",
            text: t.selfLearner.chatbot.noQuestionsYet,
            type: "no_questions",
          });
          setChatState("completed");
        }, 1500);
      }, 500);
      return;
    }

    const shuffled = shuffleArray(questions);
    const processedQuestions = shuffled.map(q => {
      if ((q.type === "single" || q.type === "multiple") && q.proposals && q.proposals.length > 0) {
        const indices: number[] = q.proposals.map((_: string, i: number) => i);
        const shuffledIndices = shuffleArray<number>(indices);
        const shuffledPropositions = shuffledIndices.map((i) => q.proposals![i]);
        return {
          ...q,
          shuffledPropositions,
          shuffleMap: shuffledIndices,
        } as ShuffledQuestion;
      }
      return q as ShuffledQuestion;
    });

    setShuffledQuestions(processedQuestions);
    setChatState("greeting");

    setTimeout(() => {
      addMessage({
        sender: "bot",
        text: getRandomMessage(t.chatbot.greetings),
        type: "greeting",
      });

      setTimeout(() => {
        addMessage({
          sender: "bot",
          text: getRandomMessage(t.chatbot.startQuiz).replace('{count}', String(processedQuestions.length)),
          type: "greeting",
        });
        setTimeout(() => {
          askQuestion(0, processedQuestions);
        }, 1000);
      }, 1500);
    }, 500);
  };

  const askQuestion = (index: number, questions: ShuffledQuestion[]) => {
    if (index >= questions.length) {
      setChatState("completed");
      return;
    }

    const question = questions[index];
    let questionText = `Question ${index + 1}/${questions.length}\n\n${question.questionText}`;

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

  const showCompletion = async (finalScore: number, finalTotal: number) => {
    const ratio = finalTotal > 0 ? finalScore / finalTotal : 0;
    const scoreDisplay = finalScore % 1 === 0 ? finalScore : finalScore.toFixed(1);
    
    try {
      const body: GenerateCompletionFeedbackRequest = {
        courseTitle: cours.title,
        score: finalScore,
        total: finalTotal,
        studentName: user?.metadata.firstname || 'Élève',
      };
      const feedback = await llmService.generateCompletionFeedback(body);
      const aiFeedback = feedback.feedback || "Bravo pour avoir terminé cette révision !";
      
      const scoreText = t.chatbot.completionScore
        .replace('{score}', String(scoreDisplay))
        .replace('{total}', String(finalTotal))
        .replace('{percent}', String(Math.round(ratio * 100)));
      addMessage({
        sender: "bot",
        text: `${t.chatbot.completionTitle}\n\n${scoreText}\n\n${aiFeedback}`,
        type: "completion",
        scoreRatio: ratio,
      });
    } catch (error) {
      console.error("Error fetching completion feedback:", error);
      const scoreText = t.chatbot.completionScore
        .replace('{score}', String(scoreDisplay))
        .replace('{total}', String(finalTotal))
        .replace('{percent}', String(Math.round(ratio * 100)));
      addMessage({
        sender: "bot",
        text: `${t.chatbot.completionTitle}\n\n${scoreText}`,
        type: "completion",
        scoreRatio: ratio,
      });
    }
    
    setChatState("completed");
  };

  useEffect(() => {
    if (!open) {
      loadStartedRef.current = false;
      return;
    }
    if (chatState === "idle" && !loadStartedRef.current) {
      loadStartedRef.current = true;
      loadAndStartQuiz();
    }
  }, [open, cours.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  const handleClose = (newOpen: boolean) => {
    if (!newOpen) {
      loadStartedRef.current = false;
      setChatState("idle");
      setMessages([]);
      setShuffledQuestions([]);
    }
    onOpenChange(newOpen);
  };

  const handleReset = async () => {
    setChatState("loading");
    setMessages([]);
    setShuffledQuestions([]);
    setIsGeneratingNew(true);

    if (generateQuestions) {
      await generateQuestions(cours.id);
    }

    setIsGeneratingNew(false);
    setChatState("idle");
    setTimeout(() => loadAndStartQuiz(), 100);
  };

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
      sender: "user",
      text: `${String.fromCharCode(65 + selectedIndex)}. ${selectedOption}`,
      type: "answer",
    });

    const isCorrect = selectedOption === question.correctAnswers?.[0];
    processAnswer(isCorrect, question.correctAnswers?.[0] || "", question.explanation);
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
      sender: "user",
      text: answerText,
      type: "answer",
    });

    const correctAnswers = question.correctAnswers || [];
    const isCorrect = 
      selectedOptions.length === correctAnswers.length &&
      selectedOptions.every(opt => correctAnswers.includes(opt)) &&
      correctAnswers.every(ans => selectedOptions.includes(ans));

    const correctDisplay = correctAnswers.join(", ");
    processAnswer(isCorrect, correctDisplay, question.explanation);
  };

  const extractStudentQuestion = (input: string): string | null => {
    const sentences = input.split(/(?<=[.!])\s+/);
    const questionSentence = sentences.find(s => s.trim().endsWith("?") && s.trim().length > 8);
    if (questionSentence) return questionSentence.trim();
    if (input.trim().endsWith("?") && input.trim().length > 8) return input.trim();
    return null;
  };

  const answerStudentQuestion = async (studentQuestion: string, contextQuestion: { question: string; bonne_reponse?: string | null; explication?: string | null }) => {
    try {
      const context = [
        contextQuestion.question,
        contextQuestion.bonne_reponse ? `Réponse : ${contextQuestion.bonne_reponse}` : "",
        contextQuestion.explication ? `Explication : ${contextQuestion.explication}` : "",
      ].filter(Boolean).join("\n");

      const response = await fetch("/api/autonome/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentQuestion,
          questionContext: context,
          language: cours.language || "français",
        }),
      });
      const data = await response.json();
      return data.explanation || null;
    } catch {
      return null;
    }
  };

  const handleOpenAnswer = async (answer: string) => {
    if (isProcessing || waitingForAcknowledge) return;
    if (chatState !== "asking" && !waitingForRetry) return;

    const question = shuffledQuestions[currentQuestionIndex];
    if (!question) return;

    const studentQuestion = extractStudentQuestion(answer);

    setIsProcessing(true);
    setShowTyping(true);
    
    addMessage({
      sender: "user",
      text: answer,
      type: "answer",
    });

    try {
      const body: EvaluateAnswerRequest = {
        questionText: question.questionText,
        correctAnswer: question.correctAnswers?.[0] || "",
        answer: answer,
        explanation: question.explanation || "",
      };
      const evaluation = await llmService.evaluateAnswer(body);
      processOpenAnswer(evaluation.score, evaluation.feedback, question.correctAnswers?.[0] ?? "", evaluation.missingElements, studentQuestion, { question: question.questionText, correctAnswer: question.correctAnswers?.[0] ?? "", explication: question.explanation ?? "" });
    } catch (error) {
      console.error("Error evaluating answer:", error);
      setShowTyping(false);
      const isCorrect = validateOpenAnswer(answer, question.correctAnswers?.[0]  || "");
      processAnswer(isCorrect, question.correctAnswers?.[0] || "", question.explanation);
    }
  };

  const processOpenAnswer = (
    scorePoints: number, 
    feedback: string, 
    correctAnswer: string,
    missingElements?: string[],
    studentQuestion?: string | null,
    contextQuestion?: { question: string; correctAnswer?: string | null; explication?: string | null }
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

      if (studentQuestion && contextQuestion) {
        setTimeout(async () => {
          setShowTyping(true);
          const explanation = await answerStudentQuestion(studentQuestion, contextQuestion);
          setShowTyping(false);
          if (explanation) {
            addMessage({
              sender: "bot",
              text: explanation,
              type: "feedback",
            });
          }
        }, 800);
      }
    }, 500);
  };

  const processAnswer = (isCorrect: boolean, correctAnswer: string, explication?: string | null) => {
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
      askQuestion(nextIndex, shuffledQuestions);
    }
  };

  const toggleMultiOption = (index: number) => {
    setSelectedMultiIndices(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
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

  // Allow Enter key to move to next question
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

  const currentQuestion = shuffledQuestions[currentQuestionIndex];
  const currentPropositions = currentQuestion?.shuffledPropositions || currentQuestion?.proposals;

  // Show QCM buttons during asking or retry mode
  const showQCMOptions =
    (chatState === "asking" || waitingForRetry) &&
    currentQuestion?.type === "single" &&
    !isProcessing &&
    !waitingForAcknowledge;
  
  // Show multi buttons during asking or retry mode
  const showMultiOptions =
    (chatState === "asking" || waitingForRetry) &&
    currentQuestion?.type === "multiple" &&
    !isProcessing &&
    !waitingForAcknowledge;
  
  // Text input only for open questions (during asking or retry)
  // QCM/multi questions show buttons during retry, not text input
  const showTextInput =
    (chatState === "asking" || waitingForRetry) &&
    currentQuestion?.type === "open" &&
    !isProcessing &&
    !waitingForAcknowledge;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="!fixed !inset-0 !left-0 !top-0 !translate-x-0 !translate-y-0 !max-w-none !w-screen !h-[100dvh] !rounded-none !border-0 flex flex-col p-0 overflow-hidden [&>button]:hidden sm:!inset-auto sm:!left-1/2 sm:!top-1/2 sm:!-translate-x-1/2 sm:!-translate-y-1/2 sm:!max-w-2xl sm:!w-[95vw] sm:!h-[85vh] sm:!rounded-2xl sm:!border"
        data-testid="modal-autonome-chatbot"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="flex-shrink-0 px-4 py-3 border-b bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent backdrop-blur-sm" style={{ paddingTop: 'max(12px, env(safe-area-inset-top))' }}>
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 p-0.5 shadow-lg shadow-amber-500/25">
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
                <Badge className="text-xs px-2.5 py-1 font-semibold mr-1 bg-amber-500 hover:bg-amber-600 text-white border-0">
                  {currentQuestionIndex + 1}/{shuffledQuestions.length}
                </Badge>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleReset}
                disabled={isGeneratingNew}
                className="rounded-xl hover:bg-amber-500/10"
                data-testid="button-reset-autonome-chatbot"
              >
                {isGeneratingNew ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleClose(false)}
                className="rounded-xl hover:bg-destructive/10 hover:text-destructive"
                data-testid="button-close-autonome-chatbot"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-background to-muted/20"
          data-testid="autonome-chatbot-messages"
        >
          {chatState === "loading" ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-amber-500 mb-4" />
              <p className="text-sm font-medium">
                {isGeneratingNew ? t.selfLearner.chatbot.generatingQuestions : t.selfLearner.chatbot.loadingQuestions}
              </p>
              {isGeneratingNew && (
                <p className="text-xs text-muted-foreground/70 mt-1">L'IA prépare des questions inédites pour toi</p>
              )}
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble key={message.id} message={message} t={t} />
            ))
          )}
          {(isProcessing || showTyping) && <TypingIndicator />}
        </div>

        {showQCMOptions && currentPropositions && (
          <div className="flex-shrink-0 px-2 border-t bg-muted/30 backdrop-blur-sm" style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
            <QCMOptions
              propositions={currentPropositions}
              onSelect={handleQCMAnswer}
              disabled={isProcessing}
            />
          </div>
        )}

        {showMultiOptions && currentPropositions && (
          <div className="flex-shrink-0 px-2 border-t bg-muted/30 backdrop-blur-sm" style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
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
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:opacity-90 text-white border border-amber-600"
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
                    {t.chatbot.viewResults}
                  </>
                ) : (
                  <>
                    <ArrowRight className="h-5 w-5 mr-2" />
                    {t.chatbot.nextQuestion}
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
                  placeholder={t.chatbot.inputPlaceholder}
                  className="min-h-[48px] max-h-[120px] py-3 px-4 rounded-xl bg-background/80 border-border/50 focus-visible:ring-amber-500/30 text-base resize-none overflow-y-auto"
                  data-testid="input-open-answer"
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
                className="h-12 w-12 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:opacity-90 shadow-lg shadow-amber-500/25 flex-shrink-0"
                data-testid="button-send-open-answer"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center hidden sm:block">{t.chatbot.pressEnter}</p>
          </div>
        )}

        {chatState === "completed" && messages.length > 0 && !waitingForAcknowledge && (
          <div className="flex-shrink-0 px-4 py-4 border-t bg-muted/30 backdrop-blur-sm" style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
            <div className="flex justify-center">
              <Button
                className="h-12 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:opacity-90 shadow-lg shadow-amber-500/25 px-8 !ring-0 !ring-offset-0 focus:outline-none border border-amber-600"
                onClick={handleReset}
                disabled={isGeneratingNew}
                data-testid="button-restart-quiz"
              >
                {isGeneratingNew ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Nouvelles questions
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
