import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { ArrowLeft, Check, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Question {
  id: string;
  type: "mcq" | "fillblank";
  question: string;
  options?: string[];
  correctAnswer: string | number;
  explanation?: string;
}

const mockQuestions: Question[] = [
  {
    id: "1",
    type: "mcq",
    question: "What is the Heisenberg Uncertainty Principle?",
    options: [
      "Energy cannot be created or destroyed",
      "You cannot know position and momentum simultaneously with precision",
      "Light travels at a constant speed",
      "Matter and energy are equivalent"
    ],
    correctAnswer: 1,
    explanation: "The Heisenberg Uncertainty Principle states that you cannot simultaneously know the exact position and momentum of a particle."
  },
  {
    id: "2",
    type: "mcq",
    question: "What does E=mc² represent?",
    options: [
      "Force equals mass times acceleration",
      "Energy-mass equivalence",
      "Electromagnetic induction",
      "Entropy formula"
    ],
    correctAnswer: 1,
    explanation: "E=mc² shows that energy and mass are interchangeable; they are different forms of the same thing."
  },
  {
    id: "3",
    type: "fillblank",
    question: "The speed of light in vacuum is approximately _____ meters per second.",
    correctAnswer: "3 x 10^8",
    explanation: "Light travels at approximately 299,792,458 m/s, commonly rounded to 3 × 10⁸ m/s."
  },
  {
    id: "4",
    type: "mcq",
    question: "Which particle is responsible for electromagnetic force?",
    options: [
      "Gluon",
      "W boson",
      "Photon",
      "Graviton"
    ],
    correctAnswer: 2,
    explanation: "Photons are the force carriers (gauge bosons) for electromagnetic interactions."
  },
  {
    id: "5",
    type: "fillblank",
    question: "Planck's constant has a value of approximately 6.626 × 10^-34 _____.",
    correctAnswer: "J·s",
    explanation: "Planck's constant is measured in Joule-seconds (J·s)."
  }
];

export default function Quiz() {
  const [, navigate] = useLocation();
  const params = useParams();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | string | null>(null);
  const [fillAnswer, setFillAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState<(number | string | null)[]>([]);
  const [quizComplete, setQuizComplete] = useState(false);

  const currentQuestion = mockQuestions[currentIndex];
  const progress = ((currentIndex + 1) / mockQuestions.length) * 100;

  const handleSubmitAnswer = () => {
    const answer = currentQuestion.type === "fillblank" ? fillAnswer : selectedAnswer;
    setAnswers([...answers, answer]);
    setShowResult(true);
  };

  const handleNext = () => {
    if (currentIndex < mockQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setFillAnswer("");
      setShowResult(false);
    } else {
      setQuizComplete(true);
    }
  };

  const normalizeAnswer = (answer: string): string => {
    return answer.toLowerCase().trim().replace(/\s+/g, ' ');
  };

  const checkFillBlank = (userAnswer: string, correctAnswer: string): boolean => {
    const normalizedUser = normalizeAnswer(userAnswer);
    const normalizedCorrect = normalizeAnswer(String(correctAnswer));
    if (normalizedUser === normalizedCorrect) return true;
    if (normalizedUser.includes(normalizedCorrect) || normalizedCorrect.includes(normalizedUser)) return true;
    const userClean = normalizedUser.replace(/[^a-z0-9]/g, '');
    const correctClean = normalizedCorrect.replace(/[^a-z0-9]/g, '');
    return userClean === correctClean || userClean.includes(correctClean) || correctClean.includes(userClean);
  };

  const isCorrect = () => {
    if (currentQuestion.type === "fillblank") {
      return checkFillBlank(fillAnswer, String(currentQuestion.correctAnswer));
    }
    return selectedAnswer === currentQuestion.correctAnswer;
  };

  const getScore = () => {
    return answers.filter((answer, idx) => {
      const q = mockQuestions[idx];
      if (q.type === "fillblank") {
        return checkFillBlank(String(answer || ''), String(q.correctAnswer));
      }
      return answer === q.correctAnswer;
    }).length;
  };

  if (quizComplete) {
    const score = getScore();
    const percentage = Math.round((score / mockQuestions.length) * 100);

    return (
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <h1 className="heading-1 mb-4">Quiz Complete</h1>
          <div className="mb-8">
            <div className="text-6xl font-medium mb-2">{percentage}%</div>
            <p className="text-muted-foreground">
              You got {score} out of {mockQuestions.length} correct
            </p>
          </div>

          <div className="space-y-3 mb-8">
            {mockQuestions.map((q, idx) => {
              const answer = answers[idx];
              const correct = q.type === "fillblank"
                ? checkFillBlank(String(answer || ''), String(q.correctAnswer))
                : answer === q.correctAnswer;
              
              return (
                <div
                  key={q.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    correct ? "border-foreground/20 bg-muted/30" : "border-destructive/30 bg-destructive/5"
                  }`}
                >
                  {correct ? (
                    <Check className="h-4 w-4 text-foreground" />
                  ) : (
                    <X className="h-4 w-4 text-destructive" />
                  )}
                  <span className="text-sm text-left flex-1">{q.question}</span>
                </div>
              );
            })}
          </div>

          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => navigate(`/@me/content/${params.courseId}`)}>
              Back to Course
            </Button>
            <Button onClick={() => {
              setCurrentIndex(0);
              setSelectedAnswer(null);
              setFillAnswer("");
              setShowResult(false);
              setAnswers([]);
              setQuizComplete(false);
            }}>
              Retry Quiz
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate(`/@me/content/${params.courseId}`)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Course
          </button>
          <span className="text-sm text-muted-foreground">
            Question {currentIndex + 1} of {mockQuestions.length}
          </span>
        </div>
        <div className="h-1 bg-muted">
          <div
            className="h-full bg-foreground transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="mb-8">
          <span className="small text-muted-foreground uppercase tracking-wider">
            {currentQuestion.type === "mcq" ? "Multiple Choice" : "Fill in the Blank"}
          </span>
          <h2 className="heading-3 mt-2">{currentQuestion.question}</h2>
        </div>

        {currentQuestion.type === "mcq" ? (
          <div className="space-y-3 mb-8">
            {currentQuestion.options?.map((option, idx) => (
              <button
                key={idx}
                onClick={() => !showResult && setSelectedAnswer(idx)}
                disabled={showResult}
                className={`w-full text-left p-4 rounded-lg border transition-colors ${
                  showResult
                    ? idx === currentQuestion.correctAnswer
                      ? "border-foreground bg-muted"
                      : idx === selectedAnswer
                        ? "border-destructive bg-destructive/5"
                        : "border-border"
                    : selectedAnswer === idx
                      ? "border-foreground"
                      : "border-border hover:border-foreground/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs ${
                    showResult
                      ? idx === currentQuestion.correctAnswer
                        ? "border-foreground bg-foreground text-background"
                        : idx === selectedAnswer
                          ? "border-destructive bg-destructive text-destructive-foreground"
                          : "border-border"
                      : selectedAnswer === idx
                        ? "border-foreground bg-foreground text-background"
                        : "border-border"
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span className="text-sm">{option}</span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="mb-8">
            <input
              type="text"
              value={fillAnswer}
              onChange={(e) => !showResult && setFillAnswer(e.target.value)}
              disabled={showResult}
              placeholder="Type your answer..."
              className={`w-full px-4 py-3 text-sm border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-foreground ${
                showResult
                  ? isCorrect()
                    ? "border-foreground"
                    : "border-destructive"
                  : "border-border"
              }`}
            />
          </div>
        )}

        {showResult && (
          <div className={`mb-8 p-4 rounded-lg border ${
            isCorrect() ? "border-foreground/20 bg-muted/30" : "border-destructive/20 bg-destructive/5"
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {isCorrect() ? (
                <Check className="h-4 w-4" />
              ) : (
                <X className="h-4 w-4 text-destructive" />
              )}
              <span className="font-medium text-sm">
                {isCorrect() ? "Correct!" : "Incorrect"}
              </span>
            </div>
            {currentQuestion.explanation && (
              <p className="text-sm text-muted-foreground">{currentQuestion.explanation}</p>
            )}
          </div>
        )}

        <div className="flex justify-end">
          {!showResult ? (
            <Button
              onClick={handleSubmitAnswer}
              disabled={currentQuestion.type === "mcq" ? selectedAnswer === null : !fillAnswer.trim()}
            >
              Check Answer
            </Button>
          ) : (
            <Button onClick={handleNext}>
              {currentIndex < mockQuestions.length - 1 ? (
                <>
                  Next Question
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              ) : (
                "See Results"
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
