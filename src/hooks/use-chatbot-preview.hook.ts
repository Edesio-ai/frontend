import { useReducer, useCallback } from "react";
import type { Course, Question, EvaluateAnswerRequest } from "@/types";
import {
  propositionLabels,
  correctAnswerDisplay,
  letterAnswerIsCorrect,
} from "@/lib/proposition-labels";
import { questionService } from "@/services/question.service";

export interface ChatMessage {
  id: string;
  sender: "bot" | "student";
  text: string;
  type?: "greeting" | "course_selection" | "question" | "answer" | "feedback" | "completion";
  courseId?: string;
  questionId?: string;
  isCorrect?: boolean;
  isPartial?: boolean;
  scoreRatio?: number;
}

type ChatbotState = 
  | "idle"
  | "greeting"
  | "awaiting_course_selection"
  | "asking_questions"
  | "completed";

interface State {
  chatbotState: ChatbotState;
  messages: ChatMessage[];
  availableCours: Course[];
  selectedCourse: Course | null;
  questions: Question[];
  currentQuestionIndex: number;
  score: number;
  totalAnswered: number;
  sessionName: string;
  retryMode: boolean;
}

type Action =
  | { type: "RESET" }
  | { type: "SET_COURS"; cours: Course[]; sessionName: string }
  | { type: "ADD_MESSAGE"; message: ChatMessage }
  | { type: "SELECT_COURS"; cours: Course; questions: Question[] }
  | { type: "ANSWER_QUESTION"; isCorrect: boolean }
  | { type: "NEXT_QUESTION" }
  | { type: "ENTER_RETRY_MODE" }
  | { type: "EXIT_RETRY_MODE" }
  | { type: "COMPLETE" };

function generateId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Varied response templates for more natural conversation
const greetings = [
  "Salut ! Je suis Edesio, ton assistant de révision. Prêt à apprendre ensemble ?",
  "Hello ! C'est Edesio. Je suis là pour t'aider à réviser de façon ludique !",
  "Bienvenue ! Je suis Edesio et je vais t'accompagner dans tes révisions.",
  "Coucou ! Moi c'est Edesio. On révise ensemble aujourd'hui ?",
];

const correctAnswers = [
  "Super ! C'est exactement ça !",
  "Bravo, tu as tout compris !",
  "Parfait ! Tu maîtrises bien ce sujet !",
  "Excellent ! Continue comme ça !",
  "Génial ! C'est la bonne réponse !",
  "Top ! Tu assures !",
  "Bien joué ! Tu es sur la bonne voie !",
];

const encouragementsAfterWrong = [
  "Pas de souci, c'est en se trompant qu'on apprend !",
  "Ce n'est pas grave ! L'important c'est de comprendre.",
  "Ça arrive ! Regardons ensemble la bonne réponse.",
  "Hmm, pas tout à fait. Mais c'est comme ça qu'on progresse !",
  "Presque ! Voyons ce qu'il fallait répondre.",
];

const retryEncouragements = [
  "Qu'est-ce qui te semble être l'élément clé que tu n'avais pas mentionné ?",
  "Peux-tu m'expliquer ce concept avec tes propres mots ?",
  "Qu'as-tu compris de cette notion maintenant ?",
  "Comment reformulerais-tu cette idée ?",
];

const afterRetryMessages = [
  "Très bien ! Maintenant tu t'en souviendras. On continue !",
  "Parfait ! Cette fois c'est acquis. Passons à la suite !",
  "Super ! Tu vois, tu y arrives. Question suivante !",
  "C'est noté ! Tu progresseras la prochaine fois.",
];

const startQuizMessages = [
  "C'est parti ! J'ai préparé {count} questions pour toi.",
  "Super choix ! On démarre avec {count} questions. Tu es prêt(e) ?",
  "Allez, on se lance ! {count} questions t'attendent.",
  "Parfait ! Voici {count} questions pour tester tes connaissances.",
];

