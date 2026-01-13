"use client";

import { AISearch } from "@/components/ai";

/**
 * Dashboard Search Component
 * Intelligent search bar - AI powers the experience without being explicit
 */
export function DashboardSearch() {
  return (
    <AISearch
      placeholder="Search apps or ask a question..."
      showAIBadge={false}
    />
  );
}
