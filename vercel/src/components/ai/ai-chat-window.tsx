"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AIMessage } from "./ai-message";
import { cn } from "@/lib/utils";
import type { AIMessage as AIMessageType, AISuggestion } from "@/lib/ai";
import { DEFAULT_SUGGESTIONS } from "@/lib/ai";

interface AIChatWindowProps {
  messages: AIMessageType[];
  isLoading: boolean;
  isOpen: boolean;
  onClose: () => void;
  onSendMessage: (message: string) => void;
  suggestions?: AISuggestion[];
  className?: string;
}

/**
 * AI Chat Window Component
 * Full chat interface with message history and input
 */
export function AIChatWindow({
  messages,
  isLoading,
  isOpen,
  onClose,
  onSendMessage,
  suggestions = DEFAULT_SUGGESTIONS,
  className,
}: AIChatWindowProps) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSuggestionClick = (suggestion: AISuggestion) => {
    if (!isLoading) {
      onSendMessage(suggestion.text);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "fixed bottom-20 right-4 z-50 w-96 max-w-[calc(100vw-2rem)] rounded-xl border bg-background shadow-2xl",
        "flex flex-col",
        "animate-in slide-in-from-bottom-4 fade-in duration-300",
        className
      )}
      style={{ height: "min(600px, calc(100vh - 120px))" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent">
            <Sparkles className="h-4 w-4 text-accent-foreground" />
          </div>
          <div>
            <h3 className="font-semibold">AI Assistant</h3>
            <p className="text-xs text-muted-foreground">
              EdTech recommendations
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close chat</span>
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent mb-4">
              <Sparkles className="h-6 w-6 text-accent-foreground" />
            </div>
            <h4 className="font-semibold mb-2">How can I help you?</h4>
            <p className="text-sm text-muted-foreground mb-6">
              Ask me about educational apps, tools, or get recommendations for
              your classroom.
            </p>

            {/* Suggestion Chips */}
            <div className="flex flex-wrap gap-2 justify-center">
              {suggestions.slice(0, 4).map((suggestion) => (
                <Button
                  key={suggestion.id}
                  variant="outline"
                  size="sm"
                  className="h-auto py-2 px-3 text-xs whitespace-normal text-left"
                  onClick={() => handleSuggestionClick(suggestion)}
                  disabled={isLoading}
                >
                  {suggestion.text}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {messages.map((message) => (
              <AIMessage key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 p-4 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Thinking...</span>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex gap-2">
          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about apps, tools, or recommendations..."
            className="min-h-[44px] max-h-32 resize-none"
            rows={1}
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isLoading}
            className="h-11 w-11 shrink-0"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span className="sr-only">Send message</span>
          </Button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground text-center">
          AI may make mistakes. Verify important information.
        </p>
      </form>
    </div>
  );
}
