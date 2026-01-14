"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Filter,
  Eye,
  CheckCircle,
  Clock,
  FileText,
  RefreshCw,
  Loader2,
  MoreHorizontal,
  Sparkles,
  Users,
  ArrowRight,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  Home,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type {
  RenewalDecisionWithApp,
  DecisionStatus,
  AssessmentRecommendation,
  RenewalAssessment
} from "@/lib/supabase/types";

function getStatusBadge(status: DecisionStatus) {
  const config: Record<DecisionStatus, { variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode; className?: string }> = {
    collecting: { variant: "secondary", icon: <Users className="w-3 h-3 mr-1" /> },
    summarizing: { variant: "default", icon: <Sparkles className="w-3 h-3 mr-1" />, className: "bg-purple-500" },
    assessor_review: { variant: "default", icon: <FileText className="w-3 h-3 mr-1" />, className: "bg-blue-500" },
    final_review: { variant: "default", icon: <Clock className="w-3 h-3 mr-1" />, className: "bg-yellow-500" },
    decided: { variant: "default", icon: <CheckCircle className="w-3 h-3 mr-1" />, className: "bg-green-500" },
    implemented: { variant: "outline", icon: <CheckCircle className="w-3 h-3 mr-1" /> },
  };

  const { variant, icon, className } = config[status] || config.collecting;
  const label = status.replace(/_/g, " ");

  return (
    <Badge variant={variant} className={`capitalize ${className || ""}`}>
      {icon}
      {label}
    </Badge>
  );
}

