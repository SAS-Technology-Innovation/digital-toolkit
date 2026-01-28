"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
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
  ArrowUpDown,
  ExternalLink,
  ShieldCheck,
  Smartphone,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
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
import { DataTable } from "@/components/ui/data-table";
import { cn } from "@/lib/utils";
import { AppCard, AppDetailModal, AudienceBadgeList, CategoryBadge } from "@/components";
import type { AppData } from "@/components";

// Extended type for local usage with id
interface App extends AppData {
  id: string;
}

// Raw API response structure (same as dashboard)
interface RawDivisionData {
  name: string;
  apps: AppData[];
}

interface RawDashboardData {
  wholeSchool: RawDivisionData;
  elementary: RawDivisionData;
  middleSchool: RawDivisionData;
  highSchool: RawDivisionData;
}

// Helper to check if date is within X days (for NEW badge)
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

// Division tabs configuration matching dashboard
const divisionTabs = [
  { id: "All", label: "All Apps", icon: Globe, color: "bg-gray-600" },
  { id: "whole-school", label: "Whole School", icon: Globe, color: "bg-gray-600" },
  { id: "elementary", label: "Elementary", icon: School, color: "bg-[#228ec2]" },
  { id: "middle-school", label: "Middle School", icon: GraduationCap, color: "bg-[#a0192a]" },
  { id: "high-school", label: "High School", icon: Building2, color: "bg-[#1a2d58]" },
];

// Map API division keys to tab ids
const divisionKeyToTabId: Record<string, string> = {
  wholeSchool: "whole-school",
  elementary: "elementary",
  middleSchool: "middle-school",
  highSchool: "high-school",
};

// Static audience options (these are the known audience types)
const audiences = ["Teachers", "Students", "Staff", "Parents"];

