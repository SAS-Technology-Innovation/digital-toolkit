"use client";

import Link from "next/link";
import {
  HelpCircle,
  FileText,
  Users,
  Shield,
  RefreshCw,
  ExternalLink,
  Mail,
  Search,
  LayoutDashboard,
  Settings,
  CheckCircle,
  Clock,
  Gavel,
  Sparkles,
  BookOpen,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const quickLinks = [
  {
    title: "Submit Renewal Assessment",
    description: "Provide feedback on apps you use",
    href: "/renewals/submit",
    icon: FileText,
    color: "text-blue-600",
  },
  {
    title: "Browse Apps",
    description: "Explore all available applications",
    href: "/apps",
    icon: Search,
    color: "text-green-600",
  },
  {
    title: "Request New App",
    description: "Submit a request for a new tool",
    href: "/requests",
    icon: MessageSquare,
    color: "text-purple-600",
  },
  {
    title: "Dashboard",
    description: "View app statistics and overview",
    href: "/",
    icon: LayoutDashboard,
    color: "text-orange-600",
  },
];

const roleGuides = [
  {
    role: "Staff / Teacher",
    description: "Regular users who use and provide feedback on educational tools",
    capabilities: [
      "Browse all approved applications",
      "Submit renewal assessments for apps you use",
      "Request new applications",
      "View app details and tutorials",
    ],
    icon: Users,
    color: "bg-blue-100 text-blue-800",
  },
  {
    role: "TIC (Technology Integration Coach)",
    description: "Reviews teacher feedback and makes recommendations",
    capabilities: [
      "All Staff capabilities",
      "Access TIC Review Dashboard",
      "Aggregate teacher feedback",
      "Generate AI summaries",
      "Submit recommendations to Approvers",
    ],
    icon: BookOpen,
    color: "bg-purple-100 text-purple-800",
  },
  {
    role: "Approver (Director)",
    description: "Makes final decisions on app renewals",
    capabilities: [
      "All TIC capabilities",
      "Access Approver Decision page",
      "Review TIC recommendations",
      "Make final renewal decisions",
      "Set new subscription terms",
    ],
    icon: Gavel,
    color: "bg-yellow-100 text-yellow-800",
  },
  {
    role: "Admin",
    description: "Full system access for EdTech team",
    capabilities: [
      "All Approver capabilities",
      "Manage user roles and profiles via User Management page",
      "Access admin dashboard and user management",
      "Delete assessments and decisions",
      "Mark decisions as implemented",
      "Activate/deactivate user accounts",
    ],
    icon: Shield,
    color: "bg-red-100 text-red-800",
  },
];

const workflowSteps = [
  {
    step: 1,
    title: "Teacher Feedback",
    description: "Teachers submit renewal assessments sharing how they use apps and their recommendations",
    status: "collecting",
    icon: Users,
  },
  {
    step: 2,
    title: "AI Summary",
    description: "AI aggregates feedback from multiple teachers into an executive summary",
    status: "summarizing",
    icon: Sparkles,
  },
  {
    step: 3,
    title: "TIC Review",
    description: "Technology Integration Coach reviews feedback and makes a recommendation",
    status: "assessor_review",
    icon: BookOpen,
  },
  {
    step: 4,
    title: "Director Decision",
    description: "Director reviews TIC recommendation and makes the final decision",
    status: "final_review",
    icon: Gavel,
  },
  {
    step: 5,
    title: "Implementation",
    description: "Decision is implemented - subscription renewed, modified, or retired",
    status: "implemented",
    icon: CheckCircle,
  },
];

const faqs = [
  {
    question: "How do I sign in to the Digital Toolkit?",
    answer: "You can sign in using either a magic link (passwordless) or your password. Enter your @sas.edu.sg email address on the login page and choose your preferred method. If you don't have an account yet, click 'Create account' to register."
  },
  {
    question: "How do I create an account?",
    answer: "Click 'Create account' on the login page. Enter your @sas.edu.sg email, create a password (at least 8 characters with uppercase, lowercase, and numbers), and provide your name. You'll receive a verification email to activate your account."
  },
  {
    question: "How do I reset my password?",
    answer: "On the login page, click 'Forgot password?' and enter your @sas.edu.sg email. You'll receive an email with a link to create a new password. The link expires in 1 hour."
  },
  {
    question: "How do I submit a renewal assessment?",
    answer: "Navigate to 'Submit Assessment' from the sidebar under Renewals. Select the app you want to review, answer the questions about your usage, and submit your recommendation. Your feedback helps the EdTech team make informed decisions."
  },
  {
    question: "Who can see my assessment submission?",
    answer: "Your submission is visible to the EdTech team (TICs, Approvers, and Admins) who review and make decisions on app renewals. Your name and email are associated with your feedback to provide context about the user perspective."
  },
  {
    question: "What happens after I submit an assessment?",
    answer: "Your assessment is aggregated with other teachers' feedback. A TIC (Technology Integration Coach) reviews all submissions, optionally generates an AI summary, and makes a recommendation. An Approver then makes the final decision on whether to renew, modify, or retire the app."
  },
  {
    question: "How do I request a new app?",
    answer: "Use the 'Requests' page in the sidebar to submit a new app request. Provide details about the app, its educational purpose, and why existing tools don't meet your needs. The EdTech team will review your request."
  },
  {
    question: "What do the different recommendation options mean?",
    answer: "Renew: Continue the subscription as-is. Renew with Changes: Continue but adjust (licenses, cost, etc.). Replace: Find an alternative tool. Retire: Discontinue the subscription entirely."
  },
  {
    question: "How are apps categorized by division?",
    answer: "Apps are organized by school division (Elementary, Middle, High School, or Whole School). Some apps are available to everyone ('Everyone Apps'), while others are specific to departments or divisions."
  },
  {
    question: "What is an Enterprise app?",
    answer: "Enterprise apps are core SAS-wide tools approved for organization-wide use. They appear with special styling on the Whole School tab and represent official school-supported applications."
  },
  {
    question: "How do I get a higher access level?",
    answer: "Contact the EdTech team (edtech@sas.edu.sg) to request elevated access. Admins can also manage user roles via the User Management page. Role assignments are based on your position and responsibilities."
  },
  {
    question: "How do Admins manage users?",
    answer: "Admins can access the User Management page from the Admin menu in the sidebar. From there, they can view all users, change roles (Staff, TIC, Approver, Admin), and activate or deactivate accounts."
  },
];

export default function HelpPage() {
  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-4 rounded-full bg-primary/10">
            <HelpCircle className="h-12 w-12 text-primary" />
          </div>
        </div>
        <h1 className="text-4xl font-bold tracking-tight font-heading">
          HELP CENTER
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Learn how to use the SAS Digital Toolkit and the app renewal process
        </p>
      </div>

      {/* Quick Links */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold font-heading">Quick Links</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <link.icon className={`h-8 w-8 ${link.color} mb-3`} />
                  <h3 className="font-semibold">{link.title}</h3>
                  <p className="text-sm text-muted-foreground">{link.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <Separator />

      {/* Renewal Workflow */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold font-heading">Renewal Workflow</h2>
        <p className="text-muted-foreground">
          Understand how app renewal decisions are made at SAS
        </p>
        <div className="grid gap-4 md:grid-cols-5">
          {workflowSteps.map((step, index) => (
            <div key={step.step} className="relative">
              <Card className="h-full">
                <CardContent className="pt-6 text-center">
                  <div className="flex justify-center mb-3">
                    <div className="p-2 rounded-full bg-primary/10">
                      <step.icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <Badge variant="secondary" className="mb-2">Step {step.step}</Badge>
                  <h4 className="font-semibold text-sm">{step.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
                </CardContent>
              </Card>
              {index < workflowSteps.length - 1 && (
                <ArrowRight className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
              )}
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* User Roles */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold font-heading">User Roles & Permissions</h2>
        <p className="text-muted-foreground">
          Different roles have different access levels in the system
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {roleGuides.map((role) => (
            <Card key={role.role}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${role.color}`}>
                    <role.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{role.role}</CardTitle>
                    <CardDescription>{role.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {role.capabilities.map((cap, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      <span>{cap}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator />

      {/* FAQs */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold font-heading">Frequently Asked Questions</h2>
        <Card>
          <CardContent className="pt-6">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`faq-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* Contact */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold font-heading">Still Need Help?</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1 space-y-2">
                <h3 className="font-semibold text-lg">Contact the EdTech Team</h3>
                <p className="text-muted-foreground">
                  Our team is here to help with any questions about educational technology,
                  app requests, or technical issues.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild>
                  <a href="mailto:edtech@sas.edu.sg">
                    <Mail className="mr-2 h-4 w-4" />
                    Email EdTech Team
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a
                    href="https://sites.google.com/sas.edu.sg/sasedtech"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    EdTech Website
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Version Info */}
      <div className="text-center text-sm text-muted-foreground pt-4">
        <p>SAS Digital Toolkit v2.0 - Built with Next.js and Supabase</p>
      </div>
    </div>
  );
}
