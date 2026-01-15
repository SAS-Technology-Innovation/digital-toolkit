"use client";

import { useState } from "react";
import { AIChatBubble } from "./ai-chat-bubble";
import { AIChatWindow } from "./ai-chat-window";
import { useAIChat } from "@/hooks/use-ai-chat";
import type { AppContext } from "@/lib/ai";

interface AIChatProps {
  appsData?: AppContext[];
}

/**
 * Main AI Chat Component
 * Combines the chat bubble and window into a complete chat experience
 */
export function AIChat({ appsData }: AIChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, isLoading, sendMessage } = useAIChat();

  const handleSendMessage = (message: string) => {
    sendMessage(message, appsData);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <>
      <AIChatBubble isOpen={isOpen} onClick={handleToggle} />
      <AIChatWindow
        messages={messages}
        isLoading={isLoading}
        isOpen={isOpen}
        onClose={handleClose}
        onSendMessage={handleSendMessage}
      />
    </>
  );
}
