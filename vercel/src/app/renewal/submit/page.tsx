"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Check,
  ChevronsUpDown,
  Loader2,
  CheckCircle2,
  ArrowLeft,
  FileText,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

interface App {
  id: string;
  product: string;
  vendor: string | null;
  category: string | null;
  division: string | null;
  renewal_date: string | null;
  annual_cost: number | null;
  licenses: number | null;
}

interface FormState {
  app_id: string;
  submitter_email: string;
  submitter_name: string;
  submitter_departments: string[];
  submitter_division: string;
  usage_frequency: string;
  primary_use_cases: string;
  learning_impact: string;
  workflow_integration: string;
  alternatives_considered: string;
  unique_value: string;
  stakeholder_feedback: string;
  recommendation: string;
  justification: string;
  proposed_changes: string;
}

const initialFormState: FormState = {
  app_id: "",
  submitter_email: "",
  submitter_name: "",
  submitter_departments: [],
  submitter_division: "",
  usage_frequency: "",
  primary_use_cases: "",
  learning_impact: "",
  workflow_integration: "",
  alternatives_considered: "",
  unique_value: "",
  stakeholder_feedback: "",
  recommendation: "",
  justification: "",
  proposed_changes: "",
};

// Department options
const DEPARTMENTS = [
  "Technology & Innovation",
  "English Language Arts",
  "Math",
  "Science",
  "Social Studies",
  "World Languages",
  "Arts",
  "Physical Education",
  "Counseling",
  "Library",
  "Learning Support",
  "Administration",
  "Other",
];

// Division options
const DIVISIONS = [
  "Elementary School",
  "Middle School",
  "High School",
  "Whole School",
];

