import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import {
  getAIConfig,
  AI_MODELS,
  SYSTEM_PROMPT,
  buildUserPrompt,
  type AIQueryRequest,
  type AIQueryResponse,
  type AppContext,
} from "@/lib/ai";

/**
 * AI Chat API Route
 * Handles chat queries using Claude API
 */

// Mock apps data for when no apps are provided
const mockAppsData: AppContext[] = [
  {
    product: "Google Workspace",
    description: "Collaborative productivity suite including Docs, Sheets, Slides, and more.",
    category: "Productivity",
    audience: ["Teachers", "Students", "Staff"],
    ssoEnabled: true,
    mobileApp: true,
    division: "whole-school",
    gradeLevels: "K-12",
  },
  {
    product: "Canvas LMS",
    description: "Learning management system for course content, assignments, and gradebook.",
    category: "Learning Management",
    audience: ["Teachers", "Students"],
    ssoEnabled: true,
    mobileApp: true,
    division: "whole-school",
    gradeLevels: "K-12",
  },
  {
    product: "Seesaw",
    description: "Student-driven digital portfolio and parent communication platform.",
    category: "Portfolio",
    audience: ["Teachers", "Students", "Parents"],
    ssoEnabled: true,
    mobileApp: true,
    division: "elementary",
    gradeLevels: "K-5",
  },
  {
    product: "Desmos",
    description: "Interactive graphing calculator and math activities for visualization.",
    category: "STEM",
    audience: ["Teachers", "Students"],
    ssoEnabled: false,
    mobileApp: true,
    division: "whole-school",
    gradeLevels: "6-12",
  },
  {
    product: "Canva for Education",
    description: "Design platform for creating presentations, posters, and visual content.",
    category: "Creative",
    audience: ["Teachers", "Students"],
    ssoEnabled: true,
    mobileApp: true,
    division: "whole-school",
    gradeLevels: "K-12",
  },
  {
    product: "Turnitin",
    description: "Plagiarism detection and writing feedback tool for academic integrity.",
    category: "Assessment",
    audience: ["Teachers", "Students"],
    ssoEnabled: true,
    mobileApp: false,
    division: "high-school",
    gradeLevels: "9-12",
  },
  {
    product: "Kahoot!",
    description: "Game-based learning platform for quizzes and interactive presentations.",
    category: "Assessment",
    audience: ["Teachers", "Students"],
    ssoEnabled: true,
    mobileApp: true,
    division: "whole-school",
    gradeLevels: "K-12",
  },
  {
    product: "Padlet",
    description: "Virtual bulletin board for collaborative content sharing and brainstorming.",
    category: "Collaboration",
    audience: ["Teachers", "Students"],
    ssoEnabled: true,
    mobileApp: true,
    division: "whole-school",
    gradeLevels: "K-12",
  },
];

export async function POST(request: NextRequest) {
  try {
    const body: AIQueryRequest = await request.json();
    const { query, appsData, provider = "claude" } = body;

    // Validate request
    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return NextResponse.json(
        { error: "Query is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    // Get AI configuration
    const config = getAIConfig();

    // Check if Claude API key is configured
    if (!config.claudeApiKey) {
      // Return a helpful response based on the query using mock data
      const apps = appsData && appsData.length > 0 ? appsData : mockAppsData;
      const matchingApps = apps.filter(app =>
        app.product.toLowerCase().includes(query.toLowerCase()) ||
        app.category?.toLowerCase().includes(query.toLowerCase()) ||
        app.description?.toLowerCase().includes(query.toLowerCase())
      );

      const responseText = matchingApps.length > 0
        ? `Based on your search, here are some relevant tools:\n\n${matchingApps.slice(0, 5).map(app => `- **${app.product}**: ${app.description}`).join('\n')}`
        : `Here are some popular tools in our toolkit:\n\n${mockAppsData.slice(0, 5).map(app => `- **${app.product}**: ${app.description}`).join('\n')}`;

      return NextResponse.json({
        response: responseText,
        model: "local",
        provider: "claude" as const,
        usage: { inputTokens: 0, outputTokens: 0 },
      });
    }

    // Use provided apps data or fall back to mock data
    const apps = appsData && appsData.length > 0 ? appsData : mockAppsData;

    // Build prompts
    const systemPrompt = SYSTEM_PROMPT;
    const userPrompt = buildUserPrompt(query, apps);

    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: config.claudeApiKey,
    });

    // Make API call
    const message = await anthropic.messages.create({
      model: AI_MODELS.CLAUDE_HAIKU,
      max_tokens: config.maxTokens,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });

    // Extract response text
    const responseText = message.content
      .filter((block) => block.type === "text")
      .map((block) => (block as { type: "text"; text: string }).text)
      .join("\n");

    // Return response
    const response: AIQueryResponse = {
      response: responseText,
      model: AI_MODELS.CLAUDE_HAIKU,
      provider: "claude",
      usage: {
        inputTokens: message.usage.input_tokens,
        outputTokens: message.usage.output_tokens,
      },
    };

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("AI API Error:", error);

    // Handle specific error types
    if (error instanceof Anthropic.APIError) {
      if (error.status === 401) {
        return NextResponse.json(
          { error: "Invalid API key. Please check your CLAUDE_API_KEY configuration." },
          { status: 401 }
        );
      }
      if (error.status === 429) {
        return NextResponse.json(
          { error: "Rate limit exceeded. Please try again in a moment." },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to process AI request. Please try again." },
      { status: 500 }
    );
  }
}

// Handle other methods
export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed. Use POST to send queries." },
    { status: 405 }
  );
}
