"use client";

import { ReactNode } from "react";
import { AIProvider } from "./ai-provider";
import { AIChat } from "./ai-chat";

interface AIWrapperProps {
  children: ReactNode;
}

/**
 * Client-side wrapper that provides AI context and chat functionality
 */
export function AIWrapper({ children }: AIWrapperProps) {
  return (
    <AIProvider>
      {children}
      <AIChat />
    </AIProvider>
  );
}
