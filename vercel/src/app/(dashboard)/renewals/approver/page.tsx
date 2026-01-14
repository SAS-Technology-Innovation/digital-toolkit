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
  Gavel,
  DollarSign,
  Calendar,
  Users,
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
} from "@/lib/supabase/types";

function getStatusBadge(status: DecisionStatus) {
  const config: Record<DecisionStatus, { variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode; className?: string }> = {
    collecting: { variant: "secondary", icon: <Users className="w-3 h-3 mr-1" /> },
    summarizing: { variant: "secondary", icon: <Clock className="w-3 h-3 mr-1" /> },
    assessor_review: { variant: "secondary", icon: <FileText className="w-3 h-3 mr-1" /> },
    final_review: { variant: "default", icon: <Gavel className="w-3 h-3 mr-1" />, className: "bg-yellow-500" },
    decided: { variant: "default", icon: <CheckCircle className="w-3 h-3 mr-1" />, className: "bg-green-500" },
    implemented: { variant: "outline", icon: <CheckCircle className="w-3 h-3 mr-1" /> },
  };

  const { variant, icon, className } = config[status] || config.final_review;
  const label = status.replace(/_/g, " ");

  return (
    <Badge variant={variant} className={`capitalize ${className || ""}`}>
      {icon}
      {label}
    </Badge>
  );
}

