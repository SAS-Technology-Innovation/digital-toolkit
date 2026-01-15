"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Mail,
  Loader2,
  CheckCircle,
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
  AppWindow,
  Calendar,
  BarChart3,
  Users,
  Shield,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth/auth-context";
import Link from "next/link";

const features = [
  {
    icon: AppWindow,
    title: "App Catalog",
    description: "Browse 100+ approved educational applications organized by division and department",
  },
  {
    icon: Calendar,
    title: "Renewal Management",
    description: "Track subscriptions and participate in the annual app renewal process",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description: "View usage insights and make data-driven decisions about EdTech tools",
  },
  {
    icon: Users,
    title: "Collaboration",
    description: "Share feedback with TICs and contribute to renewal decisions",
  },
];

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"magic-link" | "password">("magic-link");
  const { signInWithMagicLink, signInWithPassword } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirectTo = searchParams.get("redirectTo") || "/";

  const validateEmail = (email: string): boolean => {
    if (!email.endsWith("@sas.edu.sg")) {
      setError("Please use your @sas.edu.sg email address");
      return false;
    }
    return true;
  };

  const handleMagicLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!validateEmail(email)) {
      setLoading(false);
      return;
    }

    const { error } = await signInWithMagicLink(email);

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!validateEmail(email)) {
      setLoading(false);
      return;
    }

    if (!password) {
      setError("Please enter your password");
      setLoading(false);
      return;
    }

    const { error } = await signInWithPassword(email, password);

    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        setError("Invalid email or password. Please try again.");
      } else if (error.message.includes("Email not confirmed")) {
        setError("Please verify your email before signing in.");
      } else {
        setError(error.message);
      }
      setLoading(false);
      return;
    }

    router.push(redirectTo);
  };

  if (sent) {
    return (
      <Card className="w-full">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Check your email</CardTitle>
          <CardDescription>
            We sent a magic link to <strong>{email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Click the link in the email to sign in. The link will expire in 1 hour.
          </p>
          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() => {
                setSent(false);
                setEmail("");
              }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Use a different email
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-xl">Sign In</CardTitle>
        <CardDescription>
          Use your SAS email to access all features
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "magic-link" | "password")}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="magic-link">Magic Link</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
          </TabsList>

          <TabsContent value="magic-link">
            <form onSubmit={handleMagicLinkSubmit} className="space-y-4">
              {error && activeTab === "magic-link" && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email-magic">Email</Label>
                <Input
                  id="email-magic"
                  type="email"
                  placeholder="your.name@sas.edu.sg"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(null);
                  }}
                  required
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  We&apos;ll send you a magic link to sign in
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending magic link...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Send magic link
                  </>
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="password">
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {error && activeTab === "password" && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email-password">Email</Label>
                <Input
                  id="email-password"
                  type="email"
                  placeholder="your.name@sas.edu.sg"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(null);
                  }}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/reset-password"
                    className="text-xs text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError(null);
                    }}
                    required
                    disabled={loading}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Sign in
                  </>
                )}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="text-primary hover:underline">
                  Create one
                </Link>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function LoginSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4">
      <div className="w-full max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <div className="h-12 w-48 bg-muted rounded animate-pulse" />
            <div className="h-8 w-96 bg-muted rounded animate-pulse" />
            <div className="h-4 w-80 bg-muted rounded animate-pulse" />
          </div>
          <Card className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto">
            <CardHeader className="text-center">
              <div className="h-6 w-32 mx-auto bg-muted rounded animate-pulse" />
              <div className="h-4 w-48 mx-auto mt-2 bg-muted rounded animate-pulse" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-10 bg-muted rounded animate-pulse" />
              <div className="h-10 bg-muted rounded animate-pulse" />
              <div className="h-10 bg-muted rounded animate-pulse" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10">
        {/* Header */}
        <header className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <img
              src="/assets/sas-logo-icon.png"
              alt="SAS Logo"
              className="h-10 w-auto"
            />
            <span className="font-heading text-xl font-bold text-primary">
              SAS DIGITAL TOOLKIT
            </span>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8 lg:py-16">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Hero Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="mb-2">
                  <Sparkles className="w-3 h-3 mr-1" />
                  For SAS Staff & Teachers
                </Badge>
                <h1 className="text-4xl lg:text-5xl font-bold font-heading tracking-tight text-primary">
                  YOUR EDTECH
                  <br />
                  <span className="text-destructive">COMMAND CENTER</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-lg">
                  Discover, manage, and evaluate educational technology applications
                  across Singapore American School. All your EdTech tools in one place.
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid sm:grid-cols-2 gap-4">
                {features.map((feature) => (
                  <div
                    key={feature.title}
                    className="flex gap-3 p-4 rounded-lg bg-card border hover:border-primary/50 transition-colors"
                  >
                    <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <feature.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{feature.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Access Info */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="w-4 h-4" />
                <span>
                  Secure access for <strong>@sas.edu.sg</strong> email addresses only
                </span>
              </div>
            </div>

            {/* Right: Login Form */}
            <div className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto">
              <LoginForm />

              {/* Guest Access */}
              <div className="mt-4 text-center">
                <Link
                  href="/"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Continue as guest →
                </Link>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="container mx-auto px-4 py-8 mt-8 border-t">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Singapore American School Technology & Innovation</p>
            <div className="flex gap-4">
              <Link href="/about" className="hover:text-foreground transition-colors">
                About
              </Link>
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">
                Terms
              </Link>
              <Link href="/help" className="hover:text-foreground transition-colors">
                Help
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </Suspense>
  );
}
