/**
 * AI Module - Main Export
 * Re-exports all AI-related utilities, types, and configurations
 */

// Configuration
export {
  AI_MODELS,
  AI_ENDPOINTS,
  AI_DEFAULTS,
  AI_PROVIDERS,
  getAIConfig,
  isProviderConfigured,
  getModelForProvider,
  type AIProvider,
  type AIModel,
} from "./config";

// Types
export {
  type AIMessage,
  type AIConversation,
  type AIQueryRequest,
  type AIQueryResponse,
  type AppContext,
  type AIRecommendation,
  type AIRecommendationResponse,
  type AIChatState,
  type AISuggestion,
  DEFAULT_SUGGESTIONS,
} from "./types";

// Prompts
export {
  SYSTEM_PROMPT,
  SYSTEM_PROMPT_WITH_GUARDRAILS,
  BUDGET_OPTIMIZATION_PROMPT,
  buildUserPrompt,
  buildConversationContext,
  buildDescriptionPrompt,
  buildAnalyticsPrompt,
} from "./prompts";
