"use client";

import Link from "next/link";
import {
  Info,
  Users,
  Shield,
  Zap,
  Globe,
  Mail,
  ExternalLink,
  Heart,
  Code,
  Database,
  Palette,
  Lock,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const features = [
  {
    title: "App Management",
    description: "Browse, search, and discover educational applications across all divisions",
    icon: Globe,
  },
  {
    title: "Renewal Workflow",
    description: "Streamlined process for app renewals with teacher feedback and AI summaries",
    icon: Zap,
  },
  {
    title: "User Management",
    description: "Role-based access control with Staff, TIC, Approver, and Admin roles",
    icon: Users,
  },
  {
    title: "Secure Authentication",
    description: "Magic links and password authentication with @sas.edu.sg domain restriction",
    icon: Lock,
  },
];

const techStack = [
  { name: "Next.js 16", description: "React framework with App Router", icon: Code },
  { name: "Supabase", description: "Authentication and PostgreSQL database", icon: Database },
  { name: "Tailwind CSS", description: "Utility-first styling with Shadcn/UI", icon: Palette },
  { name: "Vercel", description: "Deployment and hosting platform", icon: Globe },
];

const team = [
  {
    name: "Technology & Innovation Team",
    role: "Development & Maintenance",
    description: "Building and maintaining the Digital Toolkit to support the SAS community",
  },
  {
    name: "EdTech Team",
    role: "Content & Support",
    description: "Managing app catalog, renewals, and providing user support",
  },
];

export default function AboutPage() {
  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-4 rounded-full bg-primary/10">
            <Info className="h-12 w-12 text-primary" />
          </div>
        </div>
        <h1 className="text-4xl font-bold tracking-tight font-heading">
          ABOUT THE DIGITAL TOOLKIT
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          A modern platform for managing educational technology at Singapore American School
        </p>
        <div className="flex justify-center gap-2">
          <Badge variant="secondary">Version 2.0</Badge>
          <Badge variant="outline">Open Source</Badge>
        </div>
      </div>

      {/* Mission */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="p-4 rounded-full bg-primary/20">
              <Heart className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-bold mb-2">Our Mission</h2>
              <p className="text-muted-foreground">
                To empower the SAS community with a centralized platform for discovering, managing,
                and evaluating educational technology tools. We believe in making technology decisions
                transparent, collaborative, and data-driven.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Features */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold font-heading">Key Features</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {features.map((feature) => (
            <Card key={feature.title}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator />

      {/* Tech Stack */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold font-heading">Built With</h2>
        <div className="grid gap-4 md:grid-cols-4">
          {techStack.map((tech) => (
            <Card key={tech.name}>
              <CardContent className="pt-6 text-center">
                <div className="flex justify-center mb-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <tech.icon className="h-5 w-5" />
                  </div>
                </div>
                <h3 className="font-semibold text-sm">{tech.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{tech.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator />

      {/* Team */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold font-heading">The Team</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {team.map((member) => (
            <Card key={member.name}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{member.name}</CardTitle>
                    <CardDescription>{member.role}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{member.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator />

      {/* Links */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold font-heading">Quick Links</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Link href="/help">
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-6 text-center">
                <Shield className="h-8 w-8 mx-auto mb-3 text-blue-600" />
                <h3 className="font-semibold">Help Center</h3>
                <p className="text-sm text-muted-foreground">Documentation and FAQs</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/privacy">
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-6 text-center">
                <Lock className="h-8 w-8 mx-auto mb-3 text-green-600" />
                <h3 className="font-semibold">Privacy Policy</h3>
                <p className="text-sm text-muted-foreground">How we protect your data</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/terms">
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-6 text-center">
                <Shield className="h-8 w-8 mx-auto mb-3 text-purple-600" />
                <h3 className="font-semibold">Terms of Service</h3>
                <p className="text-sm text-muted-foreground">Usage guidelines</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      <Separator />

      {/* Contact */}
      <section className="space-y-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1 space-y-2">
                <h3 className="font-semibold text-lg">Questions or Feedback?</h3>
                <p className="text-muted-foreground">
                  We&apos;re always looking to improve. Reach out to the EdTech team with any
                  questions, suggestions, or feedback about the Digital Toolkit.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild>
                  <a href="mailto:edtech@sas.edu.sg">
                    <Mail className="mr-2 h-4 w-4" />
                    Contact Us
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a
                    href="https://github.com/SAS-Technology-Innovation/digital-toolkit"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View on GitHub
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground pt-4 space-y-1">
        <p>SAS Digital Toolkit - Built with care for the SAS community</p>
        <p>&copy; {new Date().getFullYear()} Singapore American School. All rights reserved.</p>
      </div>
    </div>
  );
}
