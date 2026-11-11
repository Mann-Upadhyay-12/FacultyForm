import { useState, useRef, useEffect } from "react";
import { Send, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
}

interface ChatInterfaceProps {
  title?: string;
  placeholder?: string;
  onSendMessage?: (message: string) => Promise<string> | string;
}

export default function ChatInterface({
  title = "Chat",
  placeholder = "Ask me anything...",
  onSendMessage,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      text: inputValue,
      sender: "user",
    };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue("");
    setIsLoading(true);

    try {
      let botResponse: string;
      if (onSendMessage) {
        botResponse = await onSendMessage(currentInput);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        botResponse = "This is a placeholder response.";
      }
      const botMessage: Message = {
        id: Date.now() + 1,
        text: botResponse,
        sender: "bot",
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: "Sorry, I encountered an error. Please try again.",
        sender: "bot",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col bg-background h-full overflow-hidden rounded-lg border border-border">
      {title && (
        <div className="bg-card/30 backdrop-blur-lg border-b border-border px-6 py-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          </div>
        </div>
      )}

      <div ref={scrollAreaRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
        {messages.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="bg-primary/10 p-4 rounded-full mb-4">
              <MessageSquare className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-lg font-medium text-foreground">Start the Conversation</h3>
            <p className="text-muted-foreground text-sm mt-1">
              Ask questions, get summaries, or request key points about your document.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex items-start gap-3",
                message.sender === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[75%] rounded-2xl px-4 py-2.5",
                  message.sender === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <p className="text-sm leading-relaxed">{message.text}</p>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex items-start gap-3 justify-start">
            <div className="bg-muted text-muted-foreground rounded-2xl px-4 py-2.5">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-foreground/50 rounded-full animate-pulse delay-75" />
                <div className="w-2 h-2 bg-foreground/50 rounded-full animate-pulse delay-150" />
                <div className="w-2 h-2 bg-foreground/50 rounded-full animate-pulse delay-300" />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-border p-4 bg-card/30 backdrop-blur-lg flex-shrink-0">
        <div className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={isLoading}
            className="w-full pl-4 pr-12 py-3 bg-muted rounded-full focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-transparent disabled:bg-muted/50 disabled:cursor-not-allowed text-foreground placeholder:text-muted-foreground/80"
          />
          <button
            onClick={handleSendMessage}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed"
            disabled={!inputValue.trim() || isLoading}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