const cheatMessages = [
  "Bien essayé, mais ce n'est pas en trichant que l'on apprend !",
]

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const initialState: State = {
  chatbotState: "idle",
  messages: [],
  availableCours: [],
  selectedCourse: null,
  questions: [],
  currentQuestionIndex: 0,
  score: 0,
  totalAnswered: 0,
  sessionName: "",
  retryMode: false,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "RESET":
      return { ...initialState };
    
    case "SET_COURS":
      return {
        ...state,
        availableCours: action.cours,
        sessionName: action.sessionName,
        chatbotState: "greeting",
        messages: [
          {
            id: generateId(),
            sender: "bot",
            text: pickRandom(greetings),
            type: "greeting",
          },
        ],
      };
    
    case "ADD_MESSAGE":
      return {
        ...state,
        messages: [...state.messages, action.message],
      };
    
    case "SELECT_COURS":
      return {
        ...state,
        selectedCourse: action.cours,
        questions: action.questions,
        currentQuestionIndex: 0,
        chatbotState: action.questions.length > 0 ? "asking_questions" : "completed",
      };
    
    case "ANSWER_QUESTION":
      return {
        ...state,
        score: state.score + (action.isCorrect ? 1 : 0),
        totalAnswered: state.totalAnswered + 1,
      };
    
    case "NEXT_QUESTION": {
      const nextIndex = state.currentQuestionIndex + 1;
      if (nextIndex >= state.questions.length) {
        return {
          ...state,
          currentQuestionIndex: nextIndex,
          chatbotState: "completed",
          retryMode: false,
        };
      }
      return {
        ...state,
        currentQuestionIndex: nextIndex,
        retryMode: false,
      };
    }
    
    case "ENTER_RETRY_MODE":
      return {
        ...state,
        retryMode: true,
      };
    
    case "EXIT_RETRY_MODE":
      return {
        ...state,
        retryMode: false,
      };
    
    case "COMPLETE":
      return {
        ...state,
        chatbotState: "completed",
      };
    
    default:
      return state;
  }
}

