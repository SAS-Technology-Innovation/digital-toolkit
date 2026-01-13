/**
 * AI Configuration Module
 * Centralizes all AI-related configuration for the application
 */

export const AI_MODELS = {
  // Claude models
  CLAUDE_HAIKU: "claude-3-5-haiku-20241022",
  CLAUDE_SONNET: "claude-sonnet-4-20250514",

  // Gemini models
  GEMINI_FLASH: "gemini-2.0-flash-exp",
} as const;

export const AI_ENDPOINTS = {
  CLAUDE: "https://api.anthropic.com/v1/messages",
  GEMINI: "https://generativelanguage.googleapis.com/v1beta/models",
} as const;

export const AI_DEFAULTS = {
  maxTokens: 1024,
  temperature: 0.7,
  provider: "claude" as const,
  model: AI_MODELS.CLAUDE_HAIKU,
} as const;

export const AI_PROVIDERS = {
  CLAUDE: "claude",
  GEMINI: "gemini",
} as const;

export type AIProvider = (typeof AI_PROVIDERS)[keyof typeof AI_PROVIDERS];
export type AIModel = (typeof AI_MODELS)[keyof typeof AI_MODELS];

/**
 * Get AI configuration from environment
 */
export function getAIConfig() {
  return {
    claudeApiKey: process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY,
    geminiApiKey: process.env.GEMINI_API_KEY,
    defaultProvider: AI_DEFAULTS.provider,
    defaultModel: AI_DEFAULTS.model,
    maxTokens: AI_DEFAULTS.maxTokens,
    temperature: AI_DEFAULTS.temperature,
  };
}

/**
 * Check if a provider is configured
 */
export function isProviderConfigured(provider: AIProvider): boolean {
  const config = getAIConfig();
  switch (provider) {
    case "claude":
      return !!config.claudeApiKey;
    case "gemini":
      return !!config.geminiApiKey;
    default:
      return false;
  }
}

/**
 * Get the appropriate model for a provider
 */
export function getModelForProvider(provider: AIProvider): string {
  switch (provider) {
    case "claude":
      return AI_MODELS.CLAUDE_HAIKU;
    case "gemini":
      return AI_MODELS.GEMINI_FLASH;
    default:
      return AI_MODELS.CLAUDE_HAIKU;
  }
}
