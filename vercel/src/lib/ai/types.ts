/**
 * AI Types Module
 * Centralizes all AI-related TypeScript types and interfaces
 */

import type { AIProvider } from "./config";

// Message types
export interface AIMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  provider?: AIProvider;
}

export interface AIConversation {
  id: string;
  messages: AIMessage[];
  createdAt: Date;
  updatedAt: Date;
}

// Request/Response types
export interface AIQueryRequest {
  query: string;
  appsData?: AppContext[];
  provider?: AIProvider;
  conversationHistory?: AIMessage[];
}

export interface AIQueryResponse {
  response: string;
  model: string;
  provider: AIProvider;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
  error?: string;
}

// App context for AI queries
export interface AppContext {
  product: string;
  description?: string;
  category?: string;
  subject?: string;
  audience?: string[];
  website?: string;
  ssoEnabled?: boolean;
  mobileApp?: boolean;
  division?: string;
  gradeLevels?: string;
}

// Recommendation types
export interface AIRecommendation {
  id: string;
  type: "cost-saving" | "optimization" | "alternative" | "underutilized";
  title: string;
  description: string;
  apps: string[];
  potentialSavings?: number;
  priority: "high" | "medium" | "low";
}

export interface AIRecommendationResponse {
  recommendations: AIRecommendation[];
  summary: string;
  generatedAt: Date;
}

// Chat state
export interface AIChatState {
  messages: AIMessage[];
  isLoading: boolean;
  error: string | null;
  provider: AIProvider;
}

// Suggestion chips
export interface AISuggestion {
  id: string;
  text: string;
  category?: string;
}

// Default suggestions for the chat
export const DEFAULT_SUGGESTIONS: AISuggestion[] = [
  { id: "1", text: "What tools are available for elementary math?", category: "discovery" },
  { id: "2", text: "Find apps with SSO for middle school", category: "discovery" },
  { id: "3", text: "What alternatives are there to Kahoot?", category: "alternatives" },
  { id: "4", text: "Recommend a tool for student portfolios", category: "recommendation" },
];
