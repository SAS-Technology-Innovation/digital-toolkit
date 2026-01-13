"use client";

import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AIMessage as AIMessageType } from "@/lib/ai";

interface AIMessageProps {
  message: AIMessageType;
  className?: string;
}

/**
 * Renders a single chat message with markdown support
 */
export function AIMessage({ message, className }: AIMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex gap-3 p-4",
        isUser ? "flex-row-reverse" : "",
        className
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-accent text-accent-foreground"
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      {/* Message Content */}
      <div
        className={cn(
          "flex-1 space-y-2 overflow-hidden",
          isUser ? "text-right" : ""
        )}
      >
        <div
          className={cn(
            "inline-block rounded-lg px-4 py-2 text-sm",
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground"
          )}
        >
          <div
            className={cn(
              "prose prose-sm max-w-none",
              isUser ? "prose-invert" : "",
              "[&_p]:my-1 [&_ul]:my-2 [&_ol]:my-2 [&_li]:my-0.5",
              "[&_strong]:font-semibold [&_strong]:text-inherit"
            )}
            dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
          />
        </div>
        <div className="text-xs text-muted-foreground">
          {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  );
}

/**
 * Simple markdown-like formatting for messages
 * Converts **bold**, *italic*, and line breaks
 */
function formatMessage(content: string): string {
  let result = content
    // Escape HTML
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    // Bold: **text**
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    // Italic: *text*
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    // Line breaks
    .replace(/\n/g, "<br />")
    // Lists: - item
    .replace(/^- (.+)$/gm, "<li>$1</li>");

  // Wrap consecutive <li> elements in <ul>
  if (result.includes("<li>")) {
    result = result.replace(/(<li>[\s\S]*?<\/li>)+/g, "<ul>$&</ul>");
    // Clean up multiple consecutive <ul> tags
    result = result.replace(/<\/ul>\s*<ul>/g, "");
  }

  return result;
}

/**
 * Format timestamp for display
 */
function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}