export default function RenewalSubmitPage() {
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [open, setOpen] = useState(false);
  const [deptOpen, setDeptOpen] = useState(false);
  const [form, setForm] = useState<FormState>(initialFormState);
  const [selectedApp, setSelectedApp] = useState<App | null>(null);

  // Fetch apps for dropdown
  useEffect(() => {
    async function fetchApps() {
      try {
        const response = await fetch("/api/apps/list");
        if (!response.ok) throw new Error("Failed to fetch apps");
        const data = await response.json();
        setApps(data);
      } catch (error) {
        console.error("Error fetching apps:", error);
        toast.error("Failed to load apps");
      } finally {
        setLoading(false);
      }
    }
    fetchApps();
  }, []);

  // Update selected app when app_id changes
  useEffect(() => {
    if (form.app_id) {
      const app = apps.find((a) => a.id === form.app_id);
      setSelectedApp(app || null);
    } else {
      setSelectedApp(null);
    }
  }, [form.app_id, apps]);

  const handleChange = (field: keyof FormState, value: string | string[]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleDepartment = (dept: string) => {
    setForm((prev) => {
      const current = prev.submitter_departments;
      if (current.includes(dept)) {
        return { ...prev, submitter_departments: current.filter((d) => d !== dept) };
      } else {
        return { ...prev, submitter_departments: [...current, dept] };
      }
    });
  };

  const removeDepartment = (dept: string) => {
    setForm((prev) => ({
      ...prev,
      submitter_departments: prev.submitter_departments.filter((d) => d !== dept),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!form.app_id) {
      toast.error("Please select an app");
      return;
    }

    if (!form.submitter_email || !form.submitter_email.endsWith("@sas.edu.sg")) {
      toast.error("Please enter a valid @sas.edu.sg email address");
      return;
    }

    if (!form.submitter_name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    if (form.submitter_departments.length === 0) {
      toast.error("Please select at least one department");
      return;
    }

    if (!form.submitter_division) {
      toast.error("Please select your division");
      return;
    }

    if (!form.recommendation) {
      toast.error("Please select a recommendation");
      return;
    }

    if (!form.justification.trim()) {
      toast.error("Please provide a justification for your recommendation");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/renewal-assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Submission failed");
      }

      setSubmitted(true);
      toast.success("Assessment submitted successfully!");
    } catch (error) {
      console.error("Submit error:", error);
      toast.error(error instanceof Error ? error.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  // Success state
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Assessment Submitted</CardTitle>
            <CardDescription>
              Thank you for submitting your renewal assessment for{" "}
              <strong>{selectedApp?.product}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              The EdTech team will review your assessment and follow up if needed.
              Your submission has been recorded for {form.submitter_email}.
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setForm(initialFormState);
                  setSubmitted(false);
                  setSelectedApp(null);
                }}
              >
                Submit Another
              </Button>
              <Button asChild className="flex-1">
                <Link href="/renewal">Back to Guide</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/renewal">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Guide
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl font-heading">
                  APP RENEWAL ASSESSMENT
                </CardTitle>
                <CardDescription>
                  Submit a renewal assessment for an educational application
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Section 1: App Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">
                  1. Application Selection
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="app">Select Application *</Label>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Loading apps...
                          </>
                        ) : selectedApp ? (
                          <>
                            {selectedApp.product}
                            {selectedApp.vendor && (
                              <span className="text-muted-foreground ml-2">
                                ({selectedApp.vendor})
                              </span>
                            )}
                          </>
                        ) : (
                          "Select an application..."
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search applications..." />
                        <CommandList>
                          <CommandEmpty>No application found.</CommandEmpty>
                          <CommandGroup>
                            {apps.map((app) => (
                              <CommandItem
                                key={app.id}
                                value={app.product}
                                onSelect={() => {
                                  handleChange("app_id", app.id);
                                  setOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    form.app_id === app.id
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                <div className="flex flex-col">
                                  <span>{app.product}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {app.vendor || "No vendor"} - {app.category || "N/A"}
                                  </span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Current subscription info */}
                {selectedApp && (
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <h4 className="font-medium">Current Subscription Info</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Division</p>
                        <p className="font-medium">{selectedApp.division || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Renewal Date</p>
                        <p className="font-medium">
                          {selectedApp.renewal_date
                            ? new Date(selectedApp.renewal_date).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Annual Cost</p>
                        <p className="font-medium">
                          {selectedApp.annual_cost
                            ? `$${selectedApp.annual_cost.toLocaleString()}`
                            : "Free"}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Licenses</p>
                        <p className="font-medium">
                          {selectedApp.licenses || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Section 2: Submitter Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">
                  2. Your Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="submitter_name">Your Name *</Label>
                    <Input
                      id="submitter_name"
                      placeholder="Your full name"
                      value={form.submitter_name}
                      onChange={(e) => handleChange("submitter_name", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="submitter_email">Email Address *</Label>
                    <Input
                      id="submitter_email"
                      type="email"
                      placeholder="your.name@sas.edu.sg"
                      value={form.submitter_email}
                      onChange={(e) => handleChange("submitter_email", e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Must be an @sas.edu.sg address
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="submitter_departments">Department(s) *</Label>
                    <Popover open={deptOpen} onOpenChange={setDeptOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={deptOpen}
                          className="w-full justify-between h-auto min-h-10"
                        >
                          <div className="flex flex-wrap gap-1">
                            {form.submitter_departments.length > 0 ? (
                              form.submitter_departments.map((dept) => (
                                <Badge
                                  key={dept}
                                  variant="secondary"
                                  className="mr-1 mb-1"
                                >
                                  {dept}
                                  <button
                                    type="button"
                                    className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeDepartment(dept);
                                    }}
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </Badge>
                              ))
                            ) : (
                              <span className="text-muted-foreground">
                                Select department(s)
                              </span>
                            )}
                          </div>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Search departments..." />
                          <CommandList>
                            <CommandEmpty>No department found.</CommandEmpty>
                            <CommandGroup>
                              {DEPARTMENTS.map((dept) => (
                                <CommandItem
                                  key={dept}
                                  value={dept}
                                  onSelect={() => toggleDepartment(dept)}
                                >
                                  <div className="flex items-center gap-2">
                                    <Checkbox
                                      checked={form.submitter_departments.includes(dept)}
                                      className="pointer-events-none"
                                    />
                                    {dept}
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="submitter_division">Division *</Label>
                    <Select
                      value={form.submitter_division}
                      onValueChange={(v) => handleChange("submitter_division", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your division" />
                      </SelectTrigger>
                      <SelectContent>
                        {DIVISIONS.map((div) => (
                          <SelectItem key={div} value={div}>
                            {div}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Section 3: Usage & Impact */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">
                  3. Usage & Impact Assessment
                </h3>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="usage_frequency">
                      How frequently is this tool used?
                    </Label>
                    <Select
                      value={form.usage_frequency}
                      onValueChange={(v) => handleChange("usage_frequency", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="rarely">Rarely</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="primary_use_cases">
                      What are the primary use cases?
                    </Label>
                    <Textarea
                      id="primary_use_cases"
                      placeholder="Describe how teachers and students primarily use this tool..."
                      value={form.primary_use_cases}
                      onChange={(e) => handleChange("primary_use_cases", e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="learning_impact">
                      How does this impact student learning?
                    </Label>
                    <Textarea
                      id="learning_impact"
                      placeholder="Describe the learning outcomes and student engagement..."
                      value={form.learning_impact}
                      onChange={(e) => handleChange("learning_impact", e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="workflow_integration">
                      How is it integrated into your workflow?
                    </Label>
                    <Textarea
                      id="workflow_integration"
                      placeholder="Describe how this tool fits into daily teaching/admin workflows..."
                      value={form.workflow_integration}
                      onChange={(e) => handleChange("workflow_integration", e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="alternatives_considered">
                      Were alternatives considered?
                    </Label>
                    <Textarea
                      id="alternatives_considered"
                      placeholder="List any alternative tools you have evaluated..."
                      value={form.alternatives_considered}
                      onChange={(e) => handleChange("alternatives_considered", e.target.value)}
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="unique_value">
                      What unique value does this tool provide?
                    </Label>
                    <Textarea
                      id="unique_value"
                      placeholder="What makes this tool indispensable or difficult to replace?"
                      value={form.unique_value}
                      onChange={(e) => handleChange("unique_value", e.target.value)}
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Stakeholder Feedback */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">
                  4. Stakeholder Feedback
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="stakeholder_feedback">
                    Summary of feedback from teachers, students, or administrators
                  </Label>
                  <Textarea
                    id="stakeholder_feedback"
                    placeholder="Share any feedback you have gathered from users of this tool..."
                    value={form.stakeholder_feedback}
                    onChange={(e) => handleChange("stakeholder_feedback", e.target.value)}
                    rows={4}
                  />
                </div>
              </div>

              {/* Section 5: Recommendation */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">
                  5. Recommendation *
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="recommendation">Your Recommendation</Label>
                  <Select
                    value={form.recommendation}
                    onValueChange={(v) => handleChange("recommendation", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your recommendation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="renew">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          Renew - Continue subscription as is
                        </div>
                      </SelectItem>
                      <SelectItem value="renew_with_changes">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-yellow-500" />
                          Renew with Changes - Modify license count or terms
                        </div>
                      </SelectItem>
                      <SelectItem value="replace">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                          Replace - Switch to a different tool
                        </div>
                      </SelectItem>
                      <SelectItem value="retire">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-red-500" />
                          Retire - Discontinue this subscription
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {form.recommendation === "renew_with_changes" && (
                  <div className="space-y-2">
                    <Label htmlFor="proposed_changes">Proposed Changes</Label>
                    <Textarea
                      id="proposed_changes"
                      placeholder="Describe the changes you are proposing (e.g., increase licenses, change plan tier)..."
                      value={form.proposed_changes}
                      onChange={(e) => handleChange("proposed_changes", e.target.value)}
                      rows={3}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="justification">Justification *</Label>
                  <Textarea
                    id="justification"
                    placeholder="Provide a detailed justification for your recommendation..."
                    value={form.justification}
                    onChange={(e) => handleChange("justification", e.target.value)}
                    rows={4}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Include data points, usage metrics, or feedback that support your recommendation.
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-4 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setForm(initialFormState)}
                  disabled={submitting}
                >
                  Clear Form
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Assessment"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Help text */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          For support, contact{" "}
          <a href="mailto:edtech@sas.edu.sg" className="text-primary hover:underline">
            edtech@sas.edu.sg
          </a>
        </p>
      </div>
    </div>
  );
}
