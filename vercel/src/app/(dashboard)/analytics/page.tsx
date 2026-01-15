"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  Users,
  DollarSign,
  AppWindow,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  Download,
  Loader2,
  Shield,
  Smartphone,
  Key,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts";

// Analytics API response type
interface AnalyticsData {
  overview: {
    totalApps: number;
    totalCategories: number;
    totalDivisions: number;
    enterpriseApps: number;
    newAppsLast60Days: number;
    totalAnnualCost: number;
    avgUtilization: number;
    totalLicenses: number;
    appsWithSSO: number;
    appsWithMobileApp: number;
  };
  categoryDistribution: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  divisionDistribution: Array<{
    division: string;
    count: number;
    color: string;
  }>;
  utilizationBuckets: Array<{
    range: string;
    count: number;
    color: string;
  }>;
  spendByCategory: Array<{
    category: string;
    spend: number;
  }>;
  topApps: Array<{
    id: string;
    product: string;
    category: string;
    licenses: number;
    utilization: number;
    annual_cost: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    apps: number;
    spend: number;
  }>;
  renewalStats: {
    urgentCount: number;
    upcomingCount: number;
    overdueCount: number;
  };
  userStats: {
    totalUsers: number;
    activeUsers: number;
    adminCount: number;
    ticCount: number;
    approverCount: number;
    staffCount: number;
  };
}

