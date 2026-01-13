"use client";

import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AIChatBubbleProps {
  isOpen: boolean;
  onClick: () => void;
  hasNewMessage?: boolean;
  className?: string;
}

/**
 * Floating AI Chat Bubble Button
 * Toggles the chat window open/closed
 */
export function AIChatBubble({
  isOpen,
  onClick,
  hasNewMessage = false,
  className,
}: AIChatBubbleProps) {
  return (
    <Button
      onClick={onClick}
      size="lg"
      className={cn(
        "fixed bottom-4 right-4 z-50 h-14 w-14 rounded-full shadow-lg",
        "bg-accent hover:bg-accent/90 text-accent-foreground",
        "transition-all duration-300",
        isOpen && "scale-0 opacity-0",
        className
      )}
      aria-label={isOpen ? "Close AI chat" : "Open AI chat"}
    >
      <Sparkles className="h-6 w-6" />

      {/* New message indicator */}
      {hasNewMessage && !isOpen && (
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
          <span className="relative inline-flex rounded-full h-4 w-4 bg-destructive" />
        </span>
      )}
    </Button>
  );
}
