"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Database,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Play,
  Loader2,
  Search,
  Download,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  Trash2,
  Copy,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/auth-context";
import { DataTable } from "@/components/ui/data-table";
import { createAppColumns, getDefaultColumnVisibility } from "@/lib/app-columns";
import type { App, SyncLog } from "@/lib/supabase/types";

interface RawAppData {
  id?: string;
  product: string;
  description?: string;
  category?: string;
  division?: string;
  vendor?: string;
  website?: string;
  [key: string]: unknown;
}

interface DuplicateGroup {
  product: string;
  count: number;
  ids: string[];
  keep_id: string;
  remove_ids: string[];
}

interface DuplicateInfo {
  totalApps: number;
  duplicateGroups: number;
  totalDuplicates: number;
  duplicates: DuplicateGroup[];
}

// Safely extract hostname from URL, returns null if invalid
function getHostname(url: string | undefined): string | null {
  if (!url || url === "#" || url === "N/A") return null;
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

export default function AdminPage() {
  const [apps, setApps] = useState<App[]>([]);
  const [rawData, setRawData] = useState<RawAppData[]>([]);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [rawPage, setRawPage] = useState(0);
  const [rawPageSize, setRawPageSize] = useState(50);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [duplicateInfo, setDuplicateInfo] = useState<DuplicateInfo | null>(null);
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);
  const [removingDuplicates, setRemovingDuplicates] = useState(false);
  const [duplicateSuccess, setDuplicateSuccess] = useState<string | null>(null);
  const [canEdit, setCanEdit] = useState(false);

  const supabase = createClient();
  const { user } = useAuth();

  // Check if current user can edit (admin or TIC role)
  useEffect(() => {
    if (!user) {
      setCanEdit(false);
      return;
    }
    fetch("/api/users?current=true")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          const roles = data.user.roles || [data.user.role || "staff"];
          setCanEdit(roles.includes("admin") || roles.includes("tic"));
        }
      })
      .catch(() => setCanEdit(false));
  }, [user]);

  // Column definitions for the editable DataTable
  const appColumns = createAppColumns();
  const defaultColumnVisibility = getDefaultColumnVisibility();

  // Handle inline cell edits
  const handleCellEdit = useCallback(
    async (rowId: string, field: string, value: unknown) => {
      const res = await fetch(`/api/apps/${rowId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save");
      }

      // Update local state optimistically
      setApps((prev) =>
        prev.map((app) =>
          app.id === rowId
            ? { ...app, [field]: value, updated_at: new Date().toISOString() }
            : app
        )
      );
    },
    []
  );

  // Fetch data from Supabase
  const fetchSupabaseData = useCallback(async () => {
    try {
      const { data: appsData, error: appsError } = await supabase
        .from("apps")
        .select("*")
        .order("product", { ascending: true });

      if (appsError) throw appsError;
      setApps((appsData || []) as App[]);

      const { data: logsData, error: logsError } = await supabase
        .from("sync_logs")
        .select("*")
        .order("started_at", { ascending: false })
        .limit(10);

      if (logsError) throw logsError;
      const logs = (logsData || []) as SyncLog[];
      setSyncLogs(logs);

      if (logs.length > 0) {
        setLastSync(new Date(logs[0].started_at));
      }
    } catch (err) {
      console.error("Error fetching Supabase data:", err);
      setError("Failed to load data from Supabase");
    }
  }, [supabase]);

  // Fetch formatted data from Supabase via API
  const fetchRawData = useCallback(async () => {
    try {
      const response = await fetch("/api/data");
      if (!response.ok) throw new Error("Failed to fetch raw data");
      const data = await response.json();

      // API returns division-based structure, flatten all apps
      if (data && typeof data === "object" && !Array.isArray(data)) {
        const allApps: RawAppData[] = [];
        const divisions = ["wholeSchool", "elementary", "middleSchool", "highSchool"];
        for (const div of divisions) {
          if (data[div]?.apps && Array.isArray(data[div].apps)) {
            allApps.push(...data[div].apps);
          }
        }
        // Deduplicate by product name
        const uniqueApps = new Map<string, RawAppData>();
        allApps.forEach(app => {
          if (app.product && !uniqueApps.has(app.product)) {
            uniqueApps.set(app.product, app);
          }
        });
        setRawData([...uniqueApps.values()]);
      } else if (Array.isArray(data)) {
        setRawData(data);
      } else if (data.apps && Array.isArray(data.apps)) {
        setRawData(data.apps);
      } else {
        setRawData([]);
      }
    } catch (err) {
      console.error("Error fetching raw data:", err);
      setRawData([]);
    }
  }, []);

  // Initial data load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchSupabaseData(), fetchRawData()]);
      setLoading(false);
    };
    loadData();
  }, [fetchSupabaseData, fetchRawData]);

  // Trigger sync with direction
  const triggerSync = async (direction: "pull" | "push" | "bidirectional" = "pull") => {
    setSyncing(true);
    setError(null);

    try {
      const response = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ triggered_by: "admin_manual", direction }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Sync failed");
      }

      // Refresh data after sync
      await fetchSupabaseData();
      await fetchRawData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  // Check for duplicates
  const checkDuplicates = async () => {
    setCheckingDuplicates(true);
    setError(null);
    setDuplicateSuccess(null);

    try {
      const response = await fetch("/api/duplicates");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to check duplicates");
      }

      const data = await response.json();
      setDuplicateInfo(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to check duplicates");
    } finally {
      setCheckingDuplicates(false);
    }
  };

  // Remove duplicates
  const removeDuplicates = async () => {
    setRemovingDuplicates(true);
    setError(null);
    setDuplicateSuccess(null);

    try {
      const response = await fetch("/api/duplicates", {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to remove duplicates");
      }

      const data = await response.json();
      setDuplicateSuccess(data.message);

      // Refresh data
      await fetchSupabaseData();
      await checkDuplicates();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove duplicates");
    } finally {
      setRemovingDuplicates(false);
    }
  };

  // Export to CSV
  const exportToCsv = () => {
    const headers = ["Product", "Category", "Division", "Vendor", "Annual Cost", "Licenses", "Renewal Date"];
    const rows = apps.map((app) => [
      app.product,
      app.category || "",
      app.division || "",
      app.vendor || "",
      app.annual_cost?.toString() || "",
      app.licenses?.toString() || "",
      app.renewal_date || "",
    ]);

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `apps-export-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-heading">ADMIN</h1>
          <p className="text-muted-foreground">
            Manage data sync between Supabase and Google Sheets
          </p>
        </div>
        <div className="flex items-center gap-4">
          {lastSync && (
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Last sync: {lastSync.toLocaleString()}
            </div>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Sync Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Data Sync
              </CardTitle>
              <CardDescription>
                Bidirectional sync between Google Sheets (source of truth) and Supabase (real-time layer)
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Sync Direction Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => triggerSync("pull")}
              disabled={syncing}
              className="flex-1 min-w-50"
            >
              {syncing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ArrowDownToLine className="mr-2 h-4 w-4" />
              )}
              Pull from Sheets
              <span className="ml-2 text-xs opacity-70">(Sheets → Supabase)</span>
            </Button>
            <Button
              onClick={() => triggerSync("push")}
              disabled={syncing}
              variant="secondary"
              className="flex-1 min-w-50"
            >
              {syncing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ArrowUpFromLine className="mr-2 h-4 w-4" />
              )}
              Push to Sheets
              <span className="ml-2 text-xs opacity-70">(Supabase → Sheets)</span>
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  disabled={syncing}
                  variant="outline"
                  className="flex-1 min-w-50"
                >
                  {syncing ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowLeftRight className="mr-2 h-4 w-4" />
                  )}
                  Full Bidirectional Sync
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Full Bidirectional Sync</DialogTitle>
                  <DialogDescription>
                    This will pull all data from Google Sheets to Supabase, then push any local changes back to Sheets.
                    Use this for a complete sync operation.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button onClick={() => triggerSync("bidirectional")} disabled={syncing}>
                    {syncing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Syncing...
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Start Full Sync
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{apps.length}</div>
                <p className="text-xs text-muted-foreground">Apps in Supabase</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{rawData.length}</div>
                <p className="text-xs text-muted-foreground">Formatted Apps (API)</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-600">
                  {syncLogs.filter((l) => l.status === "completed").length}
                </div>
                <p className="text-xs text-muted-foreground">Successful Syncs</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-red-600">
                  {syncLogs.filter((l) => l.status === "failed").length}
                </div>
                <p className="text-xs text-muted-foreground">Failed Syncs</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Data Tables */}
      <Tabs defaultValue="supabase" className="space-y-4">
        <TabsList>
          <TabsTrigger value="supabase">Supabase Data</TabsTrigger>
          <TabsTrigger value="raw">Formatted Data</TabsTrigger>
          <TabsTrigger value="logs">Sync Logs</TabsTrigger>
          <TabsTrigger value="duplicates" className="flex items-center gap-1">
            <Copy className="h-3 w-3" />
            Duplicates
          </TabsTrigger>
        </TabsList>

        {/* Supabase Data Table — Notion-style inline editing */}
        <TabsContent value="supabase">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Apps in Supabase</CardTitle>
                  {canEdit && (
                    <CardDescription>Click any cell to edit inline. Changes save automatically.</CardDescription>
                  )}
                </div>
                <div className="flex gap-2">
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search apps..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Button variant="outline" onClick={exportToCsv}>
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <DataTable
                  columns={appColumns}
                  data={apps as Record<string, unknown>[] & App[]}
                  searchValue={searchQuery}
                  defaultPageSize={50}
                  defaultColumnVisibility={defaultColumnVisibility}
                  stickyFirstColumn={true}
                  onCellEdit={handleCellEdit}
                  canEdit={canEdit}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Formatted Data (from Supabase API) */}
        <TabsContent value="raw">
          <Card>
            <CardHeader>
              <CardTitle>Formatted Data</CardTitle>
              <CardDescription>
                Division-formatted app data from Supabase (as served by the /api/data endpoint)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <>
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="sticky left-0 z-20 bg-background shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Product</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Division</TableHead>
                        <TableHead>Vendor</TableHead>
                        <TableHead>Website</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rawData.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            No formatted data available. Check Supabase connection.
                          </TableCell>
                        </TableRow>
                      ) : (
                        rawData
                          .slice(rawPage * rawPageSize, (rawPage + 1) * rawPageSize)
                          .map((app, idx) => (
                          <TableRow key={app.id || idx}>
                            <TableCell className="font-medium sticky left-0 z-10 bg-background shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">{app.product}</TableCell>
                            <TableCell>{app.category || "N/A"}</TableCell>
                            <TableCell>{app.division || "N/A"}</TableCell>
                            <TableCell>{app.vendor || "N/A"}</TableCell>
                            <TableCell>
                              {getHostname(app.website) ? (
                                <a
                                  href={app.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline text-xs"
                                >
                                  {getHostname(app.website)}
                                </a>
                              ) : (
                                "N/A"
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
                {/* Raw data pagination */}
                {rawData.length > 0 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-muted-foreground">
                        Showing {rawPage * rawPageSize + 1} to{" "}
                        {Math.min((rawPage + 1) * rawPageSize, rawData.length)}{" "}
                        of {rawData.length}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Per page</span>
                        <Select
                          value={`${rawPageSize}`}
                          onValueChange={(value) => {
                            setRawPageSize(Number(value));
                            setRawPage(0);
                          }}
                        >
                          <SelectTrigger className="h-8 w-[70px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[25, 50, 100, 200].map((size) => (
                              <SelectItem key={size} value={`${size}`}>
                                {size}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={() => setRawPage(0)} disabled={rawPage === 0}>
                        <ChevronsLeft className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setRawPage(p => Math.max(0, p - 1))} disabled={rawPage === 0}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm font-medium">
                        Page {rawPage + 1} of {Math.max(1, Math.ceil(rawData.length / rawPageSize))}
                      </span>
                      <Button variant="outline" size="sm" onClick={() => setRawPage(p => p + 1)} disabled={(rawPage + 1) * rawPageSize >= rawData.length}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setRawPage(Math.ceil(rawData.length / rawPageSize) - 1)} disabled={(rawPage + 1) * rawPageSize >= rawData.length}>
                        <ChevronsRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sync Logs */}
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Sync History</CardTitle>
              <CardDescription>Recent sync operations between Google Sheets and Supabase</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Records</TableHead>
                      <TableHead>Triggered By</TableHead>
                      <TableHead>Duration</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {syncLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No sync logs yet. Run your first sync to see history.
                        </TableCell>
                      </TableRow>
                    ) : (
                      syncLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>
                            {new Date(log.started_at).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{log.sync_type}</Badge>
                          </TableCell>
                          <TableCell>
                            {log.status === "completed" && (
                              <Badge variant="default" className="bg-green-600">
                                <CheckCircle2 className="mr-1 h-3 w-3" />
                                Completed
                              </Badge>
                            )}
                            {log.status === "failed" && (
                              <Badge variant="destructive">
                                <XCircle className="mr-1 h-3 w-3" />
                                Failed
                              </Badge>
                            )}
                            {log.status === "in_progress" && (
                              <Badge variant="secondary">
                                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                In Progress
                              </Badge>
                            )}
                            {log.status === "pending" && (
                              <Badge variant="outline">
                                <Clock className="mr-1 h-3 w-3" />
                                Pending
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {log.records_synced || 0}
                            {log.records_failed ? (
                              <span className="text-red-600 ml-1">
                                ({log.records_failed} failed)
                              </span>
                            ) : null}
                          </TableCell>
                          <TableCell>
                            <span className="text-xs text-muted-foreground">
                              {log.triggered_by || "System"}
                            </span>
                          </TableCell>
                          <TableCell>
                            {log.completed_at ? (
                              <span className="text-xs text-muted-foreground">
                                {Math.round(
                                  (new Date(log.completed_at).getTime() -
                                    new Date(log.started_at).getTime()) /
                                    1000
                                )}s
                              </span>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Duplicates Management */}
        <TabsContent value="duplicates">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Copy className="h-5 w-5" />
                    Duplicate Management
                  </CardTitle>
                  <CardDescription>
                    Find and remove duplicate apps in the database. Keeps the oldest record for each product name.
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={checkDuplicates}
                    disabled={checkingDuplicates || removingDuplicates}
                    variant="outline"
                  >
                    {checkingDuplicates ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="mr-2 h-4 w-4" />
                    )}
                    Check for Duplicates
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Success message */}
              {duplicateSuccess && (
                <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800 dark:text-green-200">Success</AlertTitle>
                  <AlertDescription className="text-green-700 dark:text-green-300">
                    {duplicateSuccess}
                  </AlertDescription>
                </Alert>
              )}

              {/* Stats */}
              {duplicateInfo && (
                <>
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{duplicateInfo.totalApps}</div>
                        <p className="text-xs text-muted-foreground">Total Apps</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-yellow-600">
                          {duplicateInfo.duplicateGroups}
                        </div>
                        <p className="text-xs text-muted-foreground">Products with Duplicates</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-red-600">
                          {duplicateInfo.totalDuplicates}
                        </div>
                        <p className="text-xs text-muted-foreground">Records to Remove</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Remove duplicates button */}
                  {duplicateInfo.totalDuplicates > 0 && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="destructive" disabled={removingDuplicates}>
                          {removingDuplicates ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="mr-2 h-4 w-4" />
                          )}
                          Remove {duplicateInfo.totalDuplicates} Duplicate{duplicateInfo.totalDuplicates !== 1 ? "s" : ""}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Remove Duplicate Records</DialogTitle>
                          <DialogDescription>
                            This will permanently delete {duplicateInfo.totalDuplicates} duplicate app record{duplicateInfo.totalDuplicates !== 1 ? "s" : ""}.
                            For each product with duplicates, the oldest record (by creation date) will be kept.
                            This action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button
                            variant="destructive"
                            onClick={removeDuplicates}
                            disabled={removingDuplicates}
                          >
                            {removingDuplicates ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Removing...
                              </>
                            ) : (
                              <>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Confirm Delete
                              </>
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}

                  {duplicateInfo.totalDuplicates === 0 && (
                    <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertTitle className="text-green-800 dark:text-green-200">No Duplicates</AlertTitle>
                      <AlertDescription className="text-green-700 dark:text-green-300">
                        Your database has no duplicate app records. Each product has a single entry.
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Duplicates table */}
                  {duplicateInfo.duplicates.length > 0 && (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Product Name</TableHead>
                            <TableHead className="text-center">Count</TableHead>
                            <TableHead className="text-center">To Remove</TableHead>
                            <TableHead>Keep ID</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {duplicateInfo.duplicates.map((dup, idx) => (
                            <TableRow key={idx}>
                              <TableCell className="font-medium">{dup.product}</TableCell>
                              <TableCell className="text-center">
                                <Badge variant="secondary">{dup.count}</Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge variant="destructive">{dup.remove_ids.length}</Badge>
                              </TableCell>
                              <TableCell>
                                <code className="text-xs bg-muted px-1 py-0.5 rounded">
                                  {dup.keep_id.slice(0, 8)}...
                                </code>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  {duplicateInfo.duplicates.length >= 100 && (
                    <p className="text-sm text-muted-foreground text-center">
                      Showing first 100 of {duplicateInfo.duplicateGroups} duplicate groups
                    </p>
                  )}
                </>
              )}

              {!duplicateInfo && !checkingDuplicates && (
                <div className="text-center py-8 text-muted-foreground">
                  Click &quot;Check for Duplicates&quot; to scan the database for duplicate app records.
                </div>
              )}

              {checkingDuplicates && (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
                  <p className="text-muted-foreground">Scanning for duplicates...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
