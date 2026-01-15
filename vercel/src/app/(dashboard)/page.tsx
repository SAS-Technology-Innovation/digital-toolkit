"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Search,
  Globe,
  GraduationCap,
  School,
  Building2,
  Sparkles,
  Award,
  Users,
  X,
  Loader2,
  Lightbulb,
  Target,
  Rocket,
  User,
  Crown,
  Star,
  Shield,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AppCard, AppDetailModal } from "@/components";
import type { AppData } from "@/components";
import {
  DivisionSection,
  EnterpriseSection,
  WhatsNewSection,
  divisionThemes,
} from "@/components/ui/division-section";
import type { DivisionId } from "@/components/ui/division-section";
import { useAuth } from "@/lib/auth/auth-context";

// Use shared AppData type
type App = AppData;

// Raw API response structure
interface RawDivisionData {
  name: string;
  apps: App[];
}

interface RawDashboardData {
  wholeSchool: RawDivisionData;
  elementary: RawDivisionData;
  middleSchool: RawDivisionData;
  highSchool: RawDivisionData;
}

// Processed structure for display
interface ProcessedDivisionData {
  apps: App[];
  enterpriseApps: App[];
  everyoneApps: App[];
}

// Helper to check if license type indicates "everyone" access
function isEveryoneLicense(licenseType: string | undefined): boolean {
  if (!licenseType) return false;
  const lt = licenseType.toLowerCase();
  return lt.includes("site") || lt.includes("school") || lt.includes("enterprise") || lt.includes("unlimited");
}

// Process raw division data into organized structure
function processDivisionData(raw: RawDivisionData, isWholeSchool: boolean): ProcessedDivisionData {
  const apps = raw.apps || [];

  // Enterprise apps (only for whole school display)
  const enterpriseApps = isWholeSchool
    ? apps.filter(app => app.enterprise === true)
    : [];

  // Everyone apps: site/school/enterprise licenses that aren't enterprise checkbox
  const everyoneApps = apps.filter(app => {
    if (app.enterprise) return false; // Enterprise apps shown separately
    return isEveryoneLicense(app.licenseType);
  });

  return { apps, enterpriseApps, everyoneApps };
}

const baseDivisions = [
  { id: "wholeSchool", label: "Whole School", icon: Globe, color: "bg-gray-600" },
  { id: "elementary", label: "Elementary", icon: School, color: "bg-[#228ec2]" },
  { id: "middleSchool", label: "Middle School", icon: GraduationCap, color: "bg-[#a0192a]" },
  { id: "highSchool", label: "High School", icon: Building2, color: "bg-[#1a2d58]" },
];

const myAppsDivision = { id: "myApps", label: "My Apps", icon: User, color: "bg-primary" };

// My App with assignment role
interface MyApp extends App {
  assignment_id: string;
  assignment_role: "owner" | "champion" | "tic_manager";
  assigned_at: string;
}

// Role display config
const roleConfig = {
  owner: { label: "Owner", icon: Crown, color: "bg-amber-500 text-white" },
  champion: { label: "Champion", icon: Star, color: "bg-purple-500 text-white" },
  tic_manager: { label: "TIC Manager", icon: Shield, color: "bg-blue-500 text-white" },
};

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

