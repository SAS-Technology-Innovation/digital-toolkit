"use client";

import { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  ExternalLink,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

// Types
interface AppStatus {
  id: string;
  name: string;
  status: "operational" | "issues" | "maintenance";
  lastChecked: string;
  responseTime?: number;
  website: string;
  category: string;
}

// Mock data
const mockStatuses: AppStatus[] = [
  {
    id: "1",
    name: "Google Workspace",
    status: "operational",
    lastChecked: new Date().toISOString(),
    responseTime: 145,
    website: "https://workspace.google.com",
    category: "Productivity",
  },
  {
    id: "2",
    name: "Canvas LMS",
    status: "operational",
    lastChecked: new Date().toISOString(),
    responseTime: 230,
    website: "https://canvas.instructure.com",
    category: "Learning Management",
  },
  {
    id: "3",
    name: "Zoom",
    status: "maintenance",
    lastChecked: new Date().toISOString(),
    responseTime: 0,
    website: "https://zoom.us",
    category: "Communication",
  },
  {
    id: "4",
    name: "Adobe Creative Cloud",
    status: "operational",
    lastChecked: new Date().toISOString(),
    responseTime: 189,
    website: "https://adobe.com",
    category: "Creative",
  },
  {
    id: "5",
    name: "Turnitin",
    status: "issues",
    lastChecked: new Date().toISOString(),
    responseTime: 2500,
    website: "https://turnitin.com",
    category: "Assessment",
  },
  {
    id: "6",
    name: "Seesaw",
    status: "operational",
    lastChecked: new Date().toISOString(),
    responseTime: 167,
    website: "https://web.seesaw.me",
    category: "Portfolio",
  },
];

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "operational":
      return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    case "issues":
      return <XCircle className="h-5 w-5 text-red-600" />;
    case "maintenance":
      return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    default:
      return null;
  }
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, { variant: "default" | "destructive" | "secondary"; label: string }> = {
    operational: { variant: "default", label: "Operational" },
    issues: { variant: "destructive", label: "Issues" },
    maintenance: { variant: "secondary", label: "Maintenance" },
  };

  const config = variants[status] || variants.operational;

  return (
    <Badge variant={config.variant} className={status === "operational" ? "bg-green-600" : ""}>
      {config.label}
    </Badge>
  );
}

export default function StatusPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const filteredApps = mockStatuses.filter((app) => {
    const matchesSearch =
      !searchQuery ||
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "up" && app.status === "operational") ||
      (statusFilter === "down" && (app.status === "issues" || app.status === "maintenance"));

    return matchesSearch && matchesStatus;
  });

  const operationalCount = mockStatuses.filter((a) => a.status === "operational").length;
  const issuesCount = mockStatuses.filter((a) => a.status === "issues" || a.status === "maintenance").length;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setLastRefresh(new Date());
    setIsRefreshing(false);
  };

  const allOperational = issuesCount === 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-heading">SYSTEM STATUS</h1>
          <p className="text-muted-foreground">
            Real-time status of SAS Digital Toolkit applications
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Last updated: {lastRefresh.toLocaleTimeString()}
          </div>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overall Status Banner */}
      <Card className={allOperational ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            {allOperational ? (
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            ) : (
              <AlertTriangle className="h-10 w-10 text-red-600" />
            )}
            <div>
              <h2 className={`text-xl font-semibold ${allOperational ? "text-green-800" : "text-red-800"}`}>
                {allOperational
                  ? "All Systems Operational"
                  : `${issuesCount} System${issuesCount > 1 ? "s" : ""} with Issues`}
              </h2>
              <p className={allOperational ? "text-green-700" : "text-red-700"}>
                {operationalCount} of {mockStatuses.length} applications are running normally
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Operational</CardDescription>
            <CardTitle className="text-3xl text-green-600">{operationalCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Issues / Maintenance</CardDescription>
            <CardTitle className="text-3xl text-red-600">{issuesCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Apps Monitored</CardDescription>
            <CardTitle className="text-3xl">{mockStatuses.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search applications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="up">Operational</TabsTrigger>
            <TabsTrigger value="down">Issues</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Applications List */}
      <Card>
        <CardHeader>
          <CardTitle>Applications</CardTitle>
          <CardDescription>
            Showing {filteredApps.length} of {mockStatuses.length} applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {isRefreshing ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 border-b last:border-0">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              ))
            ) : (
              filteredApps.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center gap-4 p-4 border-b last:border-0 hover:bg-muted/50 transition-colors rounded-lg"
                >
                  <StatusIcon status={app.status} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{app.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {app.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {app.responseTime ? `Response time: ${app.responseTime}ms` : "Not responding"}
                    </p>
                  </div>
                  <StatusBadge status={app.status} />
                  <Button variant="ghost" size="icon" asChild>
                    <a href={app.website} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              ))
            )}
          </div>

          {!isRefreshing && filteredApps.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No applications match your search.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
