"use client";

import { useState, useCallback } from "react";
import type {
  AIMessage,
  AIChatState,
  AIQueryResponse,
  AppContext,
  AIProvider,
} from "@/lib/ai";

/**
 * Custom hook for managing AI chat state and interactions
 */
export function useAIChat(initialProvider: AIProvider = "claude") {
  const [state, setState] = useState<AIChatState>({
    messages: [],
    isLoading: false,
    error: null,
    provider: initialProvider,
  });

  /**
   * Generate a unique message ID
   */
  const generateId = () => `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

  /**
   * Send a message to the AI
   */
  const sendMessage = useCallback(
    async (content: string, appsData?: AppContext[]) => {
      if (!content.trim()) return;

      // Create user message
      const userMessage: AIMessage = {
        id: generateId(),
        role: "user",
        content: content.trim(),
        timestamp: new Date(),
        provider: state.provider,
      };

      // Update state with user message and loading
      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, userMessage],
        isLoading: true,
        error: null,
      }));

      try {
        // Make API request
        const response = await fetch("/api/ai", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: content,
            appsData,
            provider: state.provider,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Request failed: ${response.status}`);
        }

        const data: AIQueryResponse = await response.json();

        // Create assistant message
        const assistantMessage: AIMessage = {
          id: generateId(),
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
          provider: data.provider,
        };

        // Update state with assistant response
        setState((prev) => ({
          ...prev,
          messages: [...prev.messages, assistantMessage],
          isLoading: false,
        }));

        return data;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to send message";

        // Create error message as assistant response
        const errorAssistantMessage: AIMessage = {
          id: generateId(),
          role: "assistant",
          content: `Sorry, I encountered an error: ${errorMessage}. Please try again.`,
          timestamp: new Date(),
          provider: state.provider,
        };

        setState((prev) => ({
          ...prev,
          messages: [...prev.messages, errorAssistantMessage],
          isLoading: false,
          error: errorMessage,
        }));

        return null;
      }
    },
    [state.provider]
  );

  /**
   * Clear all messages
   */
  const clearMessages = useCallback(() => {
    setState((prev) => ({
      ...prev,
      messages: [],
      error: null,
    }));
  }, []);

  /**
   * Switch AI provider
   */
  const setProvider = useCallback((provider: AIProvider) => {
    setState((prev) => ({
      ...prev,
      provider,
    }));
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setState((prev) => ({
      ...prev,
      error: null,
    }));
  }, []);

  return {
    messages: state.messages,
    isLoading: state.isLoading,
    error: state.error,
    provider: state.provider,
    sendMessage,
    clearMessages,
    setProvider,
    clearError,
  };
}
