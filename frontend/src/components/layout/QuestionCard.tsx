import { Question } from "@/lib/data";
interface QuestionCardProps {
  data: Question;
  onAnswer: (optionIndex: number) => void;
  showFeedback: boolean;
  selected: number | null;
  current: number;
  total: number;
}
const QuestionCard: React.FC<QuestionCardProps> = ({
  data,
  onAnswer,
  showFeedback,
  selected,
  current,
  total,
}) => {
  const { question, options, correctIndex } = data;
  const getButtonStyle = (optionIndex: number) => {
    if (!showFeedback) {
      return "bg-card border-2 border-border hover:border-accent/30 hover:bg-card/80 text-foreground";
    }
    if (optionIndex === correctIndex) {
      return "bg-accent/10 border-2 border-accent text-foreground font-medium";
    }
    if (optionIndex === selected) {
      return "bg-card border-2 border-muted-foreground/40 text-muted-foreground";
    }
    return "bg-card border-2 border-border/50 text-muted-foreground/60";
  };
  return (
    <div className="bg-card p-8 rounded-lg w-full max-w-2xl border border-border/50">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Question {current + 1} of {total}
        </h2>
        <span className="text-xs text-muted-foreground">
          {selected !== null
            ? Math.round(((current + 1) / total) * 100) + "% complete"
            : Math.round((current / total) * 100) + "% complete"}
        </span>
      </div>
      <p className="text-2xl font-medium mb-8 text-foreground leading-relaxed">{question}</p>
      <div className="grid gap-3">
        {options.map((option, index) => (
          <button
            className={`${getButtonStyle(
              index
            )} text-left px-5 py-4 rounded-md transition-all duration-200`}
            key={index}
            onClick={() => onAnswer(index)}
            disabled={showFeedback}
          >
            <span className="flex items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground">
                {String.fromCharCode(65 + index)}.
              </span>
              <span>{option}</span>
            </span>
          </button>
        ))}
      </div>
     
      {showFeedback && (
        <div className="mt-6 pt-6 border-t border-border/30">
          {selected === correctIndex ? (
            <p className="text-sm text-accent flex items-center gap-2">
              <span className="text-base">✓</span> Correct answer
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Correct answer: <span className="text-foreground font-medium">{options[correctIndex]}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
};
export default QuestionCard;
