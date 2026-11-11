import { useState, useEffect } from "react";
import Confetti from "react-confetti";
import QuestionCard from "@/components/layout/QuestionCard";
import { questions } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, RotateCcw, Trophy } from "lucide-react";

function TestMode() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isFinished) {
      const progress = {
        lastScore: Math.round((score / questions.length) * 100),
        totalQuestions: questions.length,
        correctAnswers: score,
        completedAt: new Date().toISOString()
      };
      localStorage.setItem('test-mode-progress', JSON.stringify(progress));
    }
  }, [isFinished, score]);

  const handleAnswer = (optionIndex: number) => {
    if (showFeedback) return;
    setSelectedAnswer(optionIndex);
    setShowFeedback(true);
    if (optionIndex === questions[currentQuestion].correctIndex) {
      setScore(score + 1);
    }
  };

  const goToNext = () => {
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      setIsFinished(true);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setIsFinished(false);
  };

  const calculateProgress = () => {
    if (isFinished) return 100;
    const baseProgress = (currentQuestion / questions.length) * 100;
    const questionProgress = selectedAnswer !== null ? (1 / questions.length) * 100 : 0;
    return baseProgress + questionProgress;
  };

  const percentage = Math.round((score / questions.length) * 100);
  const showConfetti = isFinished && percentage >= 70;

  const getScoreMessage = () => {
    if (percentage >= 90) return "Outstanding! You've mastered this topic!";
    if (percentage >= 70) return "Great job! You have a solid understanding.";
    if (percentage >= 50) return "Good effort! Keep practicing to improve.";
    return "Keep studying! You'll get there with more practice.";
  };

  const getScoreColor = () => {
    if (percentage >= 70) return "text-primary";
    if (percentage >= 50) return "text-yellow-500";
    return "text-muted-foreground";
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={300}
          colors={['#74AF87', '#5C9470', '#8BC49B', '#A3D4B2', '#4A7A5A']}
        />
      )}

      <div className="text-center mb-8">
        <h1 className="text-3xl font-serif font-bold mb-2">Test Mode</h1>
        <p className="text-sm text-muted-foreground">Testing your knowledge</p>
      </div>

      <div className="w-full max-w-2xl mb-8">
        <Progress value={calculateProgress()} className="h-2" />
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>Question {Math.min(currentQuestion + 1, questions.length)} of {questions.length}</span>
          <span>{Math.round(calculateProgress())}% Complete</span>
        </div>
      </div>

      {!isFinished ? (
        <>
          <QuestionCard
            showFeedback={showFeedback}
            onAnswer={handleAnswer}
            data={questions[currentQuestion]}
            current={currentQuestion}
            total={questions.length}
            selected={selectedAnswer}
          />

          <div className="mt-8 min-h-[60px] flex items-center gap-4">
            {showFeedback && (
              <>
                <div className="flex items-center gap-2 text-sm">
                  {selectedAnswer === questions[currentQuestion].correctIndex ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                      <span className="text-primary font-medium">Correct!</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-destructive" />
                      <span className="text-destructive font-medium">Incorrect</span>
                    </>
                  )}
                </div>
                <Button onClick={goToNext} className="px-8">
                  {currentQuestion + 1 < questions.length ? "Continue" : "View Results"}
                </Button>
              </>
            )}
          </div>
        </>
      ) : (
        <div className="text-center bg-card border border-border rounded-xl p-8 md:p-12 shadow-sm max-w-lg w-full">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
            <Trophy className={`w-8 h-8 ${getScoreColor()}`} />
          </div>

          <div className="mb-6">
            <div className={`text-5xl font-bold mb-2 ${getScoreColor()}`}>
              {percentage}%
            </div>
            <div className="text-sm text-muted-foreground uppercase tracking-wider">
              Final Score
            </div>
          </div>

          <p className="text-muted-foreground mb-6">
            {getScoreMessage()}
          </p>

          <div className="bg-muted/50 rounded-lg p-4 mb-6">
            <div className="flex justify-center gap-8 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{score}</div>
                <div className="text-muted-foreground">Correct</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-muted-foreground">{questions.length - score}</div>
                <div className="text-muted-foreground">Incorrect</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{questions.length}</div>
                <div className="text-muted-foreground">Total</div>
              </div>
            </div>
          </div>

          <Button onClick={restartQuiz} className="w-full" size="lg">
            <RotateCcw className="w-4 h-4 mr-2" />
            Retake Test
          </Button>
        </div>
      )}
    </div>
  );
}

export default TestMode;
