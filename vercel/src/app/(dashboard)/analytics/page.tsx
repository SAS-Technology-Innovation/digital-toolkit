"use client";

import { useState } from "react";
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  DollarSign,
  AppWindow,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  Download,
  Filter,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart as RechartsPieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

// Mock data for analytics
const overviewStats = {
  totalApps: 127,
  totalCategories: 12,
  totalDivisions: 4,
  totalUsers: 3500,
  annualSpend: 285000,
  avgUtilization: 78,
};

const monthlyTrends = [
  { month: "Jan", apps: 98, users: 2800, spend: 22000 },
  { month: "Feb", apps: 102, users: 2950, spend: 23000 },
  { month: "Mar", apps: 108, users: 3100, spend: 23500 },
  { month: "Apr", apps: 112, users: 3200, spend: 24000 },
  { month: "May", apps: 118, users: 3350, spend: 24500 },
  { month: "Jun", apps: 121, users: 3400, spend: 23800 },
  { month: "Jul", apps: 119, users: 3250, spend: 22500 },
  { month: "Aug", apps: 124, users: 3450, spend: 24200 },
  { month: "Sep", apps: 127, users: 3500, spend: 25000 },
];

const categoryData = [
  { name: "Productivity", count: 24, percentage: 19 },
  { name: "Learning Management", count: 18, percentage: 14 },
  { name: "Creative", count: 22, percentage: 17 },
  { name: "STEM", count: 15, percentage: 12 },
  { name: "Assessment", count: 20, percentage: 16 },
  { name: "Communication", count: 12, percentage: 9 },
  { name: "Other", count: 16, percentage: 13 },
];

const divisionData = [
  { name: "Whole School", count: 45, color: "#fabc00" },
  { name: "Elementary", count: 32, color: "#228ec2" },
  { name: "Middle School", count: 25, color: "#a0192a" },
  { name: "High School", count: 25, color: "#1a2d58" },
];

const topApps = [
  { name: "Google Workspace", users: 3450, category: "Productivity", trend: 5.2 },
  { name: "Canvas LMS", users: 3200, category: "Learning Management", trend: 3.8 },
  { name: "Zoom", users: 2800, category: "Communication", trend: -2.1 },
  { name: "Canva", users: 2650, category: "Creative", trend: 12.5 },
  { name: "Seesaw", users: 1850, category: "Portfolio", trend: 8.3 },
  { name: "Kahoot!", users: 1620, category: "Assessment", trend: 4.1 },
  { name: "Desmos", users: 1450, category: "STEM", trend: 6.7 },
  { name: "Padlet", users: 1280, category: "Collaboration", trend: 2.3 },
];

const utilizationData = [
  { range: "90-100%", count: 28, color: "#059669" },
  { range: "70-89%", count: 45, color: "#fabc00" },
  { range: "50-69%", count: 32, color: "#f59e0b" },
  { range: "Below 50%", count: 22, color: "#dc2626" },
];

const spendByCategory = [
  { category: "Learning Management", spend: 85000 },
  { category: "Creative", spend: 65000 },
  { category: "Assessment", spend: 45000 },
  { category: "Productivity", spend: 35000 },
  { category: "Communication", spend: 30000 },
  { category: "Other", spend: 25000 },
];

const chartConfig = {
  apps: { label: "Apps", color: "#1a2d58" },
  users: { label: "Users", color: "#fabc00" },
  spend: { label: "Spend", color: "#059669" },
};

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("year");

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-heading">
            ANALYTICS & INSIGHTS
          </h1>
          <p className="text-muted-foreground">
            Understand how tools and apps are used across SAS
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
            <div className="text-2xl font-bold">{overviewStats.totalApps}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3 text-green-600" />
              <span className="text-green-600">+12</span> from last year
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overviewStats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across all divisions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Annual Spend</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(overviewStats.annualSpend / 1000).toFixed(0)}K
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <ArrowDownRight className="h-3 w-3 text-green-600" />
              <span className="text-green-600">-5%</span> from last year
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Utilization</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overviewStats.avgUtilization}%</div>
            <p className="text-xs text-muted-foreground">
              License utilization rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Growth Trends */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Growth Trends</CardTitle>
            <CardDescription>
              App adoption and user engagement over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-75">
              <AreaChart data={monthlyTrends}>
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
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="#fabc00"
                  fill="#fabc00"
                  fillOpacity={0.1}
                  strokeWidth={2}
                  yAxisId={0}
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
              Distribution across {overviewStats.totalCategories} categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryData.map((category) => (
                <div key={category.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>{category.name}</span>
                    <span className="text-muted-foreground">
                      {category.count} apps ({category.percentage}%)
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${category.percentage}%` }}
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
              {divisionData.map((division) => (
                <div
                  key={division.name}
                  className="p-4 rounded-lg border"
                  style={{ borderLeftColor: division.color, borderLeftWidth: 4 }}
                >
                  <div className="text-2xl font-bold">{division.count}</div>
                  <div className="text-sm text-muted-foreground">
                    {division.name}
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
            <CardTitle>Most Used Apps</CardTitle>
            <CardDescription>Ranked by active users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topApps.map((app, i) => (
                <div
                  key={app.name}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                      {i + 1}
                    </div>
                    <div>
                      <div className="font-medium">{app.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {app.category}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {app.users.toLocaleString()}
                    </div>
                    <div
                      className={`text-xs flex items-center justify-end gap-1 ${
                        app.trend > 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {app.trend > 0 ? (
                        <ArrowUpRight className="h-3 w-3" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3" />
                      )}
                      {Math.abs(app.trend)}%
                    </div>
                  </div>
                </div>
              ))}
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
                {utilizationData.map((item) => (
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
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="text-sm text-muted-foreground">
                    <strong>22 apps</strong> have utilization below 50%. Consider
                    reviewing these for potential cost savings or consolidation.
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Spend Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Spend by Category</CardTitle>
          <CardDescription>
            Annual software investment breakdown
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-75">
            <BarChart data={spendByCategory} layout="vertical">
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
    </div>
  );
}
