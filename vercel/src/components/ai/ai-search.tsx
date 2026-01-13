"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Sparkles,
  ArrowRight,
  X,
  Loader2,
  AppWindow,
  FolderOpen,
  Wand2,
  Clock,
  Command,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Command as CommandPrimitive,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAI } from "./ai-provider";

interface AISearchProps {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string, parsed: ReturnType<ReturnType<typeof useAI>["parseSearchQuery"]>) => void;
  showAIBadge?: boolean;
  expandable?: boolean;
}

/**
 * AI-Powered Search Bar
 * Understands natural language queries and provides intelligent suggestions
 */
export function AISearch({
  placeholder = "Search apps or ask a question...",
  className,
  onSearch,
  showAIBadge = true,
  expandable = false,
}: AISearchProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isAIMode, setIsAIMode] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const {
    parseSearchQuery,
    getSuggestions,
    queryAI,
    isQuerying,
    recentQueries,
    addRecentQuery,
  } = useAI();

  const suggestions = getSuggestions(query);
  const parsed = parseSearchQuery(query);
  const hasFilters = Object.keys(parsed.filters).length > 0;
  const isQuestion = parsed.intent === "question" || parsed.intent === "recommend";

  // Auto-detect if user is asking a question
  useEffect(() => {
    setIsAIMode(isQuestion && query.length > 10);
  }, [query, isQuestion]);

  const handleSearch = useCallback(() => {
    if (!query.trim()) return;

    addRecentQuery(query);

    if (isAIMode) {
      // Route to AI chat with the question
      router.push(`/?ai=${encodeURIComponent(query)}`);
    } else {
      // Normal search with parsed filters
      if (onSearch) {
        onSearch(query, parsed);
      } else {
        // Build URL params from parsed query
        const params = new URLSearchParams();
        if (parsed.searchTerms.length > 0) {
          params.set("search", parsed.searchTerms.join(" "));
        }
        if (parsed.filters.category) {
          params.set("category", parsed.filters.category);
        }
        if (parsed.filters.division) {
          params.set("division", parsed.filters.division);
        }
        router.push(`/apps?${params.toString()}`);
      }
    }

    setQuery("");
    setIsOpen(false);
  }, [query, isAIMode, parsed, onSearch, router, addRecentQuery]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
    if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleSuggestionSelect = (suggestion: { text: string; type: string }) => {
    if (suggestion.type === "app") {
      router.push(`/apps?search=${encodeURIComponent(suggestion.text)}`);
    } else if (suggestion.type === "action" || suggestion.type === "query") {
      setQuery(suggestion.text);
      inputRef.current?.focus();
    } else if (suggestion.type === "category") {
      const category = suggestion.text.replace("Show ", "").replace(" apps", "");
      router.push(`/apps?category=${encodeURIComponent(category)}`);
    }
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div
          className={cn(
            "relative flex items-center gap-2",
            expandable && "transition-all duration-300",
            className
          )}
        >
          {/* AI Badge */}
          {showAIBadge && (
            <Badge
              variant="outline"
              className={cn(
                "absolute left-3 z-10 gap-1 px-1.5 py-0.5 text-xs transition-all",
                isAIMode
                  ? "bg-accent text-accent-foreground border-accent"
                  : "bg-background"
              )}
            >
              <Sparkles className="h-3 w-3" />
              AI
            </Badge>
          )}

          {/* Search Input */}
          <div className="relative flex-1">
            <Search
              className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground",
                showAIBadge && "left-14"
              )}
            />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsOpen(true)}
              placeholder={placeholder}
              className={cn(
                "h-10",
                showAIBadge ? "pl-20" : "pl-9",
                hasFilters && "pr-20"
              )}
            />

            {/* Filter indicators */}
            {hasFilters && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <Badge variant="secondary" className="text-xs py-0">
                  {Object.keys(parsed.filters).length} filter{Object.keys(parsed.filters).length > 1 ? "s" : ""}
                </Badge>
              </div>
            )}
          </div>

          {/* Search/AI Button */}
          <Button
            size="icon"
            onClick={handleSearch}
            disabled={!query.trim() || isQuerying}
            className={cn(
              "shrink-0",
              isAIMode && "bg-accent hover:bg-accent/90"
            )}
          >
            {isQuerying ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isAIMode ? (
              <Wand2 className="h-4 w-4" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
          </Button>
        </div>
      </PopoverTrigger>

      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <CommandPrimitive className="rounded-lg border-0">
          <CommandList>
            {/* AI Mode Indicator */}
            {isAIMode && query.length > 0 && (
              <div className="p-3 border-b bg-accent/10">
                <div className="flex items-center gap-2 text-sm">
                  <Sparkles className="h-4 w-4 text-accent-foreground" />
                  <span>
                    This looks like a question. Press Enter to ask AI.
                  </span>
                </div>
              </div>
            )}

            {/* Detected Filters */}
            {hasFilters && (
              <div className="p-3 border-b">
                <p className="text-xs text-muted-foreground mb-2">Detected filters:</p>
                <div className="flex flex-wrap gap-1">
                  {parsed.filters.category && (
                    <Badge variant="secondary">{parsed.filters.category}</Badge>
                  )}
                  {parsed.filters.division && (
                    <Badge variant="secondary">{parsed.filters.division}</Badge>
                  )}
                  {parsed.filters.audience?.map((a) => (
                    <Badge key={a} variant="secondary">{a}</Badge>
                  ))}
                  {parsed.filters.hasSSO && (
                    <Badge variant="secondary">SSO</Badge>
                  )}
                  {parsed.filters.hasMobile && (
                    <Badge variant="secondary">Mobile</Badge>
                  )}
                </div>
              </div>
            )}

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <CommandGroup heading="Suggestions">
                {suggestions.map((suggestion, i) => (
                  <CommandItem
                    key={i}
                    onSelect={() => handleSuggestionSelect(suggestion)}
                    className="cursor-pointer"
                  >
                    {suggestion.type === "app" && (
                      <AppWindow className="mr-2 h-4 w-4 text-muted-foreground" />
                    )}
                    {suggestion.type === "category" && (
                      <FolderOpen className="mr-2 h-4 w-4 text-muted-foreground" />
                    )}
                    {suggestion.type === "action" && (
                      <Wand2 className="mr-2 h-4 w-4 text-accent-foreground" />
                    )}
                    {suggestion.type === "query" && (
                      <Search className="mr-2 h-4 w-4 text-muted-foreground" />
                    )}
                    <span>{suggestion.text}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* Recent Searches */}
            {recentQueries.length > 0 && !query && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Recent">
                  {recentQueries.slice(0, 5).map((recentQuery, i) => (
                    <CommandItem
                      key={i}
                      onSelect={() => {
                        setQuery(recentQuery);
                        inputRef.current?.focus();
                      }}
                      className="cursor-pointer"
                    >
                      <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{recentQuery}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}

            {/* Empty State */}
            {query && suggestions.length === 0 && (
              <CommandEmpty>
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground">
                    Press Enter to {isAIMode ? "ask AI" : "search"}
                  </p>
                </div>
              </CommandEmpty>
            )}

            {/* Quick Actions */}
            {!query && (
              <div className="p-3 border-t">
                <p className="text-xs text-muted-foreground mb-2">Try asking:</p>
                <div className="flex flex-wrap gap-1">
                  {[
                    "Math apps for middle school",
                    "Tools with SSO",
                    "Alternatives to Kahoot",
                  ].map((example) => (
                    <Button
                      key={example}
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => {
                        setQuery(example);
                        inputRef.current?.focus();
                      }}
                    >
                      {example}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CommandList>
        </CommandPrimitive>
      </PopoverContent>
    </Popover>
  );
}

/**
 * Command Palette Search (Cmd+K)
 * Global search accessible via keyboard shortcut
 */
export function AICommandSearch() {
  const [open, setOpen] = useState(false);

  // Keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      {/* Trigger hint */}
      <Button
        variant="outline"
        className="relative h-9 w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        <span className="hidden lg:inline-flex">Search apps...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      {/* Command Dialog */}
      {open && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
          <div className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] p-4">
            <div className="rounded-xl border bg-background shadow-lg">
              <AISearch
                placeholder="Type a command or search..."
                showAIBadge={true}
                className="border-0"
                onSearch={() => setOpen(false)}
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-6 top-6"
                onClick={() => setOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