export default function DashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("wholeSchool");
  const [searchQuery, setSearchQuery] = useState("");
  const [rawData, setRawData] = useState<RawDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState<App | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [myApps, setMyApps] = useState<MyApp[]>([]);
  const [myAppsLoading, setMyAppsLoading] = useState(false);

  // Build divisions list - add My Apps only when logged in
  const divisions = useMemo(() => {
    if (user) {
      return [myAppsDivision, ...baseDivisions];
    }
    return baseDivisions;
  }, [user]);

  const handleShowDetails = (app: App) => {
    setSelectedApp(app);
    setModalOpen(true);
  };

  // Fetch my apps when user is logged in and tab is selected
  const fetchMyApps = useCallback(async () => {
    if (!user) return;
    setMyAppsLoading(true);
    try {
      const res = await fetch("/api/app-assignments?my_apps=true");
      if (!res.ok) throw new Error("Failed to fetch my apps");
      const data = await res.json();
      setMyApps(data.apps || []);
    } catch (err) {
      console.error("Failed to fetch my apps:", err);
      setMyApps([]);
    } finally {
      setMyAppsLoading(false);
    }
  }, [user]);

  // Fetch my apps when tab changes to myApps
  useEffect(() => {
    if (activeTab === "myApps" && user) {
      fetchMyApps();
    }
  }, [activeTab, user, fetchMyApps]);

  // Fetch data on mount
  useEffect(() => {
    fetch("/api/data")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        return res.json();
      })
      .then((json) => {
        if (json.error) throw new Error(json.error);
        setRawData(json);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Process raw data into organized structure
  const divisionData = useMemo(() => {
    if (!rawData) return null;
    const raw = rawData[activeTab as keyof RawDashboardData];
    if (!raw) return null;
    return processDivisionData(raw, activeTab === "wholeSchool");
  }, [rawData, activeTab]);

  const divisionConfig = divisions.find((d) => d.id === activeTab);

  // Filter apps by search
  const filteredApps = useMemo(() => {
    if (!divisionData || !searchQuery.trim()) return null;
    const query = searchQuery.toLowerCase();
    return divisionData.apps.filter(
      (app) =>
        app.product.toLowerCase().includes(query) ||
        app.category?.toLowerCase().includes(query) ||
        app.subject?.toLowerCase().includes(query) ||
        app.department?.toLowerCase().includes(query) ||
        app.audience?.toLowerCase().includes(query)
    );
  }, [divisionData, searchQuery]);

  // Get new apps (last 60 days)
  const newApps = useMemo(() => {
    if (!divisionData) return [];
    return divisionData.apps.filter((app) => isWithinDays(app.dateAdded, 60));
  }, [divisionData]);

  // Calculate metrics across all divisions (for future dashboard stats)
  const _metrics = useMemo(() => {
    if (!rawData) return null;
    const allApps = [
      ...(rawData.wholeSchool?.apps || []),
      ...(rawData.elementary?.apps || []),
      ...(rawData.middleSchool?.apps || []),
      ...(rawData.highSchool?.apps || []),
    ];
    const uniqueApps = new Map<string, App>();
    allApps.forEach(app => uniqueApps.set(app.product, app));

    const totalApps = uniqueApps.size;
    const enterpriseCount = [...uniqueApps.values()].filter(a => a.enterprise).length;
    const newCount = [...uniqueApps.values()].filter(a => isWithinDays(a.dateAdded, 60)).length;

    return { totalApps, enterpriseCount, newCount };
  }, [rawData]);

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
          <p className="text-destructive font-semibold mb-2">Error loading dashboard</p>
          <p className="text-muted-foreground text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Division Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 pb-4 border-b">
        {divisions.map((div) => (
          <button
            key={div.id}
            onClick={() => {
              setActiveTab(div.id);
              setSearchQuery("");
            }}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all",
              activeTab === div.id
                ? `${div.color} text-white shadow-md`
                : "bg-muted hover:bg-muted/80 text-foreground"
            )}
          >
            <div.icon className="w-4 h-4" />
            {div.label}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search apps by name, category, subject..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search Results */}
      {searchQuery && filteredApps && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">
            Search Results ({filteredApps.length} apps)
          </h2>
          {filteredApps.length > 0 ? (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredApps.map((app) => (
                <AppCard key={app.product} app={app} onShowDetails={handleShowDetails} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No apps found matching &quot;{searchQuery}&quot;</p>
          )}
        </div>
      )}

      {/* My Apps Content */}
      {!searchQuery && activeTab === "myApps" && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/20 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-primary flex items-center gap-3 mb-2">
              <User className="w-7 h-7" />
              My Apps
            </h2>
            <p className="text-muted-foreground">
              Apps you are responsible for as an owner, champion, or TIC manager.
            </p>
          </div>

          {myAppsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : myApps.length === 0 ? (
            <div className="text-center py-16 bg-muted/30 rounded-xl">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No apps assigned yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                You don&apos;t have any apps assigned to you. Contact your TIC or admin to be assigned as an owner or champion for apps.
              </p>
            </div>
          ) : (
            <>
              {/* Group apps by role */}
              {(["owner", "champion", "tic_manager"] as const).map((role) => {
                const appsForRole = myApps.filter((app) => app.assignment_role === role);
                if (appsForRole.length === 0) return null;
                const config = roleConfig[role];
                const RoleIcon = config.icon;
                return (
                  <section key={role} className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge className={cn("flex items-center gap-1", config.color)}>
                        <RoleIcon className="w-3 h-3" />
                        {config.label}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        ({appsForRole.length} {appsForRole.length === 1 ? "app" : "apps"})
                      </span>
                    </div>
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {appsForRole.map((app) => (
                        <AppCard
                          key={app.assignment_id}
                          app={app}
                          onShowDetails={handleShowDetails}
                        />
                      ))}
                    </div>
                  </section>
                );
              })}
            </>
          )}
        </div>
      )}

      {/* Regular Content (hidden when searching or on My Apps tab) */}
      {!searchQuery && activeTab !== "myApps" && divisionData && (
        <>
          {/* Why the SAS Digital Toolkit? (Whole School only) */}
          {activeTab === "wholeSchool" && (
            <section className="mb-8">
              <div className="bg-blue-50 border-2 border-primary/20 rounded-xl p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/70 to-primary" />
                <div className="grid lg:grid-cols-[1fr_300px] gap-8">
                  <div>
                    <h2 className="text-2xl font-bold text-primary flex items-center gap-3 mb-4">
                      <Lightbulb className="w-7 h-7 text-accent" />
                      Why the SAS Digital Toolkit?
                    </h2>
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      The SAS Digital Toolkit serves as the central hub for discovering, exploring, and accessing all educational technology resources available to our community. Our mission is to empower teachers, students, staff, and parents with the right digital tools to enhance teaching, learning, and collaboration across Singapore American School.
                    </p>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center mb-3">
                          <Target className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="font-semibold text-primary mb-1">Our Purpose</h3>
                        <p className="text-sm text-muted-foreground">
                          Streamline technology discovery and ensure everyone has access to approved, supported tools.
                        </p>
                      </div>
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center mb-3">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="font-semibold text-primary mb-1">Who It&apos;s For</h3>
                        <p className="text-sm text-muted-foreground">
                          Teachers, students, staff managing operations, and parents supporting education.
                        </p>
                      </div>
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center mb-3">
                          <Rocket className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="font-semibold text-primary mb-1">What You&apos;ll Find</h3>
                        <p className="text-sm text-muted-foreground">
                          Curated applications organized by division, department, and purpose.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="hidden lg:flex items-center justify-center">
                    <img
                      src="/assets/sci-fi-toolbox.png"
                      alt="Digital Toolkit Illustration"
                      className="max-w-full h-auto rounded-lg shadow-md"
                    />
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* What's New Section */}
          {newApps.length > 0 && (
            <section className="mb-8">
              <div className="bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-200 rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-[#a0192a] flex items-center gap-2 mb-1">
                  <Sparkles className="w-5 h-5 text-[#fabc00]" />
                  What&apos;s New
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Recently added apps in the last 60 days
                </p>
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {newApps.map((app) => (
                    <AppCard key={app.product} app={app} showNewBadge={false} onShowDetails={handleShowDetails} />
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Enterprise Apps (Whole School only) */}
          {activeTab === "wholeSchool" && divisionData.enterpriseApps?.length > 0 && (
            <section className="mb-8">
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-xl p-6 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400" />
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-xl font-bold text-amber-700 flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-500" />
                    Official SAS Core Tools
                  </h2>
                  <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-0">Enterprise</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Officially approved and supported tools for all SAS staff, teachers, students, and parents.
                </p>
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {divisionData.enterpriseApps.map((app) => (
                    <AppCard key={app.product} app={app} onShowDetails={handleShowDetails} />
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Apps Everyone Can Use */}
          {divisionData.everyoneApps?.length > 0 && (
            <section className="mb-8">
              <div className={cn(
                "border-2 rounded-xl p-6 shadow-sm relative overflow-hidden",
                activeTab === "wholeSchool" && "bg-gradient-to-br from-slate-50 to-blue-50 border-slate-200",
                activeTab === "elementary" && "bg-gradient-to-br from-sky-50 to-cyan-50 border-sky-200",
                activeTab === "middleSchool" && "bg-gradient-to-br from-rose-50 to-red-50 border-rose-200",
                activeTab === "highSchool" && "bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200"
              )}>
                <div className={cn(
                  "absolute top-0 left-0 right-0 h-1",
                  activeTab === "wholeSchool" && "bg-gradient-to-r from-slate-400 via-blue-400 to-slate-400",
                  activeTab === "elementary" && "bg-gradient-to-r from-[#228ec2] via-sky-400 to-[#228ec2]",
                  activeTab === "middleSchool" && "bg-gradient-to-r from-[#a0192a] via-rose-400 to-[#a0192a]",
                  activeTab === "highSchool" && "bg-gradient-to-r from-[#1a2d58] via-indigo-400 to-[#1a2d58]"
                )} />
                <h2 className={cn(
                  "text-xl font-bold flex items-center gap-2 mb-1",
                  activeTab === "wholeSchool" && "text-slate-700",
                  activeTab === "elementary" && "text-[#228ec2]",
                  activeTab === "middleSchool" && "text-[#a0192a]",
                  activeTab === "highSchool" && "text-[#1a2d58]"
                )}>
                  <Users className="w-5 h-5" />
                  {activeTab === "wholeSchool"
                    ? "Apps Everyone Can Use"
                    : `Core Apps for ${divisionConfig?.label}`}
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  {activeTab === "wholeSchool"
                    ? "These applications are available to the entire SAS community."
                    : `These applications are available to all ${divisionConfig?.label.toLowerCase()} students and staff.`}
                </p>
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {divisionData.everyoneApps.map((app) => (
                    <AppCard key={app.product} app={app} onShowDetails={handleShowDetails} />
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Empty State */}
          {divisionData.apps.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No apps available</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                There are no applications configured for {divisionConfig?.label || "this division"} yet.
                Check back later or try another division.
              </p>
            </div>
          )}
        </>
      )}

      {/* App Detail Modal */}
      <AppDetailModal
        app={selectedApp}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
}
