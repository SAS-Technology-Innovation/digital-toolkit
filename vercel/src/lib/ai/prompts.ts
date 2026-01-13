/**
 * AI Prompts Module
 * Centralizes all AI prompts and prompt-building functions
 */

import type { AppContext, AIMessage } from "./types";

/**
 * System prompt for the educational technology assistant
 * This defines the AI's personality, capabilities, and constraints
 */
export const SYSTEM_PROMPT = `You are an AI assistant helping educators at Singapore American School find the right educational technology tools.

Your role:
- Analyze the provided apps database and recommend appropriate tools
- Consider grade levels, subjects, SSO availability, mobile apps, and audience fit
- Provide specific, actionable recommendations with brief explanations
- Be concise but informative - focus on the most relevant apps
- Format app names in **bold** for easy scanning

Guidelines:
- Prioritize apps that match the user's specific needs
- Mention if an app has SSO or mobile apps when relevant
- If asked for alternatives, suggest 2-3 options with trade-offs
- If no perfect match exists, suggest closest alternatives and explain why
- Keep responses under 200 words unless specifically asked for more detail

Important constraints:
- Only recommend apps that exist in the provided database
- If an app isn't in the database, suggest the user request it through the App Request process
- Never make up or hallucinate apps that don't exist
- Be helpful and encouraging while maintaining accuracy`;

/**
 * Extended system prompt with safety guardrails
 * Used for production deployments with stricter content policies
 */
export const SYSTEM_PROMPT_WITH_GUARDRAILS = `${SYSTEM_PROMPT}

Safety Guidelines:
- This is a closed system - only recommend apps from the provided database
- Do not provide information about apps not in the database
- If asked about inappropriate content or topics unrelated to educational technology, politely redirect to your purpose
- Maintain a professional, educational tone at all times
- Protect user privacy - do not ask for or store personal information
- If uncertain about an app's appropriateness, err on the side of caution

App Request Process:
If a user asks about an app not in the database, guide them to:
1. Submit an app request through the official process
2. The EdTech team will review the request
3. Approved apps will be added to the toolkit`;

/**
 * Build a user prompt with apps context
 */
export function buildUserPrompt(query: string, apps: AppContext[]): string {
  const appsContext = apps.length > 0
    ? `\n\nAvailable apps database (${apps.length} apps):\n${formatAppsForPrompt(apps)}`
    : "\n\nNote: No apps data available. Provide general guidance and suggest the user check the full catalog.";

  return `User question: ${query}${appsContext}`;
}

/**
 * Format apps data for inclusion in prompts
 */
function formatAppsForPrompt(apps: AppContext[]): string {
  return apps
    .map((app) => {
      const features = [];
      if (app.ssoEnabled) features.push("SSO");
      if (app.mobileApp) features.push("Mobile");

      return `- **${app.product}**: ${app.description || "No description"} | Category: ${app.category || "Uncategorized"} | Grades: ${app.gradeLevels || "All"} | Division: ${app.division || "All"}${features.length > 0 ? ` | Features: ${features.join(", ")}` : ""}`;
    })
    .join("\n");
}

/**
 * Build conversation context from message history
 */
export function buildConversationContext(messages: AIMessage[]): Array<{ role: "user" | "assistant"; content: string }> {
  return messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));
}

/**
 * Prompt for generating app recommendations based on budget optimization
 */
export const BUDGET_OPTIMIZATION_PROMPT = `Analyze the following apps and their usage data to identify:

1. **Duplicate Tools**: Apps with overlapping functionality where consolidation is possible
2. **Underutilized Licenses**: Apps with low utilization rates that could be reduced
3. **Cost-Saving Opportunities**: Suggestions for free alternatives or better pricing tiers
4. **Renewal Priorities**: Which renewals are most critical vs. which could be reconsidered

For each recommendation:
- Explain the rationale clearly
- Estimate potential savings if applicable
- Consider the impact on users before suggesting changes
- Prioritize recommendations by potential impact

Format your response as a structured list with clear categories.`;

/**
 * Prompt for app description generation (data enrichment)
 */
export function buildDescriptionPrompt(appName: string, existingInfo: Partial<AppContext>): string {
  return `Generate a concise, educational description (2-3 sentences) for the app "${appName}".

Known information:
${existingInfo.category ? `- Category: ${existingInfo.category}` : ""}
${existingInfo.website ? `- Website: ${existingInfo.website}` : ""}
${existingInfo.audience ? `- Audience: ${existingInfo.audience.join(", ")}` : ""}

Focus on:
- What the app does
- How it benefits educators and students
- Key features or use cases

Keep the tone professional and informative. Do not make up features - only describe what is commonly known about this app.`;
}

/**
 * Prompt for analytics and insights
 */
export function buildAnalyticsPrompt(question: string, dataSummary: string): string {
  return `You are an analytics assistant helping the EdTech team understand their app ecosystem.

Data Summary:
${dataSummary}

Question: ${question}

Provide insights based on the data. Be specific with numbers when available. If the data doesn't support a conclusion, say so rather than speculating.`;
}
