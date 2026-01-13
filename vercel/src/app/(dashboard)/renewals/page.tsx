"use client";

import { useState } from "react";
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
  ArrowUpDown,
  MoreHorizontal,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  status: "urgent" | "upcoming" | "overdue" | "active";
  division: string;
  utilization: number;
}

// Mock data
const mockRenewals: RenewalApp[] = [
  {
    id: "1",
    product: "Adobe Creative Cloud",
    vendor: "Adobe",
    category: "Creative",
    renewalDate: "2024-02-15",
    annualCost: 25000,
    licenses: 150,
    licenseType: "Site License",
    status: "urgent",
    division: "Whole School",
    utilization: 85,
  },
  {
    id: "2",
    product: "Canva for Education",
    vendor: "Canva",
    category: "Creative",
    renewalDate: "2024-03-01",
    annualCost: 0,
    licenses: 500,
    licenseType: "Free",
    status: "upcoming",
    division: "Whole School",
    utilization: 92,
  },
  {
    id: "3",
    product: "Zoom Education",
    vendor: "Zoom",
    category: "Communication",
    renewalDate: "2024-04-15",
    annualCost: 15000,
    licenses: 200,
    licenseType: "Enterprise",
    status: "active",
    division: "Whole School",
    utilization: 78,
  },
  {
    id: "4",
    product: "Turnitin",
    vendor: "Turnitin",
    category: "Assessment",
    renewalDate: "2024-01-30",
    annualCost: 8500,
    licenses: 100,
    licenseType: "Per User",
    status: "overdue",
    division: "High School",
    utilization: 65,
  },
  {
    id: "5",
    product: "Seesaw",
    vendor: "Seesaw Learning",
    category: "Portfolio",
    renewalDate: "2024-05-01",
    annualCost: 12000,
    licenses: 300,
    licenseType: "School License",
    status: "active",
    division: "Elementary",
    utilization: 95,
  },
];

function getStatusColor(status: string) {
  switch (status) {
    case "overdue":
      return "destructive";
    case "urgent":
      return "default";
    case "upcoming":
      return "secondary";
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
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function RenewalsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  const filteredApps = mockRenewals.filter((app) => {
    const matchesSearch =
      !searchQuery ||
      app.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.vendor.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || app.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalCost = filteredApps.reduce((sum, app) => sum + app.annualCost, 0);
  const urgentCount = filteredApps.filter((a) => a.status === "urgent" || a.status === "overdue").length;
  const totalLicenses = filteredApps.reduce((sum, app) => sum + app.licenses, 0);
  const avgUtilization = Math.round(
    filteredApps.reduce((sum, app) => sum + app.utilization, 0) / filteredApps.length
  );

  return (
    <div className="p-6 space-y-6">
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
              +2.5% from last year
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
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                          Renew
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4 text-yellow-600" />
                          Modify
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Info className="mr-2 h-4 w-4 text-blue-600" />
                          Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
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
                  <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Renew
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
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
    </div>
  );
}
