"use client";

import { useState } from "react";
import {
  FilePlus,
  Search,
  Users,
  Send,
  HelpCircle,
  Download,
  X,
  Maximize2,
  CheckCircle,
  MessageSquare,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Request questions that teachers need to answer
const requestQuestions = [
  "What problem or opportunity does this tool seek to address?",
  "Which grade level and subject areas will this tool serve and for what purpose (e.g., classroom instruction, homework, assessment, differentiation, communication, data tracking)?",
  "How will you measure the impact or success of this tool?",
  "What other tools or alternatives have you considered?",
  "Do you foresee any training or support needs for this tool? If so, what kind?",
  "What is the cost, how many licenses will you need, and who will be using the tool?",
];

// Process steps
const processSteps = [
  {
    number: 1,
    title: "Search the Toolkit",
    description:
      "Use the search bar or browse through divisions to ensure a similar tool isn't already available. Try asking the AI Assistant for recommendations.",
    icon: Search,
  },
  {
    number: 2,
    title: "Consult Your Team",
    description:
      "Talk to your department lead or PLC coach about your specific requirements. They may know of existing solutions or can help refine your needs.",
    icon: Users,
  },
  {
    number: 3,
    title: "Submit App Request",
    description:
      "If no suitable solution exists, submit a formal app request with the information below.",
    icon: Send,
  },
];

export default function RequestsPage() {
  const [showFlowchartModal, setShowFlowchartModal] = useState(false);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3 mb-2">
          <FilePlus className="w-8 h-8 text-primary" />
          Request a New App
        </h1>
        <p className="text-muted-foreground text-lg">
          Can&apos;t find the tool you need? Follow this process to request a new application for the SAS Digital Toolkit.
        </p>
      </div>

      {/* Process Steps */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        {processSteps.map((step) => (
          <Card key={step.number} className="relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
            <CardHeader className="pb-3">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold">
                  {step.number}
                </div>
                <CardTitle className="text-lg">{step.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3">
                <step.icon className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-[1fr_400px] gap-8">
        {/* Required Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary" />
              Information Required for App Request
            </CardTitle>
            <CardDescription>
              Be prepared to answer these questions when submitting your request
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {requestQuestions.map((question, index) => (
              <div
                key={index}
                className="flex gap-4 p-4 bg-muted/50 rounded-lg border-l-4 border-accent"
              >
                <Badge variant="outline" className="shrink-0 h-6 w-6 p-0 flex items-center justify-center">
                  {index + 1}
                </Badge>
                <p className="text-sm text-foreground leading-relaxed">{question}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Flowchart Image */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="w-5 h-5" />
                App Request Process Flowchart
              </CardTitle>
              <CardDescription>
                Visual guide to the complete request workflow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className="relative cursor-pointer group"
                onClick={() => setShowFlowchartModal(true)}
              >
                <img
                  src="/assets/App Request Process for Teachers.png"
                  alt="App Request Process Flowchart"
                  className="w-full rounded-lg border shadow-sm transition-transform group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full p-3">
                    <Maximize2 className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </div>
              <p className="text-center text-sm text-muted-foreground mt-3 flex items-center justify-center gap-2">
                <Maximize2 className="w-4 h-4" />
                Click to view full size
              </p>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Need Help?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" asChild>
                <a href="mailto:edtech@sas.edu.sg">
                  <Send className="w-4 h-4 mr-2" />
                  Contact EdTech Team
                </a>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <a
                  href="/assets/App Request Process for Teachers.png"
                  download="App Request Process for Teachers.png"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Flowchart
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="bg-accent/10 border-accent/30">
            <CardContent className="pt-6">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Tips for a Successful Request
              </h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex gap-2">
                  <span className="text-green-600">✓</span>
                  Check if a similar tool already exists in the toolkit
                </li>
                <li className="flex gap-2">
                  <span className="text-green-600">✓</span>
                  Get input from colleagues who might also benefit
                </li>
                <li className="flex gap-2">
                  <span className="text-green-600">✓</span>
                  Have cost and licensing information ready
                </li>
                <li className="flex gap-2">
                  <span className="text-green-600">✓</span>
                  Consider data privacy and student safety implications
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Flowchart Modal */}
      {showFlowchartModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowFlowchartModal(false)}
        >
          <div
            className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-semibold">App Request Process</h2>
              <div className="flex gap-3">
                <Button variant="outline" size="sm" asChild>
                  <a
                    href="/assets/App Request Process for Teachers.png"
                    download="App Request Process for Teachers.png"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </a>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowFlowchartModal(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
            <div className="p-4 overflow-auto max-h-[calc(90vh-80px)] bg-muted/30">
              <img
                src="/assets/App Request Process for Teachers.png"
                alt="App Request Process Flowchart"
                className="max-w-full h-auto mx-auto rounded-lg shadow-md"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