function getRecommendationBadge(recommendation: AssessmentRecommendation | null) {
  if (!recommendation) return null;

  const config: Record<AssessmentRecommendation, { color: string; label: string }> = {
    renew: { color: "bg-green-100 text-green-800", label: "Renew" },
    renew_with_changes: { color: "bg-yellow-100 text-yellow-800", label: "Renew w/ Changes" },
    replace: { color: "bg-blue-100 text-blue-800", label: "Replace" },
    retire: { color: "bg-red-100 text-red-800", label: "Retire" },
  };

  const { color, label } = config[recommendation];

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${color}`}>
      {label}
    </span>
  );
}

function formatCurrency(amount: number | null) {
  if (!amount || amount === 0) return "Free";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function TicReviewPage() {
  const [decisions, setDecisions] = useState<RenewalDecisionWithApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedDecision, setSelectedDecision] = useState<RenewalDecisionWithApp | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    assessor_comment: "",
    assessor_recommendation: "" as AssessmentRecommendation | "",
  });

  const fetchDecisions = useCallback(async () => {
    setLoading(true);
    try {
      // TIC sees decisions in collecting, summarizing, assessor_review statuses
      let url = "/api/renewal-decisions";
      if (statusFilter !== "all") {
        url += `?status=${statusFilter}`;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();

      // Filter to TIC-relevant statuses if "all" is selected
      const filtered = statusFilter === "all"
        ? data.filter((d: RenewalDecisionWithApp) =>
            ["collecting", "summarizing", "assessor_review"].includes(d.status)
          )
        : data;

      setDecisions(filtered);
    } catch (error) {
      console.error("Error fetching decisions:", error);
      toast.error("Failed to load decisions");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchDecisions();
  }, [fetchDecisions]);

  const handleGenerateAISummary = async (decision: RenewalDecisionWithApp) => {
    setGeneratingAI(true);
    try {
      const response = await fetch(`/api/renewal-decisions/${decision.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate_summary" }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate");
      }

      // Trigger AI summary generation via POST
      await fetch("/api/renewal-decisions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          app_id: decision.app_id,
          generate_summary: true
        }),
      });

      toast.success("AI summary generation started");
      fetchDecisions();
    } catch (error) {
      console.error("Generate error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate AI summary");
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!selectedDecision || !reviewForm.assessor_recommendation) {
      toast.error("Please select a recommendation");
      return;
    }

    setUpdating(true);
    try {
      const response = await fetch(`/api/renewal-decisions/${selectedDecision.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "tic_review",
          assessor_comment: reviewForm.assessor_comment,
          assessor_recommendation: reviewForm.assessor_recommendation,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Update failed");
      }

      toast.success("Review submitted successfully");
      setReviewModalOpen(false);
      fetchDecisions();
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to submit review");
    } finally {
      setUpdating(false);
    }
  };

  const openDetailModal = async (decision: RenewalDecisionWithApp) => {
    setSelectedDecision(decision);
    setDetailModalOpen(true);

    // Fetch full details with assessments
    try {
      const response = await fetch(`/api/renewal-decisions/${decision.id}`);
      if (response.ok) {
        const fullDecision = await response.json();
        setSelectedDecision(fullDecision);
      }
    } catch (error) {
      console.error("Error fetching decision details:", error);
    }
  };

  const openReviewModal = (decision: RenewalDecisionWithApp) => {
    setSelectedDecision(decision);
    setReviewForm({
      assessor_comment: decision.assessor_comment || "",
      assessor_recommendation: decision.assessor_recommendation || "",
    });
    setReviewModalOpen(true);
  };

  // Filter decisions
  const filteredDecisions = decisions.filter((d) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      d.apps?.product?.toLowerCase().includes(query) ||
      d.apps?.vendor?.toLowerCase().includes(query)
    );
  });

  // Stats
  const stats = {
    total: decisions.length,
    collecting: decisions.filter((d) => d.status === "collecting").length,
    summarizing: decisions.filter((d) => d.status === "summarizing").length,
    needsReview: decisions.filter((d) => d.status === "assessor_review").length,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">
              <Home className="h-4 w-4" />
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink href="/renewals">Renewals</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage>TIC Review</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-heading">
            TIC REVIEW DASHBOARD
          </h1>
          <p className="text-muted-foreground">
            Aggregate teacher feedback and make recommendations
          </p>
        </div>
        <Button onClick={fetchDecisions} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{stats.collecting}</div>
            <p className="text-xs text-muted-foreground">Collecting Feedback</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-600">{stats.summarizing}</div>
            <p className="text-xs text-muted-foreground">AI Summarizing</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">{stats.needsReview}</div>
            <p className="text-xs text-muted-foreground">Needs Your Review</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by app name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All TIC Statuses</SelectItem>
            <SelectItem value="collecting">Collecting</SelectItem>
            <SelectItem value="summarizing">Summarizing</SelectItem>
            <SelectItem value="assessor_review">Needs Review</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Renewal Decisions</CardTitle>
          <CardDescription>
            {filteredDecisions.length} decision{filteredDecisions.length !== 1 ? "s" : ""} awaiting your action
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>App</TableHead>
                <TableHead>Submissions</TableHead>
                <TableHead>Feedback Summary</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Current Cost</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6}>
                      <Skeleton className="h-12 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredDecisions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No decisions pending your review
                  </TableCell>
                </TableRow>
              ) : (
                filteredDecisions.map((decision) => (
                  <TableRow key={decision.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{decision.apps?.product}</div>
                        <div className="text-sm text-muted-foreground">
                          {decision.apps?.vendor || "N/A"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{decision.total_submissions}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {decision.renew_count > 0 && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-green-100 text-green-800">
                            <ThumbsUp className="h-3 w-3 mr-1" />
                            {decision.renew_count}
                          </span>
                        )}
                        {decision.renew_with_changes_count > 0 && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-yellow-100 text-yellow-800">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {decision.renew_with_changes_count}
                          </span>
                        )}
                        {decision.replace_count > 0 && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-blue-100 text-blue-800">
                            <ArrowRight className="h-3 w-3 mr-1" />
                            {decision.replace_count}
                          </span>
                        )}
                        {decision.retire_count > 0 && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-red-100 text-red-800">
                            <ThumbsDown className="h-3 w-3 mr-1" />
                            {decision.retire_count}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(decision.status)}</TableCell>
                    <TableCell>{formatCurrency(decision.apps?.annual_cost ?? null)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => openDetailModal(decision)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          {decision.status === "collecting" && (
                            <DropdownMenuItem
                              onClick={() => handleGenerateAISummary(decision)}
                              disabled={generatingAI}
                            >
                              <Sparkles className="mr-2 h-4 w-4" />
                              Generate AI Summary
                            </DropdownMenuItem>
                          )}
                          {["summarizing", "assessor_review"].includes(decision.status) && (
                            <DropdownMenuItem onClick={() => openReviewModal(decision)}>
                              <FileText className="mr-2 h-4 w-4" />
                              Submit Review
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{selectedDecision?.apps?.product}</DialogTitle>
            <DialogDescription>
              {selectedDecision?.apps?.vendor} - {selectedDecision?.total_submissions} submissions
            </DialogDescription>
          </DialogHeader>

          {selectedDecision && (
            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="assessments">Assessments</TabsTrigger>
                <TabsTrigger value="app-info">App Info</TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="space-y-4">
                <ScrollArea className="h-[400px] pr-4">
                  {/* Feedback Breakdown */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Feedback Breakdown</h4>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                        <div className="text-2xl font-bold text-green-700">{selectedDecision.renew_count}</div>
                        <div className="text-xs text-green-600">Renew</div>
                      </div>
                      <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                        <div className="text-2xl font-bold text-yellow-700">{selectedDecision.renew_with_changes_count}</div>
                        <div className="text-xs text-yellow-600">With Changes</div>
                      </div>
                      <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                        <div className="text-2xl font-bold text-blue-700">{selectedDecision.replace_count}</div>
                        <div className="text-xs text-blue-600">Replace</div>
                      </div>
                      <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                        <div className="text-2xl font-bold text-red-700">{selectedDecision.retire_count}</div>
                        <div className="text-xs text-red-600">Retire</div>
                      </div>
                    </div>

                    {/* AI Summary */}
                    {selectedDecision.ai_summary && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-purple-500" />
                          <h4 className="font-medium">AI Summary</h4>
                          {selectedDecision.ai_summary_generated_at && (
                            <span className="text-xs text-muted-foreground">
                              Generated {new Date(selectedDecision.ai_summary_generated_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                          <p className="text-sm whitespace-pre-wrap">{selectedDecision.ai_summary}</p>
                        </div>
                      </div>
                    )}

                    {/* Current Review Status */}
                    {selectedDecision.assessor_recommendation && (
                      <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                        <h4 className="font-medium text-blue-800 mb-2">Your Previous Review</h4>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm text-muted-foreground">Recommendation:</span>
                          {getRecommendationBadge(selectedDecision.assessor_recommendation)}
                        </div>
                        {selectedDecision.assessor_comment && (
                          <p className="text-sm">{selectedDecision.assessor_comment}</p>
                        )}
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="assessments">
                <ScrollArea className="h-[400px] pr-4">
                  {selectedDecision.assessments && selectedDecision.assessments.length > 0 ? (
                    <div className="space-y-4">
                      {selectedDecision.assessments.map((assessment: RenewalAssessment, idx: number) => (
                        <div key={assessment.id} className="p-4 rounded-lg border">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">Submission {idx + 1}</span>
                            {getRecommendationBadge(assessment.recommendation)}
                          </div>
                          <div className="text-sm text-muted-foreground mb-2">
                            {assessment.submitter_email} - {new Date(assessment.submission_date).toLocaleDateString()}
                          </div>
                          <Separator className="my-2" />
                          <div className="space-y-2 text-sm">
                            {assessment.usage_frequency && (
                              <div><strong>Usage:</strong> {assessment.usage_frequency}</div>
                            )}
                            {assessment.primary_use_cases && (
                              <div><strong>Use Cases:</strong> {assessment.primary_use_cases}</div>
                            )}
                            {assessment.learning_impact && (
                              <div><strong>Impact:</strong> {assessment.learning_impact}</div>
                            )}
                            <div><strong>Justification:</strong> {assessment.justification}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No detailed assessments loaded
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="app-info">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Division</Label>
                      <p>{selectedDecision.apps?.division || "N/A"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Department</Label>
                      <p>{selectedDecision.apps?.department || "N/A"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Category</Label>
                      <p>{selectedDecision.apps?.category || "N/A"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Annual Cost</Label>
                      <p>{formatCurrency(selectedDecision.apps?.annual_cost ?? null)}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Licenses</Label>
                      <p>{selectedDecision.apps?.licenses || "N/A"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Renewal Date</Label>
                      <p>
                        {selectedDecision.apps?.renewal_date
                          ? new Date(selectedDecision.apps.renewal_date).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailModalOpen(false)}>
              Close
            </Button>
            {selectedDecision && ["summarizing", "assessor_review"].includes(selectedDecision.status) && (
              <Button onClick={() => {
                setDetailModalOpen(false);
                openReviewModal(selectedDecision);
              }}>
                Submit Review
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Modal */}
      <Dialog open={reviewModalOpen} onOpenChange={setReviewModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Submit TIC Review</DialogTitle>
            <DialogDescription>
              {selectedDecision?.apps?.product} - Make your recommendation
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-3">
              <Label>Your Recommendation</Label>
              <RadioGroup
                value={reviewForm.assessor_recommendation}
                onValueChange={(value) => setReviewForm(prev => ({
                  ...prev,
                  assessor_recommendation: value as AssessmentRecommendation
                }))}
                className="grid grid-cols-2 gap-3"
              >
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-green-200 bg-green-50 hover:bg-green-100 cursor-pointer">
                  <RadioGroupItem value="renew" id="renew" />
                  <Label htmlFor="renew" className="cursor-pointer text-green-800">Renew</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-yellow-200 bg-yellow-50 hover:bg-yellow-100 cursor-pointer">
                  <RadioGroupItem value="renew_with_changes" id="renew_with_changes" />
                  <Label htmlFor="renew_with_changes" className="cursor-pointer text-yellow-800">Renew w/ Changes</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 cursor-pointer">
                  <RadioGroupItem value="replace" id="replace" />
                  <Label htmlFor="replace" className="cursor-pointer text-blue-800">Replace</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 cursor-pointer">
                  <RadioGroupItem value="retire" id="retire" />
                  <Label htmlFor="retire" className="cursor-pointer text-red-800">Retire</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Comment / Rationale</Label>
              <Textarea
                value={reviewForm.assessor_comment}
                onChange={(e) => setReviewForm(prev => ({ ...prev, assessor_comment: e.target.value }))}
                placeholder="Provide context for your recommendation..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitReview}
              disabled={updating || !reviewForm.assessor_recommendation}
            >
              {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
