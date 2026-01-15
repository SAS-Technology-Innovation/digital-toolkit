import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { App, UserProfile } from "@/lib/supabase/types";

/**
 * API Route: /api/analytics
 * Returns aggregated analytics data from Supabase
 */

interface CategoryCount {
  category: string;
  count: number;
  percentage: number;
}

interface DivisionCount {
  division: string;
  count: number;
  color: string;
}

interface UtilizationBucket {
  range: string;
  count: number;
  color: string;
}

interface SpendByCategory {
  category: string;
  spend: number;
}

interface TopApp {
  id: string;
  product: string;
  category: string;
  licenses: number;
  utilization: number;
  annual_cost: number;
}

interface MonthlyTrend {
  month: string;
  apps: number;
  spend: number;
}

interface AnalyticsResponse {
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
  categoryDistribution: CategoryCount[];
  divisionDistribution: DivisionCount[];
  utilizationBuckets: UtilizationBucket[];
  spendByCategory: SpendByCategory[];
  topApps: TopApp[];
  monthlyTrends: MonthlyTrend[];
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

// Division colors for consistent display
const divisionColors: Record<string, string> = {
  "Whole School": "#fabc00",
  "SAS Elementary School": "#228ec2",
  "SAS Middle School": "#a0192a",
  "SAS High School": "#1a2d58",
  "Elementary": "#228ec2",
  "Middle School": "#a0192a",
  "High School": "#1a2d58",
};

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();

    // Fetch all apps
    const { data: appsData, error: appsError } = await supabase
      .from("apps")
      .select("*")
      .neq("status", "retired");

    const apps = appsData as App[] | null;

    if (appsError) {
      console.error("Error fetching apps:", appsError);
      return NextResponse.json({ error: "Failed to fetch apps" }, { status: 500 });
    }

    // Fetch user profiles
    const { data: usersData, error: usersError } = await supabase
      .from("user_profiles")
      .select("*");

    const users = usersData as UserProfile[] | null;

    if (usersError) {
      console.error("Error fetching users:", usersError);
    }

    // Calculate overview stats
    const totalApps = apps?.length || 0;
    const categories = new Set(apps?.map(a => a.category).filter(Boolean));
    const divisions = new Set(apps?.map(a => a.division).filter(Boolean));
    const enterpriseApps = apps?.filter(a => a.enterprise).length || 0;

    // Apps added in last 60 days
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    const newAppsLast60Days = apps?.filter(a => {
      if (!a.date_added) return false;
      return new Date(a.date_added) >= sixtyDaysAgo;
    }).length || 0;

    const totalAnnualCost = apps?.reduce((sum, a) => sum + (a.annual_cost || 0), 0) || 0;
    const appsWithUtilization = apps?.filter(a => a.utilization != null) || [];
    const avgUtilization = appsWithUtilization.length > 0
      ? Math.round(appsWithUtilization.reduce((sum, a) => sum + (a.utilization || 0), 0) / appsWithUtilization.length)
      : 0;
    const totalLicenses = apps?.reduce((sum, a) => sum + (a.licenses || 0), 0) || 0;
    const appsWithSSO = apps?.filter(a => a.sso_enabled).length || 0;
    const appsWithMobileApp = apps?.filter(a => a.mobile_app).length || 0;

