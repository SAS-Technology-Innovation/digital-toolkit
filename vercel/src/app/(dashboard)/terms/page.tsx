"use client";

import Link from "next/link";
import {
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Shield,
  Mail,
  Scale,
  Users,
  Lock,
  Globe,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const acceptableUse = [
  "Access and use the platform for legitimate educational purposes",
  "Submit honest and constructive feedback on applications",
  "Maintain the confidentiality of your account credentials",
  "Report bugs, security issues, or inappropriate content",
  "Comply with all applicable SAS policies and guidelines",
];

const prohibitedActions = [
  "Share your account credentials with others",
  "Attempt to access accounts or data belonging to others",
  "Submit false, misleading, or inappropriate content",
  "Attempt to circumvent security measures or access controls",
  "Use the platform for commercial purposes or advertising",
  "Upload malicious code or attempt to disrupt the service",
];

const userResponsibilities = [
  {
    title: "Account Security",
    description: "You are responsible for maintaining the security of your account and password",
    icon: Lock,
  },
  {
    title: "Accurate Information",
    description: "Ensure all information you provide is accurate and up-to-date",
    icon: CheckCircle,
  },
  {
    title: "Respectful Conduct",
    description: "Treat other users and staff with respect in all interactions",
    icon: Users,
  },
  {
    title: "Compliance",
    description: "Follow all SAS policies and applicable laws when using the platform",
    icon: Scale,
  },
];

export default function TermsPage() {
  const lastUpdated = "January 15, 2026";

  return (
    <div className="p-6 space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-4 rounded-full bg-purple-100">
            <Scale className="h-12 w-12 text-purple-600" />
          </div>
        </div>
        <h1 className="text-4xl font-bold tracking-tight font-heading">
          TERMS OF SERVICE
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Guidelines for using the SAS Digital Toolkit
        </p>
        <Badge variant="outline">Last Updated: {lastUpdated}</Badge>
      </div>

      {/* Summary Alert */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Agreement to Terms</AlertTitle>
        <AlertDescription>
          By accessing or using the SAS Digital Toolkit, you agree to be bound by these Terms
          of Service. If you disagree with any part of these terms, you may not access the platform.
        </AlertDescription>
      </Alert>

      <Separator />

      {/* Introduction */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold font-heading">1. Introduction</h2>
        <Card>
          <CardContent className="pt-6 space-y-4">
            <p className="text-muted-foreground">
              The SAS Digital Toolkit (&quot;Platform,&quot; &quot;Service&quot;) is provided by Singapore American
              School (&quot;SAS,&quot; &quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) to support the educational mission of our
              school community.
            </p>
            <p className="text-muted-foreground">
              These Terms of Service (&quot;Terms&quot;) govern your access to and use of the Platform.
              By using the Platform, you acknowledge that you have read, understood, and agree
              to be bound by these Terms.
            </p>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* Eligibility */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold font-heading">2. Eligibility</h2>
        <Card>
          <CardContent className="pt-6">
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                <span>You must have a valid @sas.edu.sg email address to register</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                <span>You must be a current member of the SAS community (student, faculty, staff, or parent)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                <span>You must agree to these Terms and our Privacy Policy</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* User Responsibilities */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold font-heading">3. User Responsibilities</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {userResponsibilities.map((item) => (
            <Card key={item.title}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator />

      {/* Acceptable Use */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold font-heading">4. Acceptable Use</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <CardTitle className="text-lg">You May</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {acceptableUse.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />
                <CardTitle className="text-lg">You May Not</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {prohibitedActions.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm">
                    <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator />

      {/* Intellectual Property */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold font-heading">5. Intellectual Property</h2>
        <Card>
          <CardContent className="pt-6 space-y-4">
            <p className="text-muted-foreground">
              The Platform and its original content, features, and functionality are owned by
              Singapore American School and are protected by international copyright, trademark,
              and other intellectual property laws.
            </p>
            <p className="text-muted-foreground">
              Content you submit to the Platform (such as assessment feedback) remains your
              intellectual property, but you grant SAS a license to use, display, and process
              this content for the purpose of operating the Platform.
            </p>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* Disclaimers */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold font-heading">6. Disclaimers</h2>
        <Card>
          <CardContent className="pt-6 space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Service Provided &quot;As Is&quot;</AlertTitle>
              <AlertDescription>
                The Platform is provided on an &quot;as is&quot; and &quot;as available&quot; basis without
                warranties of any kind. We do not guarantee uninterrupted access or that the
                Platform will be error-free.
              </AlertDescription>
            </Alert>
            <p className="text-muted-foreground">
              SAS reserves the right to modify, suspend, or discontinue the Platform at any
              time without notice. We are not liable for any modification, suspension, or
              discontinuation of the Platform.
            </p>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* Account Termination */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold font-heading">7. Account Termination</h2>
        <Card>
          <CardContent className="pt-6 space-y-4">
            <p className="text-muted-foreground">
              We may terminate or suspend your account immediately, without prior notice or
              liability, for any reason, including but not limited to:
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm">
                <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                <span>Breach of these Terms</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                <span>Violation of SAS policies</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                <span>Termination of your affiliation with SAS</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                <span>Request by law enforcement or government agencies</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* Changes to Terms */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold font-heading">8. Changes to Terms</h2>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">
              We reserve the right to modify these Terms at any time. We will notify users of
              any material changes by updating the &quot;Last Updated&quot; date at the top of this page.
              Your continued use of the Platform after such modifications constitutes acceptance
              of the updated Terms.
            </p>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* Governing Law */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold font-heading">9. Governing Law</h2>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">
              These Terms shall be governed by and construed in accordance with the laws of
              Singapore, without regard to its conflict of law provisions. Any disputes arising
              from these Terms will be resolved in the courts of Singapore.
            </p>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* Contact */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold font-heading">10. Contact Us</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1 space-y-2">
                <p className="text-muted-foreground">
                  If you have questions about these Terms of Service, please contact us:
                </p>
              </div>
              <Button asChild>
                <a href="mailto:edtech@sas.edu.sg">
                  <Mail className="mr-2 h-4 w-4" />
                  edtech@sas.edu.sg
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Related Links */}
      <div className="flex justify-center gap-4 pt-4">
        <Button variant="outline" asChild>
          <Link href="/privacy">
            <Shield className="mr-2 h-4 w-4" />
            Privacy Policy
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/about">
            <Globe className="mr-2 h-4 w-4" />
            About
          </Link>
        </Button>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground pt-4">
        <p>&copy; {new Date().getFullYear()} Singapore American School. All rights reserved.</p>
      </div>
    </div>
  );
}
