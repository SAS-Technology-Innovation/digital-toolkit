"use client";

import Link from "next/link";
import {
  Tag,
  Calendar,
  Plus,
  RefreshCw,
  Bug,
  ExternalLink,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface ReleaseItem {
  text: string;
  link?: string;
}

interface Release {
  version: string;
  date: string;
  type: "major" | "minor" | "patch";
  highlights?: string[];
  added?: ReleaseItem[];
  changed?: ReleaseItem[];
  fixed?: ReleaseItem[];
  technical?: ReleaseItem[];
}

const releases: Release[] = [
  {
    version: "2.1.0",
    date: "2026-01-15",
    type: "minor",
    highlights: [
      "About, Privacy, and Terms pages",
      "Vercel Analytics integration",
      "Releases page",
    ],
    added: [
      { text: "About page with mission and team info", link: "/about" },
      { text: "Privacy Policy page", link: "/privacy" },
      { text: "Terms of Service page", link: "/terms" },
      { text: "Vercel Analytics & Speed Insights" },
      { text: "Releases page for version history", link: "/releases" },
    ],
    changed: [
      { text: "README updated with new features" },
      { text: "Sidebar includes new page links" },
      { text: "Help page footer links to new pages" },
    ],
  },
  {
    version: "2.0.0",
    date: "2026-01-15",
    type: "major",
    highlights: [
      "User management system",
      "Password authentication",
      "Complete renewal workflow",
    ],
    added: [
      { text: "User Management Admin Page", link: "/admin/users" },
      { text: "Password authentication with registration", link: "/register" },
      { text: "Password reset flow", link: "/reset-password" },
      { text: "Dashboard Renewal Submit Page", link: "/renewals/submit" },
      { text: "TIC Review Dashboard", link: "/renewals/tic-review" },
      { text: "Approver Decisions Page", link: "/renewals/approver" },
      { text: "Help Center with FAQs", link: "/help" },
      { text: "Breadcrumb navigation across pages" },
      { text: "User Management API routes" },
    ],
    changed: [
      { text: "Login page with Magic Link and Password tabs" },
      { text: "Sidebar navigation reorganized" },
      { text: "Apps list API with fallback handling" },
    ],
    fixed: [
      { text: "Empty dropdowns show retry button" },
      { text: "Improved error handling in APIs" },
    ],
  },
  {
    version: "1.2.0",
    date: "2024-12-15",
    type: "minor",
    highlights: [
      "Renewal process improvements",
      "Enhanced search filtering",
    ],
    added: [
      { text: "App Renewal Process page" },
      { text: "Renewal action persistence" },
      { text: "Status page for monitoring", link: "/status" },
    ],
    changed: [
      { text: "Improved renewal workflow" },
      { text: "Enhanced filtering capabilities" },
    ],
    fixed: [
      { text: "Search filtering includes all fields" },
    ],
  },
  {
    version: "1.1.0",
    date: "2024-12-09",
    type: "minor",
    highlights: [
      "Supabase integration",
      "Authentication system",
    ],
    added: [
      { text: "Supabase authentication" },
      { text: "Magic link login for @sas.edu.sg" },
      { text: "Protected admin routes" },
      { text: "Analytics page", link: "/analytics" },
    ],
    changed: [
      { text: "Project structure reorganized" },
      { text: "Frontend moved to vercel/ directory" },
      { text: "Backend moved to appsscript/ directory" },
    ],
  },
  {
    version: "1.0.0",
    date: "2024-11-01",
    type: "major",
    highlights: [
      "Initial release",
      "Dashboard and App Catalog",
      "AI-powered search",
    ],
    added: [
      { text: "Dashboard with division-based organization", link: "/" },
      { text: "App Catalog with search and filters", link: "/apps" },
      { text: "App Cards with logos and badges" },
      { text: "App Details Modal" },
      { text: "Request App form", link: "/requests" },
      { text: "Signage Display mode", link: "/signage" },
      { text: "AI-powered search and recommendations" },
      { text: "SAS brand styling" },
    ],
    technical: [
      { text: "Next.js 16 with App Router" },
      { text: "Tailwind CSS v4 with Shadcn/UI" },
      { text: "Google Apps Script backend" },
      { text: "Google Sheets data source" },
      { text: "Vercel deployment" },
    ],
  },
];

function getVersionBadgeVariant(type: Release["type"]): "default" | "secondary" | "outline" {
  switch (type) {
    case "major":
      return "default";
    case "minor":
      return "secondary";
    default:
      return "outline";
  }
}

function getVersionLabel(type: Release["type"]): string {
  switch (type) {
    case "major":
      return "Major Release";
    case "minor":
      return "Minor Release";
    default:
      return "Patch";
  }
}

export default function ReleasesPage() {
  const latestVersion = releases[0];

  return (
    <div className="p-6 space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-4 rounded-full bg-primary/10">
            <Tag className="h-12 w-12 text-primary" />
          </div>
        </div>
        <h1 className="text-4xl font-bold tracking-tight font-heading">
          RELEASES
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Version history and release notes for the SAS Digital Toolkit
        </p>
        <div className="flex justify-center gap-2">
          <Badge variant="default">Current: v{latestVersion.version}</Badge>
          <Button variant="outline" size="sm" asChild>
            <a
              href="https://github.com/SAS-Technology-Innovation/digital-toolkit/releases"
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              GitHub Releases
            </a>
          </Button>
        </div>
      </div>

      {/* Latest Release Highlight */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Latest Release</CardTitle>
                <CardDescription>Version {latestVersion.version}</CardDescription>
              </div>
            </div>
            <Badge variant={getVersionBadgeVariant(latestVersion.type)}>
              {getVersionLabel(latestVersion.type)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <Calendar className="h-4 w-4" />
            <span>{latestVersion.date}</span>
          </div>
          {latestVersion.highlights && (
            <div className="flex flex-wrap gap-2">
              {latestVersion.highlights.map((highlight) => (
                <Badge key={highlight} variant="outline">
                  {highlight}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* All Releases */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold font-heading">All Releases</h2>

        <div className="space-y-6">
          {releases.map((release, index) => (
            <Card key={release.version} className={index === 0 ? "border-primary/50" : ""}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${index === 0 ? "bg-primary/20" : "bg-muted"}`}>
                      <Tag className={`h-5 w-5 ${index === 0 ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        v{release.version}
                        {index === 0 && (
                          <Badge variant="default" className="text-xs">Latest</Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {release.date}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant={getVersionBadgeVariant(release.type)}>
                    {getVersionLabel(release.type)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Highlights */}
                {release.highlights && (
                  <div className="flex flex-wrap gap-2">
                    {release.highlights.map((highlight) => (
                      <Badge key={highlight} variant="outline" className="text-xs">
                        {highlight}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Added */}
                {release.added && release.added.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                      <Plus className="h-4 w-4" />
                      Added
                    </div>
                    <ul className="grid gap-1 pl-6">
                      {release.added.map((item) => (
                        <li key={item.text} className="text-sm flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500 shrink-0" />
                          {item.link ? (
                            <Link href={item.link} className="hover:text-primary hover:underline">
                              {item.text}
                            </Link>
                          ) : (
                            <span>{item.text}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Changed */}
                {release.changed && release.changed.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
                      <RefreshCw className="h-4 w-4" />
                      Changed
                    </div>
                    <ul className="grid gap-1 pl-6">
                      {release.changed.map((item) => (
                        <li key={item.text} className="text-sm flex items-center gap-2">
                          <ArrowRight className="h-3 w-3 text-blue-500 shrink-0" />
                          {item.link ? (
                            <Link href={item.link} className="hover:text-primary hover:underline">
                              {item.text}
                            </Link>
                          ) : (
                            <span>{item.text}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Fixed */}
                {release.fixed && release.fixed.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-orange-600">
                      <Bug className="h-4 w-4" />
                      Fixed
                    </div>
                    <ul className="grid gap-1 pl-6">
                      {release.fixed.map((item) => (
                        <li key={item.text} className="text-sm flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-orange-500 shrink-0" />
                          <span>{item.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Technical */}
                {release.technical && release.technical.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-purple-600">
                      <Clock className="h-4 w-4" />
                      Technical
                    </div>
                    <ul className="grid gap-1 pl-6">
                      {release.technical.map((item) => (
                        <li key={item.text} className="text-sm flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-purple-500 shrink-0" />
                          <span>{item.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator />

      {/* Links */}
      <div className="flex justify-center gap-4">
        <Button variant="outline" asChild>
          <a
            href="https://github.com/SAS-Technology-Innovation/digital-toolkit/blob/main/CHANGELOG.md"
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Full Changelog
          </a>
        </Button>
        <Button variant="outline" asChild>
          <a
            href="https://github.com/SAS-Technology-Innovation/digital-toolkit"
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            View on GitHub
          </a>
        </Button>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground pt-4">
        <p>SAS Digital Toolkit - Version {latestVersion.version}</p>
      </div>
    </div>
  );
}
