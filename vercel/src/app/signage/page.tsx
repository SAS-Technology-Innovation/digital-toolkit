"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  LayoutGrid,
  CalendarClock,
  Key,
  Sparkles,
  Award,
  Building2,
  User,
  Gift,
  Maximize,
} from "lucide-react";
import Image from "next/image";

// Types
interface AppData {
  product: string;
  website?: string;
  renewalDate?: string;
  spend?: number;
  value?: number;
  dateAdded?: string;
  division?: string;
  logoUrl?: string;
  enterprise?: boolean;
  licenseType?: string;
}

interface DivisionData {
  apps: AppData[];
}

interface AllAppData {
  wholeSchool?: DivisionData;
  elementary?: DivisionData;
  middleSchool?: DivisionData;
  highSchool?: DivisionData;
}

interface StatusData {
  summary?: {
    total: number;
    up: number;
    down: number;
    uptime: number;
  };
  statuses?: Record<string, number>;
}

// Configuration
const SLIDE_DURATION = 120000; // 2 minutes per slide
const RECENT_DAYS = 60; // Days to consider "recently added"

// Mock data for demo
const mockAppData: AllAppData = {
  wholeSchool: {
    apps: [
      { product: "Google Workspace", website: "https://workspace.google.com", renewalDate: "2024-06-15", spend: 0, dateAdded: "2023-01-01", division: "Whole School", enterprise: true, licenseType: "Site License" },
      { product: "Canvas LMS", website: "https://canvas.instructure.com", renewalDate: "2024-08-01", spend: 45000, dateAdded: "2023-06-15", division: "Whole School", enterprise: true, licenseType: "Enterprise" },
      { product: "Zoom", website: "https://zoom.us", renewalDate: "2024-04-15", spend: 15000, dateAdded: "2022-03-01", division: "Whole School", enterprise: true, licenseType: "Enterprise" },
    ],
  },
  elementary: {
    apps: [
      { product: "Seesaw", website: "https://web.seesaw.me", renewalDate: "2024-05-01", spend: 12000, dateAdded: "2024-01-05", division: "Elementary", licenseType: "School License" },
      { product: "Epic!", website: "https://getepic.com", renewalDate: "2024-07-15", spend: 3500, dateAdded: "2023-08-20", division: "Elementary", licenseType: "Site License" },
    ],
  },
  middleSchool: {
    apps: [
      { product: "Desmos", website: "https://desmos.com", renewalDate: "2024-09-01", spend: 0, dateAdded: "2023-09-01", division: "Middle School", licenseType: "Free" },
      { product: "Quizlet", website: "https://quizlet.com", renewalDate: "2024-03-15", spend: 2400, dateAdded: "2023-11-15", division: "Middle School", licenseType: "Individual" },
    ],
  },
  highSchool: {
    apps: [
      { product: "Turnitin", website: "https://turnitin.com", renewalDate: "2024-02-28", spend: 8500, dateAdded: "2022-08-01", division: "High School", enterprise: true, licenseType: "Enterprise" },
      { product: "Adobe Creative Cloud", website: "https://adobe.com", renewalDate: "2024-02-15", spend: 25000, dateAdded: "2023-02-01", division: "High School", enterprise: true, licenseType: "Site License" },
    ],
  },
};

const mockStatusData: StatusData = {
  summary: {
    total: 42,
    up: 40,
    down: 2,
    uptime: 98.5,
  },
  statuses: {
    "Google Workspace": 1,
    "Canvas LMS": 1,
    "Zoom": 0, // Down
    "Seesaw": 1,
    "Turnitin": 0, // Down
    "Adobe Creative Cloud": 1,
  },
};

