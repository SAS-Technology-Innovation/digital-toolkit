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
  ChevronDown,
  ChevronUp,
  Search,
  Download,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
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
import { createClient } from "@/lib/supabase/client";
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
  const [sortField, setSortField] = useState<keyof App>("product");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

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

  // Fetch raw data from Apps Script
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

  // Sort handler
  const handleSort = (field: keyof App) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Filter and sort apps
  const filteredApps = apps
    .filter((app) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        app.product?.toLowerCase().includes(query) ||
        app.category?.toLowerCase().includes(query) ||
        app.vendor?.toLowerCase().includes(query) ||
        app.division?.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      const comparison = String(aVal).localeCompare(String(bVal));
      return sortDirection === "asc" ? comparison : -comparison;
    });

  // Export to CSV
  const exportToCsv = () => {
    const headers = ["Product", "Category", "Division", "Vendor", "Annual Cost", "Licenses", "Renewal Date"];
    const rows = filteredApps.map((app) => [
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

  const SortIcon = ({ field }: { field: keyof App }) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ChevronUp className="ml-1 h-4 w-4 inline" />
    ) : (
      <ChevronDown className="ml-1 h-4 w-4 inline" />
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-heading">ADMIN</h1>
          <p className="text-muted-foreground">
            Manage data sync and view raw data from Apps Script
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
                <p className="text-xs text-muted-foreground">Apps in Apps Script</p>
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
          <TabsTrigger value="raw">Raw Apps Script Data</TabsTrigger>
          <TabsTrigger value="logs">Sync Logs</TabsTrigger>
        </TabsList>

        {/* Supabase Data Table */}
        <TabsContent value="supabase">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Apps in Supabase</CardTitle>
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
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleSort("product")}
                        >
                          Product <SortIcon field="product" />
                        </TableHead>
                        <TableHead
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleSort("category")}
                        >
                          Category <SortIcon field="category" />
                        </TableHead>
                        <TableHead
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleSort("division")}
                        >
                          Division <SortIcon field="division" />
                        </TableHead>
                        <TableHead
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleSort("vendor")}
                        >
                          Vendor <SortIcon field="vendor" />
                        </TableHead>
                        <TableHead className="text-right">Annual Cost</TableHead>
                        <TableHead className="text-right">Licenses</TableHead>
                        <TableHead>Synced</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredApps.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            No apps found. Run a sync to populate data.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredApps.slice(0, 50).map((app) => (
                          <TableRow key={app.id}>
                            <TableCell className="font-medium">{app.product}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{app.category || "N/A"}</Badge>
                            </TableCell>
                            <TableCell>{app.division || "N/A"}</TableCell>
                            <TableCell>{app.vendor || "N/A"}</TableCell>
                            <TableCell className="text-right">
                              {app.annual_cost
                                ? `$${Number(app.annual_cost).toLocaleString()}`
                                : "Free"}
                            </TableCell>
                            <TableCell className="text-right">{app.licenses || "-"}</TableCell>
                            <TableCell>
                              {app.synced_at ? (
                                <span className="text-xs text-muted-foreground">
                                  {new Date(app.synced_at).toLocaleDateString()}
                                </span>
                              ) : (
                                <span className="text-xs text-yellow-600">Never</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
              {filteredApps.length > 50 && (
                <p className="text-sm text-muted-foreground mt-4 text-center">
                  Showing 50 of {filteredApps.length} apps
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Raw Apps Script Data */}
        <TabsContent value="raw">
          <Card>
            <CardHeader>
              <CardTitle>Raw Data from Apps Script</CardTitle>
              <CardDescription>
                This is the data coming directly from Google Sheets before it&apos;s synced to Supabase
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
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
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
                            No raw data available. Check Apps Script connection.
                          </TableCell>
                        </TableRow>
                      ) : (
                        rawData.slice(0, 50).map((app, idx) => (
                          <TableRow key={app.id || idx}>
                            <TableCell className="font-medium">{app.product}</TableCell>
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
              )}
              {rawData.length > 50 && (
                <p className="text-sm text-muted-foreground mt-4 text-center">
                  Showing 50 of {rawData.length} apps
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sync Logs */}
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Sync History</CardTitle>
              <CardDescription>Recent sync operations between Apps Script and Supabase</CardDescription>
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
      </Tabs>
    </div>
  );
}
