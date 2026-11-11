import { ArrowUp, Paperclip, Mic, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { promptSuggestions, type PromptSuggestion } from "@/lib/data";
import { useState, useRef } from "react";

function PromptPill({ prompt, onClick }: { prompt: PromptSuggestion; onClick: () => void }) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className="rounded-full text-xs font-normal hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-colors"
      data-testid={`button-prompt-${prompt.id}`}
    >
      {prompt.text}
    </Button>
  );
}

export function HeroSection() {
  // Extract stats as variables for easy backend integration
  // const documentsProcessed = "10K+";
  // const accuracyRate = "95%";
  // const questionsAnswered = "5M+";

  const [inputValue, setInputValue] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handlePromptClick = (text: string) => {
    setInputValue(text);
    textareaRef.current?.focus();
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      console.log("Files dropped:", files);
    }
  };

  const handleSubmit = () => {
    if (inputValue.trim()) {
      console.log("Submitting:", inputValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <section className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-20">
      {/* Hero Text */}
      <div className="text-center mb-16 max-w-3xl">
        <h1 className="heading-1 text-balance">
          Your personalized{" "}
          <span className="text-primary">study buddy</span>
        </h1>
      </div>

      {/* Input Area */}
      <div className="w-full max-w-3xl">
        <div
          className={`relative rounded-lg bg-card border-2 transition-colors ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isDragging && (
            <div className="absolute inset-0 rounded-lg bg-primary/10 flex items-center justify-center z-10">
              <div className="text-center">
                <ImageIcon className="h-12 w-12 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium text-primary">Drop your files here</p>
              </div>
            </div>
          )}

          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything or upload a file to get started..."
            className="min-h-[140px] w-full resize-none rounded-lg bg-transparent px-6 py-5 text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-none"
            data-testid="input-chat"
          />

          {/* Action Bar */}
          <div className="border-t border-border px-4 py-3 flex items-center justify-between bg-muted/30 rounded-b-lg">
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt"
                className="hidden"
                onChange={(e) => console.log("Files selected:", e.target.files)}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleFileSelect}
                className="h-9 w-9 rounded-lg hover:bg-secondary"
                data-testid="button-attach"
              >
                <Paperclip className="h-5 w-5 text-muted-foreground" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-lg hover:bg-secondary"
              >
                <ImageIcon className="h-5 w-5 text-muted-foreground" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-lg hover:bg-secondary"
              >
                <Mic className="h-5 w-5 text-muted-foreground" />
              </Button>
              <div className="hidden md:block ml-2 text-xs text-muted-foreground">
                <kbd className="px-2 py-1 bg-secondary rounded text-xs">⏎</kbd> to send
              </div>
            </div>
            <Button
              size="icon"
              onClick={handleSubmit}
              className="h-10 w-10 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
              disabled={!inputValue.trim()}
              data-testid="button-send"
            >
              <ArrowUp className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Quick Prompts */}
        <div className="mt-8">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="text-sm text-muted-foreground mr-2 hidden sm:inline">
              Try asking:
            </span>
            {promptSuggestions.map((prompt) => (
              <PromptPill
                key={prompt.id}
                prompt={prompt}
                onClick={() => handlePromptClick(prompt.text)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      {/* <div className="mt-16 grid grid-cols-3 gap-8 text-center max-w-2xl w-full">
        <div className="space-y-2">
          <p className="text-3xl font-bold text-primary">{documentsProcessed}</p>
          <p className="text-sm text-muted-foreground">Documents Processed</p>
        </div>
        <div className="space-y-2">
          <p className="text-3xl font-bold text-primary">{accuracyRate}</p>
          <p className="text-sm text-muted-foreground">Accuracy Rate</p>
        </div>
        <div className="space-y-2">
          <p className="text-3xl font-bold text-primary">{questionsAnswered}</p>
          <p className="text-sm text-muted-foreground">Questions Answered</p>
        </div>
      </div> */}
    </section>
  );
}
