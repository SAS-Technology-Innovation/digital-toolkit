"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AudienceBadgeList } from "@/components/ui/audience-badge";
import { CategoryBadge } from "@/components/ui/category-badge";
import { cn } from "@/lib/utils";
import {
  ExternalLink,
  Play,
  Info,
  ShieldCheck,
  Smartphone,
  GraduationCap,
} from "lucide-react";

export interface AppData {
  product: string;
  description?: string;
  category?: string;
  subject?: string;
  department?: string;
  audience?: string;
  website?: string;
  tutorialLink?: string;
  logoUrl?: string;
  ssoEnabled?: boolean;
  mobileApp?: string;
  division?: string;
  gradeLevels?: string;
  dateAdded?: string;
  licenseType?: string;
  enterprise?: boolean;
}

// Helper to check if date is within X days
function isWithinDays(dateString: string | undefined, days: number): boolean {
  if (!dateString) return false;
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= days;
  } catch {
    return false;
  }
}

// Get favicon URL from website
function getFaviconUrl(website: string | undefined): string {
  if (!website) return "";
  try {
    const domain = new URL(website).hostname;
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;
  } catch {
    return "";
  }
}

// Format grade levels to a shorter display string
function formatGradeLevels(gradeLevels: string): string {
  if (!gradeLevels || gradeLevels === "N/A") return "";

  // Common patterns to shorten
  const grades = gradeLevels.split(",").map(g => g.trim());

  // If it's just one or two grades, show as-is
  if (grades.length <= 2) return gradeLevels;

  // Check for Pre-K through Grade X pattern (Elementary)
  if (grades.some(g => g.includes("Pre-K") || g.includes("Kindergarten"))) {
    const hasPreK = grades.some(g => g.includes("Pre-K"));
    const lastGrade = grades[grades.length - 1];
    const gradeNum = lastGrade.match(/Grade (\d+)/)?.[1];
    if (gradeNum) {
      return hasPreK ? `Pre-K - ${gradeNum}` : `K - ${gradeNum}`;
    }
  }

  // Check for Grade X through Grade Y pattern
  const gradeNumbers = grades
    .map(g => g.match(/Grade (\d+)/)?.[1])
    .filter(Boolean)
    .map(Number);

  if (gradeNumbers.length >= 2) {
    const min = Math.min(...gradeNumbers);
    const max = Math.max(...gradeNumbers);
    return `${min} - ${max}`;
  }

  // K-12 pattern
  if (gradeLevels.toLowerCase().includes("k-12") ||
      (grades.length > 10 && gradeNumbers.includes(1) && gradeNumbers.includes(12))) {
    return "K-12";
  }

  // Fallback: just show count
  return `${grades.length} grades`;
}

interface AppCardProps {
  app: AppData;
  showNewBadge?: boolean;
  onShowDetails?: (app: AppData) => void;
  className?: string;
}

export function AppCard({
  app,
  showNewBadge = true,
  onShowDetails,
  className,
}: AppCardProps) {
  const isNew = showNewBadge && isWithinDays(app.dateAdded, 60);
  const logoUrl = app.logoUrl || getFaviconUrl(app.website);

  return (
    <div
      className={cn(
        "group relative bg-card border rounded-lg p-4 hover:border-primary hover:shadow-md transition-all",
        className
      )}
    >
      {/* NEW Badge */}
      {isNew && (
        <Badge className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-xs animate-pulse">
          NEW
        </Badge>
      )}

      {/* Logo */}
      {logoUrl && (
        <div className="w-12 h-12 mb-3 flex items-center justify-center">
          <img
            src={logoUrl}
            alt={`${app.product} logo`}
            className="max-w-full max-h-full object-contain rounded"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
      )}

      {/* App Name */}
      <a
        href={app.website || "#"}
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold text-primary hover:text-destructive hover:underline block mb-2 truncate"
        title={app.product}
      >
        {app.product}
      </a>

      {/* Description */}
      {app.description && (
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {app.description}
        </p>
      )}

      {/* Meta badges */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {app.ssoEnabled && (
          <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 hover:bg-green-200">
            <ShieldCheck className="w-3 h-3 mr-1" />
            SSO
          </Badge>
        )}
        {app.mobileApp && app.mobileApp.toLowerCase() !== "no" && (
          <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200">
            <Smartphone className="w-3 h-3 mr-1" />
            Mobile
          </Badge>
        )}
        {app.gradeLevels && app.gradeLevels !== "N/A" && formatGradeLevels(app.gradeLevels) && (
          <Badge
            variant="secondary"
            className="text-xs bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
            title={app.gradeLevels}
          >
            <GraduationCap className="w-3 h-3 mr-1" />
            {formatGradeLevels(app.gradeLevels)}
          </Badge>
        )}
      </div>

      {/* Audience & Category tags */}
      <div className="flex flex-wrap gap-1.5 mt-auto">
        {app.audience && <AudienceBadgeList audiences={app.audience} />}
        {app.category && <CategoryBadge category={app.category} />}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 mt-3 pt-3 border-t">
        {app.tutorialLink && (
          <Button size="sm" variant="outline" className="flex-1 text-xs" asChild>
            <a href={app.tutorialLink} target="_blank" rel="noopener noreferrer">
              <Play className="w-3 h-3 mr-1" />
              Tutorial
            </a>
          </Button>
        )}
        {onShowDetails && (
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-xs"
            onClick={() => onShowDetails(app)}
          >
            <Info className="w-3 h-3 mr-1" />
            Details
          </Button>
        )}
        <Button size="sm" variant="outline" className="flex-1 text-xs" asChild>
          <a href={app.website || "#"} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-3 h-3 mr-1" />
            Open
          </a>
        </Button>
      </div>
    </div>
  );
}