const chartConfig = {
  apps: { label: "Apps Added", color: "#1a2d58" },
  spend: { label: "Spend", color: "#059669" },
};

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("year");
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/analytics")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setAnalytics(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <p className="text-destructive font-semibold mb-2">Error loading analytics</p>
          <p className="text-muted-foreground text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-muted-foreground">No analytics data available</p>
      </div>
    );
  }

  const lowUtilizationCount = analytics.utilizationBuckets.find(b => b.range === "Below 50%")?.count || 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-heading">
            ANALYTICS & INSIGHTS
          </h1>
          <p className="text-muted-foreground">
            Live data from SAS Digital Toolkit - {analytics.overview.totalApps} apps tracked
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Apps</CardTitle>
            <AppWindow className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.totalApps}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3 text-green-600" />
              <span className="text-green-600">+{analytics.overview.newAppsLast60Days}</span> in last 60 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registered Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.userStats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.userStats.activeUsers} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Annual Investment</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${analytics.overview.totalAnnualCost > 0
                ? analytics.overview.totalAnnualCost >= 1000
                  ? `${(analytics.overview.totalAnnualCost / 1000).toFixed(0)}K`
                  : analytics.overview.totalAnnualCost.toLocaleString()
                : "0"}
            </div>
            <p className="text-xs text-muted-foreground">
              Across {analytics.overview.totalCategories} categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Utilization</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.avgUtilization}%</div>
            <p className="text-xs text-muted-foreground">
              License utilization rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Shield className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{analytics.overview.enterpriseApps}</div>
                <div className="text-xs text-muted-foreground">Enterprise Apps</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Key className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{analytics.overview.appsWithSSO}</div>
                <div className="text-xs text-muted-foreground">SSO Enabled</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Smartphone className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{analytics.overview.appsWithMobileApp}</div>
                <div className="text-xs text-muted-foreground">Mobile Apps</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{analytics.overview.totalLicenses.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Total Licenses</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Growth Trends */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Apps Added Over Time</CardTitle>
            <CardDescription>
              Monthly app additions to the toolkit
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-75">
              <AreaChart data={analytics.monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="apps"
                  stroke="#1a2d58"
                  fill="#1a2d58"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Apps by Category</CardTitle>
            <CardDescription>
              Distribution across {analytics.overview.totalCategories} categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.categoryDistribution.slice(0, 8).map((category) => (
                <div key={category.category} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>{category.category}</span>
                    <span className="text-muted-foreground">
                      {category.count} apps ({category.percentage}%)
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${Math.min(category.percentage * 2, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Division Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Apps by Division</CardTitle>
            <CardDescription>
              How apps are distributed across school divisions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {analytics.divisionDistribution.slice(0, 6).map((division) => (
                <div
                  key={division.division}
                  className="p-4 rounded-lg border"
                  style={{ borderLeftColor: division.color, borderLeftWidth: 4 }}
                >
                  <div className="text-2xl font-bold">{division.count}</div>
                  <div className="text-sm text-muted-foreground">
                    {division.division}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Apps & Utilization */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Apps */}
        <Card>
          <CardHeader>
            <CardTitle>Top Apps by Licenses</CardTitle>
            <CardDescription>Apps with the most allocated licenses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topApps.slice(0, 8).map((app, i) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                      {i + 1}
                    </div>
                    <div>
                      <div className="font-medium">{app.product}</div>
                      <div className="text-xs text-muted-foreground">
                        {app.category}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {app.licenses.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {app.utilization}% utilized
                    </div>
                  </div>
                </div>
              ))}
              {analytics.topApps.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No apps with license data available
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* License Utilization */}
        <Card>
          <CardHeader>
            <CardTitle>License Utilization</CardTitle>
            <CardDescription>
              How efficiently licenses are being used
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {analytics.utilizationBuckets.map((item) => (
                  <div
                    key={item.range}
                    className="p-4 rounded-lg"
                    style={{ backgroundColor: `${item.color}15` }}
                  >
                    <div className="text-2xl font-bold" style={{ color: item.color }}>
                      {item.count}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {item.range}
                    </div>
                  </div>
                ))}
              </div>
              {lowUtilizationCount > 0 && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="text-sm text-muted-foreground">
                      <strong>{lowUtilizationCount} apps</strong> have utilization below 50%. Consider
                      reviewing these for potential cost savings or consolidation.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Spend Analysis */}
      {analytics.spendByCategory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Spend by Category</CardTitle>
            <CardDescription>
              Annual software investment breakdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-75">
              <BarChart data={analytics.spendByCategory} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                <XAxis type="number" className="text-xs" tickFormatter={(value) => `$${value / 1000}K`} />
                <YAxis type="category" dataKey="category" className="text-xs" width={120} />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  formatter={(value) => [`$${(value as number).toLocaleString()}`, "Spend"]}
                />
                <Bar dataKey="spend" fill="#1a2d58" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {/* User Roles Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>User Roles Distribution</CardTitle>
          <CardDescription>
            Breakdown of users by role in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <div className="text-2xl font-bold text-blue-700">{analytics.userStats.staffCount}</div>
              <div className="text-sm text-blue-600">Staff</div>
            </div>
            <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
              <div className="text-2xl font-bold text-purple-700">{analytics.userStats.ticCount}</div>
              <div className="text-sm text-purple-600">TIC Members</div>
            </div>
            <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
              <div className="text-2xl font-bold text-amber-700">{analytics.userStats.approverCount}</div>
              <div className="text-sm text-amber-600">Approvers</div>
            </div>
            <div className="p-4 rounded-lg bg-red-50 border border-red-200">
              <div className="text-2xl font-bold text-red-700">{analytics.userStats.adminCount}</div>
              <div className="text-sm text-red-600">Admins</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Renewal Status */}
      <Card>
        <CardHeader>
          <CardTitle>Renewal Status Overview</CardTitle>
          <CardDescription>
            Apps requiring attention for renewal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 rounded-lg bg-red-50 border border-red-200">
              <div className="flex items-center gap-2">
                <ArrowDownRight className="h-5 w-5 text-red-600" />
                <div>
                  <div className="text-2xl font-bold text-red-700">{analytics.renewalStats.overdueCount}</div>
                  <div className="text-sm text-red-600">Overdue</div>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
              <div className="flex items-center gap-2">
                <ArrowUpRight className="h-5 w-5 text-amber-600" />
                <div>
                  <div className="text-2xl font-bold text-amber-700">{analytics.renewalStats.urgentCount}</div>
                  <div className="text-sm text-amber-600">Urgent (30 days)</div>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold text-blue-700">{analytics.renewalStats.upcomingCount}</div>
                  <div className="text-sm text-blue-600">Upcoming (90 days)</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
