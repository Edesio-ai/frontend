import { useReducer, useCallback } from "react";
import type { Course, Question, EvaluateAnswerRequest } from "@/types";
import { useTranslations } from "@/lib/i18n/client";
import { propositionLabels, correctAnswerDisplay, letterAnswerIsCorrect } from "@/lib/proposition-labels";
import { llmService } from "@/services/llm.service";

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

type ChatbotState = "idle" | "greeting" | "awaiting_course_selection" | "asking_questions" | "completed";

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
  | { type: "SET_COURS"; cours: Course[]; sessionName: string; greetingText: string }
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
            text: action.greetingText,
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
  const t = useTranslations();

  const greetings: string[] = t.chatbot.greetings;
  const correctAnswers: string[] = t.chatbot.correctAnswers;
  const encouragementsAfterWrong: string[] = t.chatbot.encouragementsAfterWrong;
  const retryEncouragements: string[] = t.chatbot.retryEncouragements;
  const afterRetryMessages: string[] = t.chatbot.afterRetryMessages;
  const startQuizMessages: string[] = t.chatbot.startQuiz;
  const cheatMessages: string[] = t.chatbot.cheatMessages;

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  const initializeWithCours = useCallback(
    (cours: Course[], sessionName: string) => {
      dispatch({ type: "SET_COURS", cours, sessionName, greetingText: pickRandom(greetings) });
    },
    [greetings],
  );

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
      addBotMessage(t.chatbot.welcomeToClass.replace("{session}", state.sessionName), "course_selection");
      return;
    }

    addBotMessage(t.chatbot.selectCourse.replace("{session}", state.sessionName), "course_selection");
  }, [state.availableCours, state.sessionName, addBotMessage, t.chatbot]);

  const selectCourse = useCallback(
    (cours: Course, questions: Question[]) => {
      addStudentMessage(t.chatbot.studentAnswers.replace("{course}", cours.title), "answer");
      const shuffledQuestions = shuffleArray(questions);
      dispatch({ type: "SELECT_COURS", cours, questions: shuffledQuestions });

      if (questions.length === 0) {
        setTimeout(() => {
          addBotMessage(t.chatbot.noQuestions.replace("{course}", cours.title), "completion");
        }, 500);
      } else {
        setTimeout(() => {
          const startMsg = pickRandom(startQuizMessages).replace("{count}", String(questions.length));
          addBotMessage(t.chatbot.startingCourse.replace("{course}", cours.title) + startMsg, "question");
        }, 500);
      }
    },
    [addStudentMessage, addBotMessage, t.chatbot, startQuizMessages],
  );

  const askCurrentQuestion = useCallback(() => {
    if (state.currentQuestionIndex >= state.questions.length) return null;

    const question = state.questions[state.currentQuestionIndex];
    const questionText = `Question ${state.currentQuestionIndex + 1}/${state.questions.length}\n\n${question.questionText}`;

    return {
      text: questionText,
      question,
    };
  }, [state.currentQuestionIndex, state.questions]);

  const submitAnswer = useCallback(
    async (answer: string) => {
      const question = state.questions[state.currentQuestionIndex];
      if (!question) return;

      addStudentMessage(answer, "answer");
      const body: EvaluateAnswerRequest = {
        questionText: question.questionText,
        correctAnswer: correctAnswerDisplay(question.proposals, question.correctAnswers || []) || "",
        answer: answer,
        explanation: question.explanation || "",
      };
      let isCheating = false;
      let isCorrect = false;
      let isReflectionValid = false;

      if (state.retryMode) {
        try {
          if (question.type === "single" || question.type === "multiple") {
            const answerLetter = answer.toUpperCase().trim().charAt(0);
            const answerIndex = answerLetter.charCodeAt(0) - 65;
            const labels = propositionLabels(question.proposals);
            if (labels.length > 0 && answerIndex >= 0 && answerIndex < labels.length) {
              isCorrect = letterAnswerIsCorrect(question, answerIndex);
            }
          } else {
            const evaluation = await llmService.evaluateAnswer(body);
            isCorrect = evaluation.score >= 0.7;
            isCheating = evaluation.isCheating || false;
            isReflectionValid = evaluation.score >= 0.3;
          }
          if (isReflectionValid || isCorrect) {
            const feedback = pickRandom(afterRetryMessages);
            const cheatMessage = pickRandom(cheatMessages);
            addBotMessage(
              isCheating ? cheatMessage : `${feedback}${question.explanation ? `\n\n${question.explanation}` : ""}`,
              "feedback",
              { isCorrect: false },
            );
          } else {
            const cheatMessage = pickRandom(cheatMessages);
            const answer = correctAnswerDisplay(question.proposals, question.correctAnswers || []);
            const explanation = question.explanation ? `\n\n${question.explanation}` : "";
            addBotMessage(
              isCheating
                ? cheatMessage
                : t.chatbot.reflectionWrong.replace("{answer}", answer).replace("{explanation}", explanation),
              "feedback",
              { isCorrect: false },
            );
          }
        } catch (error) {
          console.error("Error evaluating reflection:", error);
          const answer = correctAnswerDisplay(question.proposals, question.correctAnswers || []);
          const explanation = question.explanation ? `\n\n${question.explanation}` : "";
          addBotMessage(
            t.chatbot.reflectionNext.replace("{answer}", answer).replace("{explanation}", explanation),
            "feedback",
            { isCorrect: false },
          );
        }
        dispatch({ type: "NEXT_QUESTION" });
        return;
      }

      if (question.type === "single" || question.type === "multiple") {
        const answerLetter = answer.toUpperCase().trim().charAt(0);
        const answerIndex = answerLetter.charCodeAt(0) - 65;

        const labels = propositionLabels(question.proposals);
        if (labels.length > 0 && answerIndex >= 0 && answerIndex < labels.length) {
          isCorrect = letterAnswerIsCorrect(question, answerIndex);
        }
      } else {
        const evaluation = await llmService.evaluateAnswer(body);
        isCorrect = evaluation.score >= 0.7;
        isCheating = evaluation.isCheating || false;
      }

      dispatch({ type: "ANSWER_QUESTION", isCorrect });

      setTimeout(() => {
        if (isCorrect) {
          const feedback = pickRandom(correctAnswers);
          addBotMessage(`${feedback}${question.explanation ? `\n\n${question.explanation}` : ""}`, "feedback", {
            isCorrect: true,
          });
          dispatch({ type: "NEXT_QUESTION" });
        } else {
          const encouragement = pickRandom(encouragementsAfterWrong);

          if (question.type === "single" || question.type === "multiple") {
            const wrongAnswer = correctAnswerDisplay(question.proposals, question.correctAnswers || []);
            addBotMessage(
              t.chatbot.wrongQCM.replace("{encouragement}", encouragement).replace("{answer}", wrongAnswer),
              "feedback",
              { isCorrect: false },
            );
          } else {
            const retryPrompt = pickRandom(retryEncouragements);
            const cheatMessage = pickRandom(cheatMessages);
            const wrongAnswer = correctAnswerDisplay(question.proposals, question.correctAnswers || []);

            addBotMessage(
              isCheating
                ? cheatMessage
                : t.chatbot.wrongOpen
                    .replace("{cheat}", cheatMessage)
                    .replace("{encouragement}", encouragement)
                    .replace("{answer}", wrongAnswer)
                    .replace("{retry}", retryPrompt),
              "feedback",
              { isCorrect: false },
            );
          }
          dispatch({ type: "ENTER_RETRY_MODE" });
        }
      }, 500);
    },
    [
      state.questions,
      state.currentQuestionIndex,
      state.retryMode,
      addStudentMessage,
      addBotMessage,
      t.chatbot,
      correctAnswers,
      encouragementsAfterWrong,
      afterRetryMessages,
      retryEncouragements,
      cheatMessages,
    ],
  );

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