export function useChatbotPreview() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  const initializeWithCours = useCallback((cours: Course[], sessionName: string) => {
    dispatch({ type: "SET_COURS", cours, sessionName });
  }, []);

  const addBotMessage = useCallback((text: string, type?: ChatMessage["type"], extra?: Partial<ChatMessage>) => {
    dispatch({
      type: "ADD_MESSAGE",
      message: {
        id: generateId(),
        sender: "bot",
        text,
        type,
        ...extra,
      },
    });
  }, []);

  const addStudentMessage = useCallback((text: string, type?: ChatMessage["type"]) => {
    dispatch({
      type: "ADD_MESSAGE",
      message: {
        id: generateId(),
        sender: "student",
        text,
        type,
      },
    });
  }, []);

  const proceedToCoursSelection = useCallback(() => {
    if (state.availableCours.length === 0) {
      addBotMessage(
        `Bienvenue dans la classe ${state.sessionName}.\n\nIl n'y a pas encore de cours disponibles. Demande à ton professeur d'en ajouter !`,
        "course_selection"
      );
      return;
    }

    addBotMessage(
      `Bienvenue dans la classe ${state.sessionName}. Quel cours aimerais-tu réviser aujourd'hui ?`,
      "course_selection"
    );
  }, [state.availableCours, state.sessionName, addBotMessage]);

  const selectCourse = useCallback((cours: Course, questions: Question[]) => {
    addStudentMessage(`Je veux réviser "${cours.title}"`, "answer");
    const shuffledQuestions = shuffleArray(questions);
    dispatch({ type: "SELECT_COURS", cours, questions: shuffledQuestions });

    if (questions.length === 0) {
      setTimeout(() => {
        addBotMessage(
          `Je n'ai pas encore de questions pour "${cours.title}". Demande à ton professeur de générer des questions !`,
          "completion"
        );
      }, 500);
    } else {
      setTimeout(() => {
        const startMsg = pickRandom(startQuizMessages).replace("{count}", String(questions.length));
        addBotMessage(
          `Super, on révise "${cours.title}" ! ${startMsg}`,
          "question"
        );
      }, 500);
    }
  }, [addStudentMessage, addBotMessage]);

  const askCurrentQuestion = useCallback(() => {
    if (state.currentQuestionIndex >= state.questions.length) return null;
    
    const question = state.questions[state.currentQuestionIndex];
    const questionText = `Question ${state.currentQuestionIndex + 1}/${state.questions.length}\n\n${question.questionText}`;
    
    return {
      text: questionText,
      question,
    };
  }, [state.currentQuestionIndex, state.questions]);

  const submitAnswer = useCallback(async (answer: string) => {
    const question = state.questions[state.currentQuestionIndex];
    if (!question) return;

    addStudentMessage(answer, "answer");
    const body: EvaluateAnswerRequest = {
      questionText: question.questionText,
      correctAnswer:
      correctAnswerDisplay(question.proposals, question.correctAnswers || []) || "",
      answer: answer,
      explanation: question.explanation || "",
    }
    let isCheating = false;


    if (state.retryMode) {
      try {
        const evaluation = await questionService.evaluateAnswer(body);
        isCheating = evaluation.isCheating || false;

        const isReflectionValid = evaluation.score >= 0.3;
          
          if (isReflectionValid) {
            const feedback = pickRandom(afterRetryMessages);
            const cheatMessage = pickRandom(cheatMessages);
            addBotMessage(
              isCheating ? cheatMessage : `${feedback}${question.explanation ? `\n\n${question.explanation}` : ""}`,
              "feedback",
              { isCorrect: false }
            );
          } else {
            const cheatMessage = pickRandom(cheatMessages);
            addBotMessage(
              isCheating ? cheatMessage : `Hmm, ta réponse ne correspond pas vraiment à la notion.\n\nLa bonne réponse était : ${correctAnswerDisplay(question.proposals, question.correctAnswers || [])}${question.explanation ? `\n\n${question.explanation}` : ""}\n\nPas de souci, passons à la suite !`,
              "feedback",
              { isCorrect: false }
            );
          }
      } catch (error) {
        console.error("Error evaluating reflection:", error);
        addBotMessage(
          `D'accord, passons à la suite.\n\nPour rappel, la bonne réponse était : ${correctAnswerDisplay(question.proposals, question.correctAnswers || [])}${question.explanation ? `\n\n${question.explanation}` : ""}`,
          "feedback",
          { isCorrect: false }
        );
      }
      dispatch({ type: "NEXT_QUESTION" });
      return;
    }

    let isCorrect = false;
    
    if (question.type === "single" || question.type === "multiple") {
      const answerLetter = answer.toUpperCase().trim().charAt(0);
      const answerIndex = answerLetter.charCodeAt(0) - 65;

      const labels = propositionLabels(question.proposals);
      if (labels.length > 0 && answerIndex >= 0 && answerIndex < labels.length) {
        isCorrect = letterAnswerIsCorrect(question, answerIndex);
      }
    } else {
      const evaluation = await questionService.evaluateAnswer(body);
      isCorrect = evaluation.score >= 0.7;
      isCheating = evaluation.isCheating || false;
    }

    dispatch({ type: "ANSWER_QUESTION", isCorrect });

    setTimeout(() => {
      if (isCorrect) {
        const feedback = pickRandom(correctAnswers);
        addBotMessage(
          `${feedback}${question.explanation ? `\n\n${question.explanation}` : ""}`,
          "feedback",
          { isCorrect: true }
        );
        dispatch({ type: "NEXT_QUESTION" });
      } else {
        const encouragement = pickRandom(encouragementsAfterWrong);
        
        if (question.type === "single" || question.type === "multiple") {
          // For QCM: show correct answer and give another try with buttons (no text explanation needed)
          addBotMessage(
            `${encouragement}\n\nLa bonne réponse est : ${correctAnswerDisplay(question.proposals, question.correctAnswers || [])}\n\nEssaie de sélectionner la bonne réponse cette fois !`,
            "feedback",
            { isCorrect: false }
          );
        } else {
          // For open questions: ask for reflection/explanation
          const retryPrompt = pickRandom(retryEncouragements);
          const cheatMessage = pickRandom(cheatMessages);

          addBotMessage(
            isCheating ? cheatMessage : `${cheatMessage}\n\n${encouragement}\n\nLa bonne réponse est : ${correctAnswerDisplay(question.proposals, question.correctAnswers || [])}\n\n${retryPrompt}`,
            "feedback",
            { isCorrect: false }
          );
        }
        dispatch({ type: "ENTER_RETRY_MODE" });
      }
    }, 500);
  }, [state.questions, state.currentQuestionIndex, state.retryMode, addStudentMessage, addBotMessage]);

  const getCurrentQuestion = useCallback(() => {
    if (state.currentQuestionIndex >= state.questions.length) return null;
    return state.questions[state.currentQuestionIndex];
  }, [state.currentQuestionIndex, state.questions]);

  return {
    ...state,
    reset,
    initializeWithCours,
    addBotMessage,
    addStudentMessage,
    proceedToCoursSelection,
    selectCourse,
    askCurrentQuestion,
    submitAnswer,
    getCurrentQuestion,
  };
}
