"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import type { AppContext, AIQueryResponse } from "@/lib/ai";

interface AIContextValue {
  // Apps data shared across the app
  appsData: AppContext[];
  setAppsData: (apps: AppContext[]) => void;

  // AI query function
  queryAI: (query: string) => Promise<AIQueryResponse | null>;
  isQuerying: boolean;

  // Quick search with AI parsing
  parseSearchQuery: (query: string) => ParsedSearch;

  // Recent AI interactions for context
  recentQueries: string[];
  addRecentQuery: (query: string) => void;

  // AI suggestions based on context
  getSuggestions: (partial: string) => AISuggestion[];
}

interface ParsedSearch {
  searchTerms: string[];
  filters: {
    category?: string;
    division?: string;
    audience?: string[];
    hasSSO?: boolean;
    hasMobile?: boolean;
    gradeLevel?: string;
  };
  intent: "search" | "compare" | "recommend" | "filter" | "question";
  originalQuery: string;
}

interface AISuggestion {
  text: string;
  type: "app" | "category" | "action" | "query";
  icon?: string;
}

const AIContext = createContext<AIContextValue | null>(null);

// Pattern matching for natural language parsing
const PATTERNS = {
  division: /\b(elementary|middle\s*school|high\s*school|whole\s*school|all\s*divisions?)\b/gi,
  category: /\b(productivity|creative|stem|math|assessment|portfolio|learning\s*management|communication|collaboration)\b/gi,
  audience: /\b(teachers?|students?|staff|parents?|admins?)\b/gi,
  features: /\b(sso|single\s*sign[- ]?on|mobile\s*app|mobile)\b/gi,
  grades: /\b(k-?\d{1,2}|\d{1,2}-\d{1,2}|kindergarten|pre-?k)\b/gi,
  intents: {
    compare: /\b(compare|vs|versus|difference|better|alternative)\b/gi,
    recommend: /\b(recommend|suggest|best|top|good|should\s+i\s+use)\b/gi,
    filter: /\b(show|find|filter|only|with|without|that\s+has|that\s+have)\b/gi,
    question: /\b(what|how|why|when|where|which|can|does|is|are)\b/gi,
  },
};

