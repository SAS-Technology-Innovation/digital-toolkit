"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Edit,
  XCircle,
  Info,
  Download,
  Search,
  MoreHorizontal,
  RefreshCw,
  Loader2,
  FileText,
  Home,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { toast } from "sonner";

// Types
interface RenewalApp {
  id: string;
  product: string;
  vendor: string;
  category: string;
  renewalDate: string;
  annualCost: number;
  licenses: number;
  licenseType: string;
  status: "urgent" | "upcoming" | "overdue" | "active" | "retired";
  division: string;
  utilization: number;
}

interface RenewalData {
  apps: RenewalApp[];
  summary: {
    totalApps: number;
    totalAnnualCost: number;
    urgentCount: number;
    avgUtilization: number;
  };
}

function getStatusColor(status: string) {
  switch (status) {
    case "overdue":
      return "destructive";
    case "urgent":
      return "default";
    case "upcoming":
      return "secondary";
    case "retired":
      return "outline";
    default:
      return "outline";
  }
}

function formatCurrency(amount: number) {
  if (amount === 0) return "Free";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateString: string) {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function RenewalsPage() {
  const [data, setData] = useState<RenewalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  // Modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<RenewalApp | null>(null);
  const [editForm, setEditForm] = useState({
    renewalDate: "",
    annualCost: 0,
    licenses: 0,
    utilization: 0,
  });
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/renewal-data");
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Failed to fetch renewal data:", error);
      toast.error("Failed to load renewal data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter apps
  const filteredApps = data?.apps.filter((app) => {
    const matchesSearch =
      !searchQuery ||
      app.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.vendor.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || app.status === statusFilter;

    return matchesSearch && matchesStatus;
  }) || [];

  // Calculate stats from filtered apps
  const totalCost = filteredApps.reduce((sum, app) => sum + app.annualCost, 0);
  const urgentCount = filteredApps.filter((a) => a.status === "urgent" || a.status === "overdue").length;
  const totalLicenses = filteredApps.reduce((sum, app) => sum + app.licenses, 0);
  const avgUtilization = filteredApps.length > 0
    ? Math.round(filteredApps.reduce((sum, app) => sum + app.utilization, 0) / filteredApps.length)
    : 0;

  // Action handlers
  const handleRenew = async (app: RenewalApp) => {
    setActionLoading(true);
    try {
      // Set renewal date to 1 year from now
      const newRenewalDate = new Date();
      newRenewalDate.setFullYear(newRenewalDate.getFullYear() + 1);

      const response = await fetch(`/api/apps/${app.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          renewal_date: newRenewalDate.toISOString().split("T")[0],
          status: "active",
        }),
      });

      if (!response.ok) throw new Error("Failed to renew");

      toast.success(`${app.product} renewed successfully`);
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Failed to renew:", error);
      toast.error("Failed to renew app");
    } finally {
      setActionLoading(false);
    }
  };

  const handleModify = (app: RenewalApp) => {
    setSelectedApp(app);
    setEditForm({
      renewalDate: app.renewalDate,
      annualCost: app.annualCost,
      licenses: app.licenses,
      utilization: app.utilization,
    });
    setEditModalOpen(true);
  };

  const handleSaveModify = async () => {
    if (!selectedApp) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/apps/${selectedApp.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          renewal_date: editForm.renewalDate,
          annual_cost: editForm.annualCost,
          licenses: editForm.licenses,
          utilization: editForm.utilization,
        }),
      });

      if (!response.ok) throw new Error("Failed to update");

      toast.success(`${selectedApp.product} updated successfully`);
      setEditModalOpen(false);
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Failed to update:", error);
      toast.error("Failed to update app");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRetire = async (app: RenewalApp) => {
    if (!confirm(`Are you sure you want to retire ${app.product}?`)) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/apps/${app.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to retire");

      toast.success(`${app.product} retired successfully`);
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Failed to retire:", error);
      toast.error("Failed to retire app");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">
              <Home className="h-4 w-4" />
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage>Renewals</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-heading">
            APP RENEWALS
          </h1>
          <p className="text-muted-foreground">
            Manage subscription renewals and license costs
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/renewals/submit">
              <FileText className="mr-2 h-4 w-4" />
              Submit Assessment
            </Link>
          </Button>
          <Button variant="outline" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Annual Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalCost)}</div>
            <p className="text-xs text-muted-foreground">
              {filteredApps.length} subscriptions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Requires Attention</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{urgentCount}</div>
            <p className="text-xs text-muted-foreground">
              Urgent or overdue renewals
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Licenses</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLicenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across all subscriptions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Utilization</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgUtilization}%</div>
            <p className="text-xs text-muted-foreground">
              License utilization rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search apps..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="active">Active</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "table" | "cards")}>
          <TabsList>
            <TabsTrigger value="table">Table</TabsTrigger>
            <TabsTrigger value="cards">Cards</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Data Table */}
      {viewMode === "table" ? (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Renewal Date</TableHead>
                <TableHead>Annual Cost</TableHead>
                <TableHead>Licenses</TableHead>
                <TableHead>Utilization</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApps.map((app) => (
                <TableRow key={app.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{app.product}</div>
                      <div className="text-sm text-muted-foreground">{app.vendor}</div>
                    </div>
                  </TableCell>
                  <TableCell>{app.category}</TableCell>
                  <TableCell>{formatDate(app.renewalDate)}</TableCell>
                  <TableCell>{formatCurrency(app.annualCost)}</TableCell>
                  <TableCell>{app.licenses}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            app.utilization >= 80
                              ? "bg-green-500"
                              : app.utilization >= 50
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${app.utilization}%` }}
                        />
                      </div>
                      <span className="text-sm">{app.utilization}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(app.status)}>
                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" disabled={actionLoading}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleRenew(app)}>
                          <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                          Renew (1 Year)
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleModify(app)}>
                          <Edit className="mr-2 h-4 w-4 text-yellow-600" />
                          Modify
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Info className="mr-2 h-4 w-4 text-blue-600" />
                          Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleRetire(app)}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Retire
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredApps.map((app) => (
            <Card key={app.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{app.product}</CardTitle>
                    <CardDescription>{app.vendor}</CardDescription>
                  </div>
                  <Badge variant={getStatusColor(app.status)}>
                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Annual Cost</p>
                    <p className="font-medium">{formatCurrency(app.annualCost)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Renewal Date</p>
                    <p className="font-medium">{formatDate(app.renewalDate)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Licenses</p>
                    <p className="font-medium">{app.licenses}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Utilization</p>
                    <p className="font-medium">{app.utilization}%</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => handleRenew(app)}
                    disabled={actionLoading}
                  >
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Renew
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleModify(app)}
                    disabled={actionLoading}
                  >
                    <Edit className="mr-1 h-3 w-3" />
                    Modify
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredApps.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No renewals found matching your criteria.</p>
        </div>
      )}

      {/* Edit Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modify {selectedApp?.product}</DialogTitle>
            <DialogDescription>
              Update subscription details. Changes will sync to Google Sheets.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="renewalDate" className="text-right">
                Renewal Date
              </Label>
              <Input
                id="renewalDate"
                type="date"
                value={editForm.renewalDate}
                onChange={(e) => setEditForm({ ...editForm, renewalDate: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="annualCost" className="text-right">
                Annual Cost
              </Label>
              <Input
                id="annualCost"
                type="number"
                value={editForm.annualCost}
                onChange={(e) => setEditForm({ ...editForm, annualCost: Number(e.target.value) })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="licenses" className="text-right">
                Licenses
              </Label>
              <Input
                id="licenses"
                type="number"
                value={editForm.licenses}
                onChange={(e) => setEditForm({ ...editForm, licenses: Number(e.target.value) })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="utilization" className="text-right">
                Utilization %
              </Label>
              <Input
                id="utilization"
                type="number"
                min={0}
                max={100}
                value={editForm.utilization}
                onChange={(e) => setEditForm({ ...editForm, utilization: Number(e.target.value) })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveModify} disabled={actionLoading}>
              {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