// DataTable columns definition
function createColumns(onShowDetails: (app: App) => void): ColumnDef<App>[] {
  return [
    {
      accessorKey: "product",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          App Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const app = row.original;
        const isNew = isWithinDays(app.dateAdded, 60);
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-muted flex items-center justify-center text-sm font-bold shrink-0">
              {app.logoUrl ? (
                <img src={app.logoUrl} alt="" className="w-8 h-8 rounded object-contain" />
              ) : (
                app.product.charAt(0)
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium truncate">{app.product}</span>
                {isNew && (
                  <Badge variant="destructive" className="text-xs animate-pulse">NEW</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                {app.description}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "category",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          Category
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const category = row.getValue("category") as string;
        return category ? <CategoryBadge category={category} /> : null;
      },
    },
    {
      accessorKey: "audience",
      header: "Audience",
      cell: ({ row }) => {
        const audience = row.getValue("audience") as string;
        return audience ? <AudienceBadgeList audiences={audience} /> : null;
      },
    },
    {
      accessorKey: "department",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          Department
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-sm">{row.getValue("department") || "-"}</span>
      ),
    },
    {
      id: "features",
      header: "Features",
      cell: ({ row }) => {
        const app = row.original;
        return (
          <div className="flex gap-1">
            {app.ssoEnabled && (
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                <ShieldCheck className="w-3 h-3 mr-1" />
                SSO
              </Badge>
            )}
            {app.mobileApp && app.mobileApp.toLowerCase() !== "no" && (
              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                <Smartphone className="w-3 h-3 mr-1" />
                Mobile
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const app = row.original;
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onShowDetails(app)}
            >
              Details
            </Button>
            {app.website && (
              <Button size="sm" variant="ghost" asChild>
                <a href={app.website} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        );
      },
    },
  ];
}

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
  const [modalOpen, setModalOpen] = useState(false);
  const [gridPage, setGridPage] = useState(0);
  const [gridPageSize, setGridPageSize] = useState(24);

  // Real data state
  const [allApps, setAllApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch real data from API on mount
  useEffect(() => {
    fetch("/api/data")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        return res.json();
      })
      .then((json: RawDashboardData) => {
        if ((json as unknown as { error: string }).error) {
          throw new Error((json as unknown as { error: string }).error);
        }

        // Flatten all division apps into a single deduplicated array
        const appMap = new Map<string, App>();
        const divisionKeys = ["wholeSchool", "elementary", "middleSchool", "highSchool"] as const;

        for (const key of divisionKeys) {
          const divisionData = json[key];
          if (!divisionData?.apps) continue;

          const tabId = divisionKeyToTabId[key];
          for (const app of divisionData.apps) {
            // Use product name as dedup key (product_id might not exist on AppData)
            const uniqueKey = app.product;
            if (!uniqueKey) continue;

            if (!appMap.has(uniqueKey)) {
              appMap.set(uniqueKey, {
                ...app,
                id: uniqueKey,
                // Normalize division for filtering
                division: app.division || tabId,
              });
            }
          }
        }

        setAllApps(Array.from(appMap.values()));
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load apps:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Dynamically generate filter options from real data
  const categories = useMemo(() => {
    const cats = new Set<string>();
    for (const app of allApps) {
      if (app.category) cats.add(app.category);
    }
    return ["All", ...Array.from(cats).sort()];
  }, [allApps]);

  const departments = useMemo(() => {
    const depts = new Set<string>();
    for (const app of allApps) {
      if (app.department) depts.add(app.department);
    }
    return ["All", ...Array.from(depts).sort()];
  }, [allApps]);

  const handleShowDetails = (app: App) => {
    setSelectedApp(app);
    setModalOpen(true);
  };

  // Normalize division string for filtering
  const normalizeDivision = (div: string | undefined): string => {
    if (!div) return "";
    const d = div.toLowerCase();
    if (d.includes("whole") || d.includes("school-wide")) return "whole-school";
    if (d.includes("elem")) return "elementary";
    if (d.includes("middle")) return "middle-school";
    if (d.includes("high")) return "high-school";
    return d;
  };

  const filteredApps = useMemo(() => {
    return allApps
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
          selectedDivision === "All" ||
          normalizeDivision(app.division) === selectedDivision;

        const matchesDepartment =
          selectedDepartment === "All" ||
          app.department?.toLowerCase() === selectedDepartment.toLowerCase();

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
  }, [allApps, searchQuery, selectedCategory, selectedDivision, selectedDepartment, selectedAudiences, sortBy]);

  const toggleAudience = (audience: string) => {
    setSelectedAudiences((prev) =>
      prev.includes(audience)
        ? prev.filter((a) => a !== audience)
        : [...prev, audience]
    );
  };

  // Reset grid page when filters change
  useEffect(() => {
    setGridPage(0);
  }, [searchQuery, selectedCategory, selectedDivision, selectedDepartment, selectedAudiences, sortBy]);

  const gridTotalPages = Math.max(1, Math.ceil(filteredApps.length / gridPageSize));
  const gridPageApps = filteredApps.slice(gridPage * gridPageSize, (gridPage + 1) * gridPageSize);

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedDivision("All");
    setSelectedDepartment("All");
    setSelectedAudiences([]);
  };

  const columns = useMemo(() => createColumns(handleShowDetails), []);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading apps...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <p className="text-destructive font-semibold mb-2">Error loading apps</p>
          <p className="text-muted-foreground text-sm">{error}</p>
        </div>
      </div>
    );
  }

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
          {viewMode === "grid" && (
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
          )}
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
        Showing {filteredApps.length} of {allApps.length} apps
      </p>

      {/* Apps Grid/List */}
      {viewMode === "grid" ? (
        <>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {gridPageApps.map((app) => (
              <AppCard
                key={app.id}
                app={app}
                onShowDetails={(appData) => handleShowDetails(appData as App)}
              />
            ))}
          </div>

          {filteredApps.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No apps found matching your criteria.</p>
              <Button variant="link" onClick={clearAllFilters}>
                Clear all filters
              </Button>
            </div>
          )}

          {/* Grid Pagination */}
          {filteredApps.length > 0 && (
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-4">
                <div className="text-sm text-muted-foreground">
                  Showing {gridPage * gridPageSize + 1} to{" "}
                  {Math.min((gridPage + 1) * gridPageSize, filteredApps.length)}{" "}
                  of {filteredApps.length}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Per page</span>
                  <Select
                    value={`${gridPageSize}`}
                    onValueChange={(value) => {
                      setGridPageSize(Number(value));
                      setGridPage(0);
                    }}
                  >
                    <SelectTrigger className="h-8 w-[70px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[12, 24, 48, 96].map((size) => (
                        <SelectItem key={size} value={`${size}`}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setGridPage(0)}
                  disabled={gridPage === 0}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setGridPage((p) => Math.max(0, p - 1))}
                  disabled={gridPage === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium">
                  Page {gridPage + 1} of {gridTotalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setGridPage((p) => Math.min(gridTotalPages - 1, p + 1))}
                  disabled={gridPage >= gridTotalPages - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setGridPage(gridTotalPages - 1)}
                  disabled={gridPage >= gridTotalPages - 1}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <DataTable
          columns={columns}
          data={filteredApps}
          searchValue={searchQuery}
        />
      )}

      {/* App Detail Modal - Using shadcn Dialog */}
      <AppDetailModal
        app={selectedApp}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
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
