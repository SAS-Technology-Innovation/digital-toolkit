"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Filter,
  Grid3X3,
  List,
  Globe,
  School,
  GraduationCap,
  Building2,
  Briefcase,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { AppCard, AppDetailModal, AudienceBadgeList, CategoryBadge } from "@/components";
import type { AppData } from "@/components";

// Extended type for local usage with id
interface App extends AppData {
  id: string;
}

// Mock data - will be fetched from API
const mockApps: App[] = [
  {
    id: "1",
    product: "Google Workspace",
    description: "Collaborative productivity suite including Docs, Sheets, Slides, and more for seamless teamwork.",
    category: "Productivity",
    subject: "All Subjects",
    department: "Technology",
    audience: "Teachers, Students, Staff",
    website: "https://workspace.google.com",
    ssoEnabled: true,
    mobileApp: "Yes",
    division: "whole-school",
    gradeLevels: "K-12",
  },
  {
    id: "2",
    product: "Canvas LMS",
    description: "Learning management system for course content, assignments, and gradebook.",
    category: "Learning Management",
    subject: "All Subjects",
    department: "Technology",
    audience: "Teachers, Students",
    website: "https://canvas.instructure.com",
    tutorialLink: "https://community.canvaslms.com",
    ssoEnabled: true,
    mobileApp: "Yes",
    division: "whole-school",
    gradeLevels: "K-12",
  },
  {
    id: "3",
    product: "Seesaw",
    description: "Student-driven digital portfolio and parent communication platform.",
    category: "Portfolio",
    subject: "All Subjects",
    department: "Elementary",
    audience: "Teachers, Students, Parents",
    website: "https://web.seesaw.me",
    ssoEnabled: true,
    mobileApp: "Yes",
    division: "elementary",
    dateAdded: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
    gradeLevels: "K-5",
  },
  {
    id: "4",
    product: "Desmos",
    description: "Interactive graphing calculator and math activities for visualization.",
    category: "STEM",
    subject: "Math",
    department: "Mathematics",
    audience: "Teachers, Students",
    website: "https://desmos.com",
    ssoEnabled: false,
    mobileApp: "Yes",
    division: "whole-school",
    gradeLevels: "6-12",
  },
  {
    id: "5",
    product: "Canva for Education",
    description: "Design platform for creating presentations, posters, and visual content.",
    category: "Creative",
    subject: "All Subjects",
    department: "Technology",
    audience: "Teachers, Students",
    website: "https://canva.com/education",
    ssoEnabled: true,
    mobileApp: "Yes",
    division: "whole-school",
    dateAdded: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    gradeLevels: "K-12",
  },
  {
    id: "6",
    product: "Turnitin",
    description: "Plagiarism detection and writing feedback tool for academic integrity.",
    category: "Assessment",
    subject: "All Subjects",
    department: "Academic",
    audience: "Teachers, Students",
    website: "https://turnitin.com",
    ssoEnabled: true,
    mobileApp: "No",
    division: "high-school",
    gradeLevels: "9-12",
  },
  {
    id: "7",
    product: "Epic!",
    description: "Digital library with over 40,000 books for children aged 12 and under.",
    category: "Reading",
    subject: "English",
    department: "English",
    audience: "Teachers, Students",
    website: "https://getepic.com",
    ssoEnabled: true,
    mobileApp: "Yes",
    division: "elementary",
    gradeLevels: "K-5",
  },
  {
    id: "8",
    product: "BrainPOP",
    description: "Animated educational content covering science, math, history, and more.",
    category: "Learning",
    subject: "Multiple",
    department: "Academic",
    audience: "Teachers, Students",
    website: "https://brainpop.com",
    ssoEnabled: true,
    mobileApp: "Yes",
    division: "middle-school",
    gradeLevels: "6-8",
  },
  {
    id: "9",
    product: "Adobe Creative Cloud",
    description: "Professional creative tools including Photoshop, Illustrator, and Premiere Pro.",
    category: "Creative",
    subject: "Arts",
    department: "Arts",
    audience: "Teachers, Students",
    website: "https://adobe.com",
    ssoEnabled: true,
    mobileApp: "Yes",
    division: "high-school",
    gradeLevels: "9-12",
  },
  {
    id: "10",
    product: "Naviance",
    description: "College and career readiness platform with planning tools and assessments.",
    category: "College & Career",
    subject: "Counseling",
    department: "Counseling",
    audience: "Teachers, Students, Parents",
    website: "https://naviance.com",
    ssoEnabled: true,
    mobileApp: "Yes",
    division: "high-school",
    gradeLevels: "9-12",
  },
];

const categories = ["All", "Productivity", "Learning Management", "Creative", "STEM", "Assessment", "Portfolio", "Reading", "Learning", "College & Career"];
const departments = ["All", "Technology", "Elementary", "Mathematics", "Academic", "Arts", "English", "Counseling"];
const audiences = ["Teachers", "Students", "Staff", "Parents"];

// Division tabs configuration matching dashboard
const divisionTabs = [
  { id: "All", label: "All Apps", icon: Globe, color: "bg-gray-600" },
  { id: "whole-school", label: "Whole School", icon: Globe, color: "bg-gray-600" },
  { id: "elementary", label: "Elementary", icon: School, color: "bg-[#228ec2]" },
  { id: "middle-school", label: "Middle School", icon: GraduationCap, color: "bg-[#a0192a]" },
  { id: "high-school", label: "High School", icon: Building2, color: "bg-[#1a2d58]" },
];

function AppsPageContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const initialDivision = searchParams.get("division") || "All";
  const initialCategory = searchParams.get("category") || "All";

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedDivision, setSelectedDivision] = useState(initialDivision);
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [selectedAudiences, setSelectedAudiences] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("name");
  const [selectedApp, setSelectedApp] = useState<App | null>(null);

  // Helper to check if date is within X days (for NEW badge)
  const isWithinDays = (dateString: string | undefined, days: number): boolean => {
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
  };

  const filteredApps = useMemo(() => {
    return mockApps
      .filter((app) => {
        const matchesSearch =
          !searchQuery ||
          app.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (app.description?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
          (app.category?.toLowerCase() || "").includes(searchQuery.toLowerCase());

        const matchesCategory =
          selectedCategory === "All" ||
          app.category?.toLowerCase() === selectedCategory.toLowerCase();

        const matchesDivision =
          selectedDivision === "All" || app.division === selectedDivision;

        const matchesDepartment =
          selectedDepartment === "All" ||
          app.department?.toLowerCase() === selectedDepartment.toLowerCase();

        // Audience is now a comma-separated string
        const matchesAudience =
          selectedAudiences.length === 0 ||
          selectedAudiences.some((a) => app.audience?.includes(a));

        return matchesSearch && matchesCategory && matchesDivision && matchesDepartment && matchesAudience;
      })
      .sort((a, b) => {
        if (sortBy === "name") return a.product.localeCompare(b.product);
        if (sortBy === "category") return (a.category || "").localeCompare(b.category || "");
        if (sortBy === "new") {
          const aIsNew = isWithinDays(a.dateAdded, 60) ? 1 : 0;
          const bIsNew = isWithinDays(b.dateAdded, 60) ? 1 : 0;
          return bIsNew - aIsNew;
        }
        return 0;
      });
  }, [searchQuery, selectedCategory, selectedDivision, selectedDepartment, selectedAudiences, sortBy]);

  const toggleAudience = (audience: string) => {
    setSelectedAudiences((prev) =>
      prev.includes(audience)
        ? prev.filter((a) => a !== audience)
        : [...prev, audience]
    );
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedDivision("All");
    setSelectedDepartment("All");
    setSelectedAudiences([]);
  };

  const currentDivision = divisionTabs.find((d) => d.id === selectedDivision);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-heading">APP CATALOG</h1>
        <p className="text-muted-foreground">
          Browse and discover educational technology tools for your classroom
        </p>
      </div>

      {/* Division Tabs */}
      <div className="flex flex-wrap gap-2 pb-4 border-b">
        {divisionTabs.map((div) => (
          <button
            key={div.id}
            onClick={() => setSelectedDivision(div.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all",
              selectedDivision === div.id
                ? `${div.color} text-white shadow-md`
                : "bg-muted hover:bg-muted/80 text-foreground"
            )}
          >
            <div.icon className="w-4 h-4" />
            {div.label}
          </button>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search apps..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Category Filter */}
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Department Filter */}
        <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
          <SelectTrigger className="w-40">
            <Briefcase className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            {departments.map((dept) => (
              <SelectItem key={dept} value={dept}>
                {dept}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Audience Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-36">
              <Filter className="mr-2 h-4 w-4" />
              Audience
              {selectedAudiences.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {selectedAudiences.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Filter by Audience</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {audiences.map((audience) => (
              <DropdownMenuCheckboxItem
                key={audience}
                checked={selectedAudiences.includes(audience)}
                onCheckedChange={() => toggleAudience(audience)}
              >
                {audience}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* View Toggle */}
        <div className="flex items-center gap-2 ml-auto">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="category">Category</SelectItem>
              <SelectItem value="new">Newest</SelectItem>
            </SelectContent>
          </Select>
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "grid" | "list")}>
            <TabsList className="h-9">
              <TabsTrigger value="grid" className="px-2">
                <Grid3X3 className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="list" className="px-2">
                <List className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Results Count */}
      <p className="text-sm text-muted-foreground">
        Showing {filteredApps.length} of {mockApps.length} apps
      </p>

      {/* Apps Grid/List */}
      {viewMode === "grid" ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredApps.map((app) => (
            <AppCard
              key={app.id}
              app={app}
              onShowDetails={(appData) => setSelectedApp(appData as App)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredApps.map((app) => (
            <Card key={app.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-muted-foreground font-bold text-lg shrink-0">
                    {app.product.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <a
                        href={app.website || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold hover:text-primary transition-colors"
                      >
                        {app.product}
                      </a>
                      {isWithinDays(app.dateAdded, 60) && (
                        <Badge variant="destructive" className="text-xs animate-pulse">NEW</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{app.description}</p>
                  </div>
                  <div className="hidden md:flex items-center gap-2">
                    {app.category && <CategoryBadge category={app.category} />}
                    {app.audience && <AudienceBadgeList audiences={app.audience} className="hidden lg:flex" />}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedApp(app)}
                    >
                      Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredApps.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No apps found matching your criteria.</p>
          <Button variant="link" onClick={clearAllFilters}>
            Clear all filters
          </Button>
        </div>
      )}

      {/* App Detail Modal */}
      {selectedApp && (
        <AppDetailModal
          app={selectedApp}
          onClose={() => setSelectedApp(null)}
        />
      )}
    </div>
  );
}

function AppsPageSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-4 w-72 mt-2" />
      </div>
      <div className="flex gap-4">
        <Skeleton className="h-10 w-80" />
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <div>
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16 mt-1" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-12 w-full" />
              <div className="flex gap-2 mt-4">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function AppsPage() {
  return (
    <Suspense fallback={<AppsPageSkeleton />}>
      <AppsPageContent />
    </Suspense>
  );
}