function getRecommendationBadge(recommendation: AssessmentRecommendation | null) {
  if (!recommendation) return <span className="text-muted-foreground text-xs">Pending</span>;

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

export default function ApproverDecisionPage() {
  const [decisions, setDecisions] = useState<RenewalDecisionWithApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedDecision, setSelectedDecision] = useState<RenewalDecisionWithApp | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [decisionModalOpen, setDecisionModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [decisionForm, setDecisionForm] = useState({
    final_decision: "" as AssessmentRecommendation | "",
    approver_comment: "",
    new_renewal_date: "",
    new_annual_cost: "",
    new_licenses: "",
    implementation_notes: "",
  });

  const fetchDecisions = useCallback(async () => {
    setLoading(true);
    try {
      let url = "/api/renewal-decisions";
      if (statusFilter !== "all") {
        url += `?status=${statusFilter}`;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();

      // Approver sees decisions in final_review, decided, implemented statuses
      const filtered = statusFilter === "all"
        ? data.filter((d: RenewalDecisionWithApp) =>
            ["final_review", "decided", "implemented"].includes(d.status)
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

  const handleSubmitDecision = async () => {
    if (!selectedDecision || !decisionForm.final_decision) {
      toast.error("Please select a final decision");
      return;
    }

    setUpdating(true);
    try {
      const response = await fetch(`/api/renewal-decisions/${selectedDecision.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "director_decision",
          final_decision: decisionForm.final_decision,
          approver_comment: decisionForm.approver_comment,
          new_renewal_date: decisionForm.new_renewal_date || null,
          new_annual_cost: decisionForm.new_annual_cost ? Number(decisionForm.new_annual_cost) : null,
          new_licenses: decisionForm.new_licenses ? Number(decisionForm.new_licenses) : null,
          implementation_notes: decisionForm.implementation_notes || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Update failed");
      }

      toast.success("Decision recorded successfully");
      setDecisionModalOpen(false);
      fetchDecisions();
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to submit decision");
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

  const openDecisionModal = (decision: RenewalDecisionWithApp) => {
    setSelectedDecision(decision);

    // Pre-populate with TIC recommendation if available
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);

    setDecisionForm({
      final_decision: decision.assessor_recommendation || "",
      approver_comment: decision.approver_comment || "",
      new_renewal_date: decision.new_renewal_date || nextYear.toISOString().split("T")[0],
      new_annual_cost: decision.new_annual_cost?.toString() || decision.apps?.annual_cost?.toString() || "",
      new_licenses: decision.new_licenses?.toString() || decision.apps?.licenses?.toString() || "",
      implementation_notes: decision.implementation_notes || "",
    });
    setDecisionModalOpen(true);
  };

  // Filter decisions
  const filteredDecisions = decisions.filter((d) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      d.apps?.product?.toLowerCase().includes(query) ||
      d.apps?.vendor?.toLowerCase().includes(query) ||
      d.assessor_name?.toLowerCase().includes(query)
    );
  });

  // Stats
  const stats = {
    total: decisions.length,
    pendingDecision: decisions.filter((d) => d.status === "final_review").length,
    decided: decisions.filter((d) => d.status === "decided").length,
    implemented: decisions.filter((d) => d.status === "implemented").length,
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
            <BreadcrumbPage>Approver Decisions</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-heading">
            APPROVER DECISIONS
          </h1>
          <p className="text-muted-foreground">
            Review TIC recommendations and make final renewal decisions
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
            <p className="text-xs text-muted-foreground">Total in Queue</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingDecision}</div>
            <p className="text-xs text-muted-foreground">Awaiting Decision</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{stats.decided}</div>
            <p className="text-xs text-muted-foreground">Decided</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{stats.implemented}</div>
            <p className="text-xs text-muted-foreground">Implemented</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by app or TIC..."
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
            <SelectItem value="all">All Approver Statuses</SelectItem>
            <SelectItem value="final_review">Awaiting Decision</SelectItem>
            <SelectItem value="decided">Decided</SelectItem>
            <SelectItem value="implemented">Implemented</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Renewal Decisions</CardTitle>
          <CardDescription>
            {filteredDecisions.length} decision{filteredDecisions.length !== 1 ? "s" : ""} in your queue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>App</TableHead>
                <TableHead>TIC Review</TableHead>
                <TableHead>TIC Recommendation</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Final Decision</TableHead>
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
                    No decisions awaiting your approval
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
                      {decision.assessor_name ? (
                        <div className="text-sm">
                          <div>{decision.assessor_name}</div>
                          {decision.assessor_reviewed_at && (
                            <div className="text-xs text-muted-foreground">
                              {new Date(decision.assessor_reviewed_at).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Pending</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {getRecommendationBadge(decision.assessor_recommendation)}
                    </TableCell>
                    <TableCell>{getStatusBadge(decision.status)}</TableCell>
                    <TableCell>
                      {getRecommendationBadge(decision.final_decision)}
                    </TableCell>
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
                          {decision.status === "final_review" && (
                            <DropdownMenuItem onClick={() => openDecisionModal(decision)}>
                              <Gavel className="mr-2 h-4 w-4" />
                              Make Decision
                            </DropdownMenuItem>
                          )}
                          {decision.status === "decided" && (
                            <DropdownMenuItem onClick={() => openDecisionModal(decision)}>
                              <FileText className="mr-2 h-4 w-4" />
                              Edit Decision
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
              {selectedDecision?.apps?.vendor} - Review Details
            </DialogDescription>
          </DialogHeader>

          {selectedDecision && (
            <Tabs defaultValue="review" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="review">TIC Review</TabsTrigger>
                <TabsTrigger value="feedback">Teacher Feedback</TabsTrigger>
                <TabsTrigger value="decision">Decision</TabsTrigger>
              </TabsList>

              <TabsContent value="review" className="space-y-4">
                <ScrollArea className="h-[400px] pr-4">
                  {/* TIC Review */}
                  {selectedDecision.assessor_recommendation ? (
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-blue-800">TIC Recommendation</h4>
                          {getRecommendationBadge(selectedDecision.assessor_recommendation)}
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">
                          Reviewed by {selectedDecision.assessor_name || selectedDecision.assessor_email} on{" "}
                          {selectedDecision.assessor_reviewed_at
                            ? new Date(selectedDecision.assessor_reviewed_at).toLocaleDateString()
                            : "N/A"}
                        </div>
                        {selectedDecision.assessor_comment && (
                          <p className="text-sm mt-2">{selectedDecision.assessor_comment}</p>
                        )}
                      </div>

                      {/* AI Summary */}
                      {selectedDecision.ai_summary && (
                        <div className="space-y-2">
                          <h4 className="font-medium">AI-Generated Summary</h4>
                          <div className="p-4 rounded-lg bg-gray-50 border">
                            <p className="text-sm whitespace-pre-wrap">{selectedDecision.ai_summary}</p>
                          </div>
                        </div>
                      )}

                      {/* Feedback Breakdown */}
                      <div className="space-y-2">
                        <h4 className="font-medium">Teacher Feedback Summary</h4>
                        <div className="grid grid-cols-4 gap-2">
                          <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-center">
                            <div className="text-xl font-bold text-green-700">{selectedDecision.renew_count}</div>
                            <div className="text-xs text-green-600">Renew</div>
                          </div>
                          <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-center">
                            <div className="text-xl font-bold text-yellow-700">{selectedDecision.renew_with_changes_count}</div>
                            <div className="text-xs text-yellow-600">Changes</div>
                          </div>
                          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-center">
                            <div className="text-xl font-bold text-blue-700">{selectedDecision.replace_count}</div>
                            <div className="text-xs text-blue-600">Replace</div>
                          </div>
                          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-center">
                            <div className="text-xl font-bold text-red-700">{selectedDecision.retire_count}</div>
                            <div className="text-xs text-red-600">Retire</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      TIC review not yet submitted
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="feedback">
                <ScrollArea className="h-[400px] pr-4">
                  {selectedDecision.assessments && selectedDecision.assessments.length > 0 ? (
                    <div className="space-y-4">
                      {selectedDecision.assessments.map((assessment, idx) => (
                        <div key={assessment.id} className="p-4 rounded-lg border">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">Submission {idx + 1}</span>
                            {getRecommendationBadge(assessment.recommendation)}
                          </div>
                          <div className="text-sm text-muted-foreground mb-2">
                            {assessment.submitter_email}
                          </div>
                          <Separator className="my-2" />
                          <div className="space-y-2 text-sm">
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
                      {selectedDecision.total_submissions} submission(s) - view details to load
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="decision">
                <div className="space-y-4">
                  {selectedDecision.final_decision ? (
                    <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-green-800">Final Decision</h4>
                        {getRecommendationBadge(selectedDecision.final_decision)}
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        Decided by {selectedDecision.approver_name || selectedDecision.approver_email} on{" "}
                        {selectedDecision.final_decided_at
                          ? new Date(selectedDecision.final_decided_at).toLocaleDateString()
                          : "N/A"}
                      </div>
                      {selectedDecision.approver_comment && (
                        <p className="text-sm mt-2">{selectedDecision.approver_comment}</p>
                      )}

                      {/* New Terms */}
                      {(selectedDecision.new_renewal_date || selectedDecision.new_annual_cost || selectedDecision.new_licenses) && (
                        <div className="mt-4 pt-4 border-t border-green-200">
                          <h5 className="text-sm font-medium text-green-800 mb-2">New Terms</h5>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            {selectedDecision.new_renewal_date && (
                              <div>
                                <span className="text-muted-foreground">Renewal Date:</span>
                                <div>{new Date(selectedDecision.new_renewal_date).toLocaleDateString()}</div>
                              </div>
                            )}
                            {selectedDecision.new_annual_cost !== null && (
                              <div>
                                <span className="text-muted-foreground">Annual Cost:</span>
                                <div>{formatCurrency(selectedDecision.new_annual_cost)}</div>
                              </div>
                            )}
                            {selectedDecision.new_licenses !== null && (
                              <div>
                                <span className="text-muted-foreground">Licenses:</span>
                                <div>{selectedDecision.new_licenses}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {selectedDecision.implementation_notes && (
                        <div className="mt-4 pt-4 border-t border-green-200">
                          <h5 className="text-sm font-medium text-green-800 mb-1">Implementation Notes</h5>
                          <p className="text-sm">{selectedDecision.implementation_notes}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No decision made yet
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailModalOpen(false)}>
              Close
            </Button>
            {selectedDecision && selectedDecision.status === "final_review" && (
              <Button onClick={() => {
                setDetailModalOpen(false);
                openDecisionModal(selectedDecision);
              }}>
                <Gavel className="mr-2 h-4 w-4" />
                Make Decision
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Decision Modal */}
      <Dialog open={decisionModalOpen} onOpenChange={setDecisionModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Final Decision</DialogTitle>
            <DialogDescription>
              {selectedDecision?.apps?.product} - Record your decision
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-6 pr-4">
              {/* TIC Recommendation Summary */}
              {selectedDecision?.assessor_recommendation && (
                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-blue-800 font-medium">TIC Recommends:</span>
                    {getRecommendationBadge(selectedDecision.assessor_recommendation)}
                  </div>
                </div>
              )}

              {/* Decision */}
              <div className="space-y-3">
                <Label>Your Decision *</Label>
                <RadioGroup
                  value={decisionForm.final_decision}
                  onValueChange={(value) => setDecisionForm(prev => ({
                    ...prev,
                    final_decision: value as AssessmentRecommendation
                  }))}
                  className="grid grid-cols-2 gap-3"
                >
                  <div className="flex items-center space-x-2 p-3 rounded-lg border border-green-200 bg-green-50 hover:bg-green-100 cursor-pointer">
                    <RadioGroupItem value="renew" id="d-renew" />
                    <Label htmlFor="d-renew" className="cursor-pointer text-green-800">Renew</Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 rounded-lg border border-yellow-200 bg-yellow-50 hover:bg-yellow-100 cursor-pointer">
                    <RadioGroupItem value="renew_with_changes" id="d-renew_with_changes" />
                    <Label htmlFor="d-renew_with_changes" className="cursor-pointer text-yellow-800">Renew w/ Changes</Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 cursor-pointer">
                    <RadioGroupItem value="replace" id="d-replace" />
                    <Label htmlFor="d-replace" className="cursor-pointer text-blue-800">Replace</Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 cursor-pointer">
                    <RadioGroupItem value="retire" id="d-retire" />
                    <Label htmlFor="d-retire" className="cursor-pointer text-red-800">Retire</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Comment */}
              <div className="space-y-2">
                <Label>Comment / Rationale</Label>
                <Textarea
                  value={decisionForm.approver_comment}
                  onChange={(e) => setDecisionForm(prev => ({ ...prev, approver_comment: e.target.value }))}
                  placeholder="Explain your decision..."
                  rows={3}
                />
              </div>

              <Separator />

              {/* New Terms (for renew/renew_with_changes) */}
              {["renew", "renew_with_changes"].includes(decisionForm.final_decision) && (
                <div className="space-y-4">
                  <h4 className="font-medium">New Subscription Terms</h4>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      New Renewal Date
                    </Label>
                    <Input
                      type="date"
                      value={decisionForm.new_renewal_date}
                      onChange={(e) => setDecisionForm(prev => ({ ...prev, new_renewal_date: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Annual Cost
                      </Label>
                      <Input
                        type="number"
                        value={decisionForm.new_annual_cost}
                        onChange={(e) => setDecisionForm(prev => ({ ...prev, new_annual_cost: e.target.value }))}
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Licenses
                      </Label>
                      <Input
                        type="number"
                        value={decisionForm.new_licenses}
                        onChange={(e) => setDecisionForm(prev => ({ ...prev, new_licenses: e.target.value }))}
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Implementation Notes */}
              <div className="space-y-2">
                <Label>Implementation Notes</Label>
                <Textarea
                  value={decisionForm.implementation_notes}
                  onChange={(e) => setDecisionForm(prev => ({ ...prev, implementation_notes: e.target.value }))}
                  placeholder="Notes for implementation (vendor contact, migration steps, etc.)..."
                  rows={3}
                />
              </div>
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDecisionModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitDecision}
              disabled={updating || !decisionForm.final_decision}
            >
              {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Record Decision
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
