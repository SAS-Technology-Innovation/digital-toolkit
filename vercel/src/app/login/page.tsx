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
import { useAuth } from "@/lib/auth/auth-context";
import Link from "next/link";

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
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center pb-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <CardTitle className="text-xl">Check your email</CardTitle>
          <CardDescription>
            Magic link sent to <strong>{email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground text-center mb-4">
            Click the link in the email to sign in.
          </p>
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => {
              setSent(false);
              setEmail("");
            }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Use a different email
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-xl">Sign In</CardTitle>
        <CardDescription>
          Use your @sas.edu.sg email
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "magic-link" | "password")}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="magic-link">Magic Link</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
          </TabsList>

          <TabsContent value="magic-link" className="mt-0">
            <form onSubmit={handleMagicLinkSubmit} className="space-y-3">
              {error && activeTab === "magic-link" && (
                <Alert variant="destructive" className="py-2">
                  <AlertDescription className="text-sm">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email-magic" className="text-sm">Email</Label>
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
                  className="h-9"
                />
              </div>

              <Button type="submit" className="w-full h-9" disabled={loading}>
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Send magic link
                  </>
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="password" className="mt-0">
            <form onSubmit={handlePasswordSubmit} className="space-y-3">
              {error && activeTab === "password" && (
                <Alert variant="destructive" className="py-2">
                  <AlertDescription className="text-sm">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email-password" className="text-sm">Email</Label>
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
                  className="h-9"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm">Password</Label>
                  <Link
                    href="/reset-password"
                    className="text-xs text-primary hover:underline"
                  >
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError(null);
                    }}
                    required
                    disabled={loading}
                    className="h-9 pr-9"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-9 w-9 hover:bg-transparent"
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

              <Button type="submit" className="w-full h-9" disabled={loading}>
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Sign in
                  </>
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                No account?{" "}
                <Link href="/register" className="text-primary hover:underline">
                  Create one
                </Link>
              </p>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function LoginSkeleton() {
  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="h-5 w-24 mx-auto bg-muted rounded animate-pulse" />
          <div className="h-4 w-40 mx-auto mt-2 bg-muted rounded animate-pulse" />
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="h-9 bg-muted rounded animate-pulse" />
          <div className="h-9 bg-muted rounded animate-pulse" />
          <div className="h-9 bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <div className="h-screen flex flex-col bg-gradient-to-br from-primary/5 via-background to-primary/10">
        {/* Main Content - Centered */}
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left: Branding */}
            <div className="text-center lg:text-left space-y-4">
              <div className="flex items-center justify-center lg:justify-start gap-3">
                <img
                  src="/assets/sas-logo-icon.png"
                  alt="SAS Logo"
                  className="h-12 w-auto"
                />
                <div>
                  <h1 className="font-heading text-2xl font-bold text-primary leading-tight">
                    SAS DIGITAL TOOLKIT
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Technology & Innovation
                  </p>
                </div>
              </div>
              <p className="text-muted-foreground max-w-md mx-auto lg:mx-0">
                Discover and manage educational technology applications across Singapore American School.
              </p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-3 text-xs text-muted-foreground">
                <Link href="/about" className="hover:text-foreground">About</Link>
                <span>•</span>
                <Link href="/help" className="hover:text-foreground">Help</Link>
                <span>•</span>
                <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
                <span>•</span>
                <Link href="/terms" className="hover:text-foreground">Terms</Link>
              </div>
            </div>

            {/* Right: Login Form */}
            <div className="flex justify-center lg:justify-end">
              <LoginForm />
            </div>
          </div>
        </main>

        {/* Footer - Fixed at bottom */}
        <footer className="py-3 text-center text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Continue as guest →
          </Link>
        </footer>
      </div>
    </Suspense>
  );
}
