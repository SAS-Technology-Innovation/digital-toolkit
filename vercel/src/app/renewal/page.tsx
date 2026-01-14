"use client";

import Link from "next/link";
import {
  FileText,
  Users,
  ClipboardCheck,
  CheckCircle,
  ArrowRight,
  HelpCircle,
  MessageSquare,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function RenewalGuidePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-heading font-bold text-gray-900">
            APP RENEWAL PROCESS
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Help us make informed decisions about which educational tools to keep,
            modify, or replace. Your input directly impacts our technology investments.
          </p>
          <Button size="lg" asChild className="mt-4">
            <Link href="/renewal/submit">
              <FileText className="mr-2 h-5 w-5" />
              Submit Your Assessment
            </Link>
          </Button>
        </div>

        {/* Process Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              How the Process Works
            </CardTitle>
            <CardDescription>
              Your assessment is part of a structured review process
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Step 1 */}
              <div className="relative">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">1. Submit Assessment</h3>
                    <p className="text-sm text-muted-foreground">
                      Teachers share their experience with each app
                    </p>
                  </div>
                </div>
                <ArrowRight className="hidden md:block absolute right-0 top-6 text-gray-300 h-6 w-6" />
              </div>

              {/* Step 2 */}
              <div className="relative">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">2. Aggregate Feedback</h3>
                    <p className="text-sm text-muted-foreground">
                      All submissions are combined and summarized
                    </p>
                  </div>
                </div>
                <ArrowRight className="hidden md:block absolute right-0 top-6 text-gray-300 h-6 w-6" />
              </div>

              {/* Step 3 */}
              <div className="relative">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                    <ClipboardCheck className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">3. TIC Review</h3>
                    <p className="text-sm text-muted-foreground">
                      EdTech team analyzes and adds recommendations
                    </p>
                  </div>
                </div>
                <ArrowRight className="hidden md:block absolute right-0 top-6 text-gray-300 h-6 w-6" />
              </div>

              {/* Step 4 */}
              <div>
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">4. Final Decision</h3>
                    <p className="text-sm text-muted-foreground">
                      Leadership makes data-informed decisions
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Why Your Input Matters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Why Your Input Matters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-sm">1</span>
                </div>
                <div>
                  <h4 className="font-medium">Optimize Spending</h4>
                  <p className="text-sm text-muted-foreground">
                    Your feedback helps ensure budget is spent on tools that actually help teaching and learning.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-sm">2</span>
                </div>
                <div>
                  <h4 className="font-medium">Identify Alternatives</h4>
                  <p className="text-sm text-muted-foreground">
                    Discover better tools or consolidate overlapping subscriptions.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-sm">3</span>
                </div>
                <div>
                  <h4 className="font-medium">Share Best Practices</h4>
                  <p className="text-sm text-muted-foreground">
                    Your use cases help others learn how to effectively use these tools.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-sm">4</span>
                </div>
                <div>
                  <h4 className="font-medium">Voice Concerns</h4>
                  <p className="text-sm text-muted-foreground">
                    Report issues, suggest improvements, or highlight tools that need attention.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="who">
                <AccordionTrigger>Who should submit an assessment?</AccordionTrigger>
                <AccordionContent>
                  Any staff member who uses an educational application can submit an
                  assessment. We especially value input from teachers who use these
                  tools regularly in their classrooms.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="when">
                <AccordionTrigger>When should I submit?</AccordionTrigger>
                <AccordionContent>
                  Assessments are typically requested before an app&apos;s renewal date.
                  You may receive an email notification when an app you use is up for
                  renewal. You can also proactively submit an assessment at any time.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="what">
                <AccordionTrigger>What information do I need?</AccordionTrigger>
                <AccordionContent>
                  Think about how often you use the app, what you use it for, how it
                  impacts student learning, and whether you&apos;d recommend keeping it.
                  You don&apos;t need to know technical details - just your experience.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="multiple">
                <AccordionTrigger>Can I submit multiple assessments?</AccordionTrigger>
                <AccordionContent>
                  Yes! You can submit assessments for multiple apps. Each assessment
                  helps build a complete picture of how our tools are being used.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="anonymous">
                <AccordionTrigger>Is my feedback anonymous?</AccordionTrigger>
                <AccordionContent>
                  Your name and email are recorded with your submission, but individual
                  responses are aggregated and summarized before being presented to
                  decision-makers. This helps the EdTech team follow up if needed.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="decision">
                <AccordionTrigger>How are decisions made?</AccordionTrigger>
                <AccordionContent>
                  The EdTech team reviews all submissions, generates a summary, and
                  provides a recommendation. School leadership then reviews this data
                  to make the final decision on whether to renew, modify, or retire
                  each subscription.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center space-y-4 pt-4">
          <Button size="lg" asChild>
            <Link href="/renewal/submit">
              <FileText className="mr-2 h-5 w-5" />
              Start Your Assessment
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <p className="text-sm text-muted-foreground">
            Questions? Contact{" "}
            <a
              href="mailto:edtech@sas.edu.sg"
              className="text-primary hover:underline"
            >
              edtech@sas.edu.sg
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