    // Category distribution
    const categoryMap = new Map<string, number>();
    apps?.forEach(app => {
      const cat = app.category || "Uncategorized";
      categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
    });
    const categoryDistribution: CategoryCount[] = Array.from(categoryMap.entries())
      .map(([category, count]) => ({
        category,
        count,
        percentage: totalApps > 0 ? Math.round((count / totalApps) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // Division distribution
    const divisionMap = new Map<string, number>();
    apps?.forEach(app => {
      const div = app.division || "Unassigned";
      divisionMap.set(div, (divisionMap.get(div) || 0) + 1);
    });
    const divisionDistribution: DivisionCount[] = Array.from(divisionMap.entries())
      .map(([division, count]) => ({
        division,
        count,
        color: divisionColors[division] || "#6d6f72",
      }))
      .sort((a, b) => b.count - a.count);

    // Utilization buckets
    const utilizationBuckets: UtilizationBucket[] = [
      { range: "90-100%", count: 0, color: "#059669" },
      { range: "70-89%", count: 0, color: "#fabc00" },
      { range: "50-69%", count: 0, color: "#f59e0b" },
      { range: "Below 50%", count: 0, color: "#dc2626" },
    ];
    apps?.forEach(app => {
      const util = app.utilization;
      if (util == null) return;
      if (util >= 90) utilizationBuckets[0].count++;
      else if (util >= 70) utilizationBuckets[1].count++;
      else if (util >= 50) utilizationBuckets[2].count++;
      else utilizationBuckets[3].count++;
    });

    // Spend by category
    const spendMap = new Map<string, number>();
    apps?.forEach(app => {
      const cat = app.category || "Other";
      spendMap.set(cat, (spendMap.get(cat) || 0) + (app.annual_cost || 0));
    });
    const spendByCategory: SpendByCategory[] = Array.from(spendMap.entries())
      .map(([category, spend]) => ({ category, spend }))
      .filter(item => item.spend > 0)
      .sort((a, b) => b.spend - a.spend)
      .slice(0, 8);

    // Top apps by licenses/utilization
    const topApps: TopApp[] = (apps || [])
      .filter(a => a.licenses && a.licenses > 0)
      .sort((a, b) => (b.licenses || 0) - (a.licenses || 0))
      .slice(0, 10)
      .map(a => ({
        id: a.id,
        product: a.product,
        category: a.category || "Uncategorized",
        licenses: a.licenses || 0,
        utilization: a.utilization || 0,
        annual_cost: a.annual_cost || 0,
      }));

    // Monthly trends (apps by date_added)
    const monthlyMap = new Map<string, { apps: number; spend: number }>();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Initialize last 12 months
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      monthlyMap.set(key, { apps: 0, spend: 0 });
    }

    apps?.forEach(app => {
      if (!app.date_added) return;
      const date = new Date(app.date_added);
      const key = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      if (monthlyMap.has(key)) {
        const current = monthlyMap.get(key)!;
        current.apps++;
        current.spend += app.annual_cost || 0;
      }
    });

    const monthlyTrends: MonthlyTrend[] = Array.from(monthlyMap.entries())
      .map(([month, data]) => ({
        month: month.split(" ")[0], // Just month name
        apps: data.apps,
        spend: data.spend,
      }));

    // Renewal stats
    const today = new Date();
    let urgentCount = 0;
    let upcomingCount = 0;
    let overdueCount = 0;

    apps?.forEach(app => {
      if (!app.renewal_date) return;
      const renewalDate = new Date(app.renewal_date);
      const daysUntil = Math.ceil((renewalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntil < 0) overdueCount++;
      else if (daysUntil <= 30) urgentCount++;
      else if (daysUntil <= 90) upcomingCount++;
    });

    // User stats
    const userStats = {
      totalUsers: users?.length || 0,
      activeUsers: users?.filter(u => u.is_active).length || 0,
      adminCount: users?.filter(u => u.role === "admin").length || 0,
      ticCount: users?.filter(u => u.role === "tic").length || 0,
      approverCount: users?.filter(u => u.role === "approver").length || 0,
      staffCount: users?.filter(u => u.role === "staff").length || 0,
    };

    const response: AnalyticsResponse = {
      overview: {
        totalApps,
        totalCategories: categories.size,
        totalDivisions: divisions.size,
        enterpriseApps,
        newAppsLast60Days,
        totalAnnualCost,
        avgUtilization,
        totalLicenses,
        appsWithSSO,
        appsWithMobileApp,
      },
      categoryDistribution,
      divisionDistribution,
      utilizationBuckets,
      spendByCategory,
      topApps,
      monthlyTrends,
      renewalStats: {
        urgentCount,
        upcomingCount,
        overdueCount,
      },
      userStats,
    };

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "s-maxage=60, stale-while-revalidate=30",
      },
    });
  } catch (error) {
    console.error("Error in analytics API:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 }
    );
  }
}