function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `$${Math.round(amount / 1000)}K`;
  }
  return `$${amount}`;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function SignagePage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentSlide, setCurrentSlide] = useState(0);
  const [appData] = useState<AllAppData>(mockAppData);
  const [statusData] = useState<StatusData>(mockStatusData);

  const totalSlides = 3;

  // Clock update
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Slide rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, SLIDE_DURATION);
    return () => clearInterval(interval);
  }, []);

  // Request fullscreen
  const requestFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  }, []);

  // Get all apps from all divisions
  const getAllApps = useCallback((): AppData[] => {
    const apps: AppData[] = [];
    const seen = new Set<string>();
    const divisions: (keyof AllAppData)[] = ["wholeSchool", "elementary", "middleSchool", "highSchool"];

    divisions.forEach((division) => {
      const divData = appData[division];
      if (divData?.apps) {
        divData.apps.forEach((app) => {
          if (!seen.has(app.product)) {
            seen.add(app.product);
            apps.push(app);
          }
        });
      }
    });

    return apps;
  }, [appData]);

  // Get down apps
  const getDownApps = useCallback((): AppData[] => {
    const allApps = getAllApps();
    return allApps.filter((app) => statusData.statuses?.[app.product] === 0);
  }, [getAllApps, statusData]);

  // Get upcoming renewals
  const getUpcomingRenewals = useCallback(() => {
    const allApps = getAllApps();
    const now = new Date();
    const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const ninetyDays = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    let count30 = 0;
    let count90 = 0;
    let totalSpend = 0;
    const upcoming: (AppData & { urgency: string })[] = [];

    allApps.forEach((app) => {
      if (!app.renewalDate) return;
      const renewalDate = new Date(app.renewalDate);
      const spend = app.spend || app.value || 0;
      totalSpend += spend;

      if (renewalDate <= thirtyDays && renewalDate >= now) {
        count30++;
        upcoming.push({ ...app, urgency: "urgent" });
      } else if (renewalDate <= ninetyDays && renewalDate >= now) {
        count90++;
        upcoming.push({ ...app, urgency: "soon" });
      }
    });

    upcoming.sort((a, b) => new Date(a.renewalDate!).getTime() - new Date(b.renewalDate!).getTime());

    return { count30, count90, totalSpend, upcoming };
  }, [getAllApps]);

  // Get recent apps
  const getRecentApps = useCallback((): AppData[] => {
    const allApps = getAllApps();
    const now = new Date();
    const thresholdDate = new Date(now.getTime() - RECENT_DAYS * 24 * 60 * 60 * 1000);

    return allApps
      .filter((app) => {
        if (!app.dateAdded) return false;
        return new Date(app.dateAdded) >= thresholdDate;
      })
      .sort((a, b) => new Date(b.dateAdded!).getTime() - new Date(a.dateAdded!).getTime());
  }, [getAllApps]);

  // Get license counts
  const getLicenseCounts = useCallback(() => {
    const allApps = getAllApps();
    let enterprise = 0;
    let site = 0;
    let individual = 0;
    let free = 0;

    allApps.forEach((app) => {
      if (app.enterprise) enterprise++;
      const licenseType = (app.licenseType || "").toLowerCase();
      if (licenseType.includes("site") || licenseType.includes("school") || licenseType.includes("enterprise")) {
        site++;
      } else if (licenseType.includes("individual")) {
        individual++;
      } else if (licenseType.includes("free") || licenseType === "") {
        free++;
      }
    });

    return { enterprise, site, individual, free };
  }, [getAllApps]);

  const downApps = getDownApps();
  const renewals = getUpcomingRenewals();
  const recentApps = getRecentApps();
  const licenseCounts = getLicenseCounts();
  const summary = statusData.summary || { total: 0, up: 0, down: 0, uptime: 0 };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-[#1a2d58] to-[#0f1a33] text-white overflow-hidden font-sans"
      onClick={requestFullscreen}
    >
      {/* Header */}
      <header className="bg-black/30 px-8 py-4 flex justify-between items-center border-b border-white/10">
        <div className="flex items-center gap-4">
          <Image
            src="/sas-logo-white.png"
            alt="SAS"
            width={48}
            height={48}
            className="h-12 w-auto"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          <h1 className="font-heading text-2xl tracking-widest text-[#fabc00]">
            EDTECH TEAM DASHBOARD
          </h1>
        </div>
        <div className="flex items-center gap-6 text-sm opacity-80">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span>LIVE</span>
          </div>
          <div className="opacity-70">
            {currentTime.toLocaleDateString("en-US", {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
          </div>
          <div className="text-2xl font-semibold">
            {currentTime.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
          </div>
        </div>
      </header>

      {/* Slides Container */}
      <main className="relative h-[calc(100vh-88px)]">
        {/* Slide 1: Status Overview & Down Detector */}
        <div
          className={`absolute inset-0 p-6 grid grid-cols-2 gap-5 transition-all duration-800 ${
            currentSlide === 0 ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-full"
          }`}
        >
          {/* Status Panel */}
          <section className="col-span-2 bg-white/8 backdrop-blur-md rounded-2xl p-8 border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-wider opacity-90">
                <Activity className="w-6 h-6 opacity-70" />
                System Status
              </div>
              <span
                className={`text-sm px-4 py-1.5 rounded-full font-semibold ${
                  summary.down > 0
                    ? "bg-red-500/20 text-red-400"
                    : "bg-emerald-500/20 text-emerald-400"
                }`}
              >
                {summary.down > 0 ? `${summary.down} Issue${summary.down > 1 ? "s" : ""}` : "All Operational"}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-6">
              <div className="text-center p-6 bg-black/20 rounded-xl">
                <div className="text-5xl font-bold">{summary.total}</div>
                <div className="text-sm uppercase tracking-wide opacity-70 mt-3">Total Apps</div>
              </div>
              <div className="text-center p-6 bg-black/20 rounded-xl">
                <div className="text-5xl font-bold text-emerald-400">{summary.up}</div>
                <div className="text-sm uppercase tracking-wide opacity-70 mt-3">Online</div>
              </div>
              <div className="text-center p-6 bg-black/20 rounded-xl">
                <div className="text-5xl font-bold text-red-400">{summary.down}</div>
                <div className="text-sm uppercase tracking-wide opacity-70 mt-3">Issues</div>
              </div>
              <div className="text-center p-6 bg-black/20 rounded-xl">
                <div className={`text-5xl font-bold ${summary.uptime >= 99 ? "text-emerald-400" : summary.uptime >= 95 ? "text-yellow-400" : "text-red-400"}`}>
                  {summary.uptime}%
                </div>
                <div className="text-sm uppercase tracking-wide opacity-70 mt-3">Uptime</div>
              </div>
            </div>
          </section>

          {/* Down Detector Panel */}
          <section className="bg-white/8 backdrop-blur-md rounded-2xl p-8 border border-white/10">
            <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-wider opacity-90 mb-6">
              <AlertTriangle className="w-6 h-6 opacity-70" />
              Down Detector
            </div>
            {downApps.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[calc(100%-60px)] text-center">
                <CheckCircle2 className="w-24 h-24 text-emerald-400 mb-4" />
                <h3 className="text-2xl font-semibold mb-2">All Systems Operational</h3>
                <p className="opacity-70 text-lg">No issues detected</p>
              </div>
            ) : (
              <ul className="space-y-3 overflow-y-auto max-h-[calc(100%-60px)]">
                {downApps.slice(0, 8).map((app) => (
                  <li
                    key={app.product}
                    className="flex items-center gap-4 p-5 bg-red-500/15 rounded-lg border-l-4 border-red-500"
                  >
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <span className="font-semibold flex-1">{app.product}</span>
                    <span className="text-sm opacity-60 truncate max-w-48">{app.website}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Division Panel */}
          <section className="bg-white/8 backdrop-blur-md rounded-2xl p-8 border border-white/10">
            <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-wider opacity-90 mb-6">
              <LayoutGrid className="w-6 h-6 opacity-70" />
              Apps by Division
            </div>
            <div className="grid grid-cols-4 gap-4 h-[calc(100%-60px)]">
              <div className="flex flex-col items-center justify-center p-5 rounded-xl bg-gradient-to-br from-[#fabc00]/30 to-[#fabc00]/10 border border-[#fabc00]/30">
                <div className="text-6xl font-bold">{appData.wholeSchool?.apps?.length || 0}</div>
                <div className="text-sm uppercase tracking-wide opacity-80 mt-3">Whole School</div>
              </div>
              <div className="flex flex-col items-center justify-center p-5 rounded-xl bg-gradient-to-br from-[#228ec2]/30 to-[#228ec2]/10 border border-[#228ec2]/30">
                <div className="text-6xl font-bold">{appData.elementary?.apps?.length || 0}</div>
                <div className="text-sm uppercase tracking-wide opacity-80 mt-3">Elementary</div>
              </div>
              <div className="flex flex-col items-center justify-center p-5 rounded-xl bg-gradient-to-br from-[#a0192a]/30 to-[#a0192a]/10 border border-[#a0192a]/30">
                <div className="text-6xl font-bold">{appData.middleSchool?.apps?.length || 0}</div>
                <div className="text-sm uppercase tracking-wide opacity-80 mt-3">Middle School</div>
              </div>
              <div className="flex flex-col items-center justify-center p-5 rounded-xl bg-gradient-to-br from-[#1a2d58]/50 to-[#1a2d58]/20 border border-[#1a2d58]/50">
                <div className="text-6xl font-bold">{appData.highSchool?.apps?.length || 0}</div>
                <div className="text-sm uppercase tracking-wide opacity-80 mt-3">High School</div>
              </div>
            </div>
          </section>
        </div>

        {/* Slide 2: Renewals & License */}
        <div
          className={`absolute inset-0 p-6 grid grid-cols-2 gap-5 transition-all duration-800 ${
            currentSlide === 1 ? "opacity-100 translate-x-0" : currentSlide > 1 ? "opacity-0 -translate-x-full" : "opacity-0 translate-x-full"
          }`}
        >
          {/* Renewals Panel */}
          <section className="col-span-2 bg-white/8 backdrop-blur-md rounded-2xl p-8 border border-white/10">
            <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-wider opacity-90 mb-6">
              <CalendarClock className="w-6 h-6 opacity-70" />
              Upcoming Renewals
            </div>
            <div className="grid grid-cols-3 gap-6 mb-6">
              <div className="text-center p-4 bg-black/20 rounded-xl">
                <div className="text-4xl font-bold text-[#fabc00]">{renewals.count30}</div>
                <div className="text-sm uppercase tracking-wide opacity-70 mt-2">Next 30 Days</div>
              </div>
              <div className="text-center p-4 bg-black/20 rounded-xl">
                <div className="text-4xl font-bold text-[#fabc00]">{renewals.count90}</div>
                <div className="text-sm uppercase tracking-wide opacity-70 mt-2">Next 90 Days</div>
              </div>
              <div className="text-center p-4 bg-black/20 rounded-xl">
                <div className="text-4xl font-bold text-[#fabc00]">{formatCurrency(renewals.totalSpend)}</div>
                <div className="text-sm uppercase tracking-wide opacity-70 mt-2">Est. Annual Spend</div>
              </div>
            </div>
            <ul className="space-y-2 overflow-y-auto max-h-40">
              {renewals.upcoming.length === 0 ? (
                <li className="text-center opacity-50 py-5">No upcoming renewals</li>
              ) : (
                renewals.upcoming.slice(0, 8).map((app) => (
                  <li
                    key={app.product}
                    className="flex items-center justify-between p-4 bg-black/15 rounded-lg text-lg"
                  >
                    <span className="font-medium">{app.product}</span>
                    <span
                      className={`text-sm px-3 py-1 rounded-full font-semibold ${
                        app.urgency === "urgent"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {formatDate(new Date(app.renewalDate!))}
                    </span>
                  </li>
                ))
              )}
            </ul>
          </section>

          {/* License Panel */}
          <section className="col-span-2 bg-white/8 backdrop-blur-md rounded-2xl p-8 border border-white/10">
            <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-wider opacity-90 mb-6">
              <Key className="w-6 h-6 opacity-70" />
              License Overview
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-2 flex items-center gap-4 p-6 rounded-xl bg-gradient-to-br from-[#fabc00]/25 to-[#fabc00]/10 border border-[#fabc00]/30">
                <Award className="w-8 h-8 opacity-70" />
                <div>
                  <div className="text-4xl font-bold text-[#fabc00]">{licenseCounts.enterprise}</div>
                  <div className="text-sm uppercase opacity-60">Enterprise Apps</div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-6 bg-black/20 rounded-xl">
                <Building2 className="w-6 h-6 opacity-70" />
                <div>
                  <div className="text-3xl font-bold">{licenseCounts.site}</div>
                  <div className="text-sm uppercase opacity-60">Site Licenses</div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-6 bg-black/20 rounded-xl">
                <User className="w-6 h-6 opacity-70" />
                <div>
                  <div className="text-3xl font-bold">{licenseCounts.individual}</div>
                  <div className="text-sm uppercase opacity-60">Individual</div>
                </div>
              </div>
              <div className="col-span-2" />
              <div className="flex items-center gap-4 p-6 bg-black/20 rounded-xl">
                <Gift className="w-6 h-6 opacity-70" />
                <div>
                  <div className="text-3xl font-bold">{licenseCounts.free}</div>
                  <div className="text-sm uppercase opacity-60">Free Apps</div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Slide 3: Recent Activity */}
        <div
          className={`absolute inset-0 p-6 grid gap-5 transition-all duration-800 ${
            currentSlide === 2 ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full"
          }`}
        >
          <section className="bg-white/8 backdrop-blur-md rounded-2xl p-8 border border-white/10 h-full">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-wider opacity-90">
                <Sparkles className="w-6 h-6 opacity-70" />
                Recently Added Apps
              </div>
              <span className="text-sm px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold">
                {recentApps.length} new
              </span>
            </div>
            {recentApps.length === 0 ? (
              <div className="text-center opacity-50 py-12">No recent additions</div>
            ) : (
              <ul className="space-y-3 overflow-y-auto max-h-[calc(100%-80px)]">
                {recentApps.slice(0, 10).map((app) => (
                  <li
                    key={app.product}
                    className="flex items-center gap-4 p-5 bg-black/15 rounded-lg text-lg"
                  >
                    {app.logoUrl && (
                      <Image
                        src={app.logoUrl}
                        alt=""
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-lg object-contain bg-white p-1"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    )}
                    <div className="flex-1">
                      <div className="font-semibold">{app.product}</div>
                      <div className="text-sm opacity-60">{app.division}</div>
                    </div>
                    <span className="text-sm px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold">
                      {formatDate(new Date(app.dateAdded!))}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>

      {/* Progress Indicator */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 flex gap-3 z-50">
        {[0, 1, 2].map((index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              currentSlide === index
                ? "bg-[#fabc00] scale-125"
                : "bg-white/30 hover:bg-white/50"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Fullscreen Hint */}
      <div className="fixed bottom-16 left-1/2 -translate-x-1/2 text-sm opacity-50 flex items-center gap-2">
        <Maximize className="w-4 h-4" />
        Click anywhere for fullscreen
      </div>
    </div>
  );
}
