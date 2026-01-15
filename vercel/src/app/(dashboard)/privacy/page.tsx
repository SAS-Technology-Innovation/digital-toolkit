"use client";

import Link from "next/link";
import {
  Shield,
  Lock,
  Eye,
  Database,
  UserCheck,
  Globe,
  Mail,
  FileText,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const dataCollected = [
  {
    category: "Account Information",
    items: ["Email address (@sas.edu.sg)", "Name", "Department", "Division"],
    purpose: "To identify users and personalize your experience",
    icon: UserCheck,
  },
  {
    category: "Usage Data",
    items: ["Pages visited", "Features used", "Assessment submissions", "Login timestamps"],
    purpose: "To improve the platform and understand usage patterns",
    icon: Eye,
  },
  {
    category: "Technical Data",
    items: ["Browser type", "Device information", "IP address (anonymized)"],
    purpose: "To ensure security and optimize performance",
    icon: Globe,
  },
];

const dataProtection = [
  {
    title: "Encryption",
    description: "All data is encrypted in transit using TLS/SSL and at rest using AES-256",
    icon: Lock,
  },
  {
    title: "Access Control",
    description: "Role-based access ensures users only see data relevant to their role",
    icon: Shield,
  },
  {
    title: "Data Retention",
    description: "Data is retained only as long as necessary for educational purposes",
    icon: Database,
  },
  {
    title: "No Third-Party Sharing",
    description: "We do not sell or share personal data with third parties for marketing",
    icon: UserCheck,
  },
];

export default function PrivacyPage() {
  const lastUpdated = "January 15, 2026";

  return (
    <div className="p-6 space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-4 rounded-full bg-green-100">
            <Shield className="h-12 w-12 text-green-600" />
          </div>
        </div>
        <h1 className="text-4xl font-bold tracking-tight font-heading">
          PRIVACY POLICY
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          How we collect, use, and protect your information
        </p>
        <Badge variant="outline">Last Updated: {lastUpdated}</Badge>
      </div>

      {/* Summary Alert */}
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertTitle>Privacy Summary</AlertTitle>
        <AlertDescription>
          The SAS Digital Toolkit collects minimal data necessary to provide our services.
          Your data is stored securely, never sold, and only accessible to authorized SAS staff.
        </AlertDescription>
      </Alert>

      <Separator />

      {/* Introduction */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold font-heading">Introduction</h2>
        <Card>
          <CardContent className="pt-6 prose prose-sm max-w-none">
            <p className="text-muted-foreground">
              Singapore American School (&quot;SAS,&quot; &quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting
              the privacy of our students, faculty, staff, and community members. This Privacy
              Policy explains how we collect, use, disclose, and safeguard your information when
              you use the SAS Digital Toolkit.
            </p>
            <p className="text-muted-foreground">
              By using the Digital Toolkit, you consent to the data practices described in this
              policy. If you do not agree with the terms of this policy, please do not access
              or use the platform.
            </p>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* Data Collected */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold font-heading">Information We Collect</h2>
        <div className="space-y-4">
          {dataCollected.map((category) => (
            <Card key={category.category}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <category.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{category.category}</CardTitle>
                    <CardDescription>{category.purpose}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="grid grid-cols-2 gap-2">
                  {category.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator />

      {/* How We Use Data */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold font-heading">How We Use Your Information</h2>
        <Card>
          <CardContent className="pt-6">
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                <div>
                  <span className="font-medium">Provide Services</span>
                  <p className="text-sm text-muted-foreground">
                    To authenticate users, display relevant content, and enable platform features
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                <div>
                  <span className="font-medium">Improve Platform</span>
                  <p className="text-sm text-muted-foreground">
                    To analyze usage patterns and enhance user experience
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                <div>
                  <span className="font-medium">Communication</span>
                  <p className="text-sm text-muted-foreground">
                    To send important notifications about your account or the platform
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                <div>
                  <span className="font-medium">Security</span>
                  <p className="text-sm text-muted-foreground">
                    To detect and prevent unauthorized access or abuse
                  </p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* Data Protection */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold font-heading">How We Protect Your Data</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {dataProtection.map((item) => (
            <Card key={item.title}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-green-100">
                    <item.icon className="h-5 w-5 text-green-600" />
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

      {/* Your Rights */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold font-heading">Your Rights</h2>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground mb-4">
              As a user of the SAS Digital Toolkit, you have the following rights:
            </p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span><strong>Access:</strong> Request a copy of your personal data</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span><strong>Correction:</strong> Request correction of inaccurate data</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span><strong>Deletion:</strong> Request deletion of your data (where applicable)</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span><strong>Portability:</strong> Request your data in a portable format</span>
              </li>
            </ul>
            <p className="text-sm text-muted-foreground mt-4">
              To exercise these rights, contact the EdTech team at edtech@sas.edu.sg.
            </p>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* Third-Party Services */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold font-heading">Third-Party Services</h2>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground mb-4">
              The Digital Toolkit uses the following third-party services:
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm">
                <Database className="h-4 w-4 text-primary mt-0.5" />
                <div>
                  <strong>Supabase:</strong> Authentication and database services
                  (<a href="https://supabase.com/privacy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Privacy Policy</a>)
                </div>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Globe className="h-4 w-4 text-primary mt-0.5" />
                <div>
                  <strong>Vercel:</strong> Hosting and analytics
                  (<a href="https://vercel.com/legal/privacy-policy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Privacy Policy</a>)
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* Contact */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold font-heading">Contact Us</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1 space-y-2">
                <p className="text-muted-foreground">
                  If you have questions about this Privacy Policy or our data practices,
                  please contact us:
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
          <Link href="/terms">
            <FileText className="mr-2 h-4 w-4" />
            Terms of Service
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/about">
            <AlertCircle className="mr-2 h-4 w-4" />
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
