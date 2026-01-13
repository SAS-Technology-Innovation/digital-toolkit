"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AudienceBadgeList } from "@/components/ui/audience-badge";
import { CategoryBadge } from "@/components/ui/category-badge";
import type { AppData } from "@/components/app-card";
import {
  X,
  ExternalLink,
  PlayCircle,
  ShieldCheck,
  Smartphone,
  Layers,
  Key,
} from "lucide-react";

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

interface AppDetailModalProps {
  app: AppData;
  onClose: () => void;
}

export function AppDetailModal({ app, onClose }: AppDetailModalProps) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const logoUrl = app.logoUrl || getFaviconUrl(app.website);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b flex items-start gap-4">
          {logoUrl && (
            <div className="w-16 h-16 flex items-center justify-center shrink-0">
              <img
                src={logoUrl}
                alt={`${app.product} logo`}
                className="max-w-full max-h-full object-contain rounded-lg"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-primary">{app.product}</h2>
            {app.description && (
              <p className="text-muted-foreground mt-1">{app.description}</p>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)] space-y-6">
          {/* Details Section */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2 mb-3">
              <Layers className="w-4 h-4" />
              Details
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {app.category && app.category !== "N/A" && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="text-xs font-medium text-muted-foreground uppercase">Category</div>
                  <div className="mt-1">
                    <CategoryBadge category={app.category} />
                  </div>
                </div>
              )}
              {app.subject && app.subject !== "N/A" && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="text-xs font-medium text-muted-foreground uppercase">Subject</div>
                  <div className="font-semibold">{app.subject}</div>
                </div>
              )}
              {app.department && app.department !== "N/A" && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="text-xs font-medium text-muted-foreground uppercase">Department</div>
                  <div className="font-semibold">{app.department}</div>
                </div>
              )}
              {app.division && app.division !== "N/A" && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="text-xs font-medium text-muted-foreground uppercase">Division</div>
                  <div className="font-semibold">{app.division}</div>
                </div>
              )}
              {app.gradeLevels && app.gradeLevels !== "N/A" && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="text-xs font-medium text-muted-foreground uppercase">Grade Levels</div>
                  <div className="font-semibold">{app.gradeLevels}</div>
                </div>
              )}
              {app.audience && app.audience !== "N/A" && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="text-xs font-medium text-muted-foreground uppercase mb-1">Audience</div>
                  <AudienceBadgeList audiences={app.audience} />
                </div>
              )}
            </div>
          </div>

          {/* License Information Section */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2 mb-3">
              <Key className="w-4 h-4" />
              License Information
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {app.licenseType && app.licenseType !== "N/A" && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="text-xs font-medium text-muted-foreground uppercase">License Type</div>
                  <div className="font-semibold">{app.licenseType}</div>
                </div>
              )}
              {app.dateAdded && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="text-xs font-medium text-muted-foreground uppercase">Date Added</div>
                  <div className="font-semibold">{new Date(app.dateAdded).toLocaleDateString()}</div>
                </div>
              )}
            </div>
          </div>

          {/* Features Section */}
          {(app.ssoEnabled || (app.mobileApp && app.mobileApp.toLowerCase() !== "no")) && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2 mb-3">
                <ShieldCheck className="w-4 h-4" />
                Features
              </h3>
              <div className="flex flex-wrap gap-2">
                {app.ssoEnabled && (
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                    <ShieldCheck className="w-4 h-4 mr-1" />
                    SSO Enabled
                  </Badge>
                )}
                {app.mobileApp && app.mobileApp.toLowerCase() !== "no" && (
                  <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                    <Smartphone className="w-4 h-4 mr-1" />
                    Mobile App Available
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-muted/30 flex flex-wrap gap-3">
          {app.website && app.website !== "#" && app.website !== "N/A" && (
            <Button asChild className="flex-1 min-w-[140px]">
              <a href={app.website} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Visit Website
              </a>
            </Button>
          )}
          {app.tutorialLink && app.tutorialLink !== "N/A" && (
            <Button variant="secondary" asChild className="flex-1 min-w-[140px]">
              <a href={app.tutorialLink} target="_blank" rel="noopener noreferrer">
                <PlayCircle className="w-4 h-4 mr-2" />
                View Tutorial
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