export function AIProvider({ children }: { children: ReactNode }) {
  const [appsData, setAppsData] = useState<AppContext[]>([]);
  const [isQuerying, setIsQuerying] = useState(false);
  const [recentQueries, setRecentQueries] = useState<string[]>([]);

  /**
   * Parse a natural language search query into structured filters
   */
  const parseSearchQuery = useCallback((query: string): ParsedSearch => {
    const normalized = query.toLowerCase();
    const filters: ParsedSearch["filters"] = {};

    // Extract division
    const divisionMatch = normalized.match(PATTERNS.division);
    if (divisionMatch) {
      const div = divisionMatch[0].toLowerCase().replace(/\s+/g, "-");
      if (div.includes("elementary")) filters.division = "elementary";
      else if (div.includes("middle")) filters.division = "middle-school";
      else if (div.includes("high")) filters.division = "high-school";
      else filters.division = "whole-school";
    }

    // Extract category
    const categoryMatch = normalized.match(PATTERNS.category);
    if (categoryMatch) {
      filters.category = categoryMatch[0]
        .split(/\s+/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
    }

    // Extract audience
    const audienceMatches = normalized.match(PATTERNS.audience);
    if (audienceMatches) {
      filters.audience = [...new Set(
        audienceMatches.map((a) =>
          a.charAt(0).toUpperCase() + a.slice(1).replace(/s$/, "")
        )
      )];
    }

    // Extract feature requirements
    const featureMatches = normalized.match(PATTERNS.features);
    if (featureMatches) {
      featureMatches.forEach((f) => {
        if (f.toLowerCase().includes("sso") || f.toLowerCase().includes("sign")) {
          filters.hasSSO = true;
        }
        if (f.toLowerCase().includes("mobile")) {
          filters.hasMobile = true;
        }
      });
    }

    // Extract grade levels
    const gradeMatch = normalized.match(PATTERNS.grades);
    if (gradeMatch) {
      filters.gradeLevel = gradeMatch[0].toUpperCase();
    }

    // Determine intent
    let intent: ParsedSearch["intent"] = "search";
    if (PATTERNS.intents.compare.test(normalized)) intent = "compare";
    else if (PATTERNS.intents.recommend.test(normalized)) intent = "recommend";
    else if (PATTERNS.intents.question.test(normalized)) intent = "question";
    else if (PATTERNS.intents.filter.test(normalized)) intent = "filter";

    // Extract remaining search terms (remove matched patterns)
    const searchTerms = query
      .replace(PATTERNS.division, "")
      .replace(PATTERNS.category, "")
      .replace(PATTERNS.audience, "")
      .replace(PATTERNS.features, "")
      .replace(PATTERNS.grades, "")
      .replace(PATTERNS.intents.compare, "")
      .replace(PATTERNS.intents.recommend, "")
      .replace(PATTERNS.intents.filter, "")
      .replace(PATTERNS.intents.question, "")
      .split(/\s+/)
      .filter((term) => term.length > 2)
      .map((term) => term.replace(/[^\w]/g, ""));

    return {
      searchTerms,
      filters,
      intent,
      originalQuery: query,
    };
  }, []);

  /**
   * Query the AI API
   */
  const queryAI = useCallback(
    async (query: string): Promise<AIQueryResponse | null> => {
      setIsQuerying(true);
      try {
        const response = await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query, appsData }),
        });

        if (!response.ok) {
          throw new Error("AI query failed");
        }

        const data = await response.json();
        return data;
      } catch (error) {
        console.error("AI query error:", error);
        return null;
      } finally {
        setIsQuerying(false);
      }
    },
    [appsData]
  );

  /**
   * Add a query to recent history
   */
  const addRecentQuery = useCallback((query: string) => {
    setRecentQueries((prev) => {
      const filtered = prev.filter((q) => q !== query);
      return [query, ...filtered].slice(0, 10);
    });
  }, []);

  /**
   * Get AI-powered suggestions based on partial input
   */
  const getSuggestions = useCallback(
    (partial: string): AISuggestion[] => {
      const suggestions: AISuggestion[] = [];
      const normalized = partial.toLowerCase();

      if (!normalized) return suggestions;

      // App name suggestions
      const matchingApps = appsData
        .filter((app) => app.product.toLowerCase().includes(normalized))
        .slice(0, 3);

      matchingApps.forEach((app) => {
        suggestions.push({
          text: app.product,
          type: "app",
        });
      });

      // Category suggestions
      const categories = ["Productivity", "Creative", "STEM", "Assessment", "Portfolio", "Learning Management"];
      categories
        .filter((cat) => cat.toLowerCase().includes(normalized))
        .slice(0, 2)
        .forEach((cat) => {
          suggestions.push({
            text: `Show ${cat} apps`,
            type: "category",
          });
        });

      // Smart query suggestions based on input
      if (normalized.includes("for") || normalized.includes("in")) {
        suggestions.push({
          text: `${partial} elementary school`,
          type: "query",
        });
        suggestions.push({
          text: `${partial} with SSO`,
          type: "query",
        });
      }

      // Action suggestions
      if (normalized.length > 3) {
        suggestions.push({
          text: `Find alternatives to ${partial}`,
          type: "action",
        });
        suggestions.push({
          text: `Compare ${partial} options`,
          type: "action",
        });
      }

      return suggestions.slice(0, 6);
    },
    [appsData]
  );

  return (
    <AIContext.Provider
      value={{
        appsData,
        setAppsData,
        queryAI,
        isQuerying,
        parseSearchQuery,
        recentQueries,
        addRecentQuery,
        getSuggestions,
      }}
    >
      {children}
    </AIContext.Provider>
  );
}

export function useAI() {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error("useAI must be used within an AIProvider");
  }
  return context;
}
