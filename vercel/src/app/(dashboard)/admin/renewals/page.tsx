"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  RefreshCw,
  Loader2,
  MoreHorizontal,
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
import { useAuth } from "@/lib/auth/auth-context";
import type { RenewalAssessmentWithApp, AssessmentStatus, AssessmentRecommendation } from "@/lib/supabase/types";

function getStatusBadge(status: AssessmentStatus) {
  const config: Record<AssessmentStatus, { variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode; className?: string }> = {
    submitted: { variant: "secondary", icon: <Clock className="w-3 h-3 mr-1" /> },
    in_review: { variant: "default", icon: <FileText className="w-3 h-3 mr-1" />, className: "bg-blue-500" },
    approved: { variant: "default", icon: <CheckCircle className="w-3 h-3 mr-1" />, className: "bg-green-500" },
    rejected: { variant: "destructive", icon: <XCircle className="w-3 h-3 mr-1" /> },
    completed: { variant: "outline", icon: <CheckCircle className="w-3 h-3 mr-1" /> },
  };

  const { variant, icon, className } = config[status] || config.submitted;

  return (
    <Badge variant={variant} className={`capitalize ${className || ""}`}>
      {icon}
      {status.replace("_", " ")}
    </Badge>
  );
}

function getRecommendationBadge(recommendation: AssessmentRecommendation) {
  const config: Record<AssessmentRecommendation, { color: string; label: string }> = {
    renew: { color: "bg-green-100 text-green-800", label: "Renew" },
    renew_with_changes: { color: "bg-yellow-100 text-yellow-800", label: "Renew w/ Changes" },
    replace: { color: "bg-blue-100 text-blue-800", label: "Replace" },
    retire: { color: "bg-red-100 text-red-800", label: "Retire" },
  };

  const { color, label } = config[recommendation] || { color: "bg-gray-100 text-gray-800", label: recommendation };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${color}`}>
      {label}
    </span>
  );
}

export default function AdminRenewalsPage() {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState<RenewalAssessmentWithApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedAssessment, setSelectedAssessment] = useState<RenewalAssessmentWithApp | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    status: "" as AssessmentStatus | "",
    admin_notes: "",
  });

  const fetchAssessments = useCallback(async () => {
    setLoading(true);
    try {
      const url = statusFilter === "all"
        ? "/api/renewal-assessments"
        : `/api/renewal-assessments?status=${statusFilter}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setAssessments(data);
    } catch (error) {
      console.error("Error fetching assessments:", error);
      toast.error("Failed to load assessments");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchAssessments();
  }, [fetchAssessments]);

  const handleUpdateStatus = async () => {
    if (!selectedAssessment || !updateForm.status) return;

    setUpdating(true);
    try {
      const response = await fetch(`/api/renewal-assessments/${selectedAssessment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: updateForm.status,
          admin_notes: updateForm.admin_notes,
          reviewed_by: user?.email,
        }),
      });

      if (!response.ok) {
        throw new Error("Update failed");
      }

      toast.success("Assessment updated successfully");
      setUpdateModalOpen(false);
      fetchAssessments();
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update assessment");
    } finally {
      setUpdating(false);
    }
  };

  const openUpdateModal = (assessment: RenewalAssessmentWithApp) => {
    setSelectedAssessment(assessment);
    setUpdateForm({
      status: assessment.status,
      admin_notes: assessment.admin_notes || "",
    });
    setUpdateModalOpen(true);
  };

  const openDetailModal = (assessment: RenewalAssessmentWithApp) => {
    setSelectedAssessment(assessment);
    setDetailModalOpen(true);
  };

  // Filter assessments
  const filteredAssessments = assessments.filter((a) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      a.apps?.product?.toLowerCase().includes(query) ||
      a.submitter_email.toLowerCase().includes(query) ||
      a.apps?.vendor?.toLowerCase().includes(query)
    );
  });

  // Stats
  const stats = {
    total: assessments.length,
    submitted: assessments.filter((a) => a.status === "submitted").length,
    inReview: assessments.filter((a) => a.status === "in_review").length,
    completed: assessments.filter((a) => ["approved", "rejected", "completed"].includes(a.status)).length,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-heading">
            RENEWAL ASSESSMENTS
          </h1>
          <p className="text-muted-foreground">
            Review and manage teacher renewal assessment submissions
          </p>
        </div>
        <Button onClick={fetchAssessments} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total Assessments</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">{stats.submitted}</div>
            <p className="text-xs text-muted-foreground">Pending Review</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{stats.inReview}</div>
            <p className="text-xs text-muted-foreground">In Review</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by app or submitter..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="submitted">Submitted</SelectItem>
            <SelectItem value="in_review">In Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Assessment Submissions</CardTitle>
          <CardDescription>
            {filteredAssessments.length} assessment{filteredAssessments.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>App</TableHead>
                <TableHead>Submitter</TableHead>
                <TableHead>Recommendation</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
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
              ) : filteredAssessments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No assessments found
                  </TableCell>
                </TableRow>
              ) : (
                filteredAssessments.map((assessment) => (
                  <TableRow key={assessment.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{assessment.apps?.product}</div>
                        <div className="text-sm text-muted-foreground">
                          {assessment.apps?.vendor || "N/A"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{assessment.submitter_email}</div>
                      {assessment.submitter_name && (
                        <div className="text-xs text-muted-foreground">{assessment.submitter_name}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      {getRecommendationBadge(assessment.recommendation)}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {new Date(assessment.submission_date).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell>{getStatusBadge(assessment.status)}</TableCell>
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
                          <DropdownMenuItem onClick={() => openDetailModal(assessment)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openUpdateModal(assessment)}>
                            <FileText className="mr-2 h-4 w-4" />
                            Update Status
                          </DropdownMenuItem>
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assessment Details</DialogTitle>
            <DialogDescription>
              {selectedAssessment?.apps?.product} - Submitted by {selectedAssessment?.submitter_email}
            </DialogDescription>
          </DialogHeader>

          {selectedAssessment && (
            <div className="space-y-6">
              {/* Status and Recommendation */}
              <div className="flex gap-4">
                {getStatusBadge(selectedAssessment.status)}
                {getRecommendationBadge(selectedAssessment.recommendation)}
              </div>

              {/* App Info */}
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-medium mb-2">Application Info</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Product:</span>{" "}
                    {selectedAssessment.apps?.product}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Vendor:</span>{" "}
                    {selectedAssessment.apps?.vendor || "N/A"}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Division:</span>{" "}
                    {selectedAssessment.apps?.division || "N/A"}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Current Cost:</span>{" "}
                    {selectedAssessment.current_annual_cost
                      ? `$${selectedAssessment.current_annual_cost.toLocaleString()}`
                      : "Free"}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Renewal Date:</span>{" "}
                    {selectedAssessment.current_renewal_date
                      ? new Date(selectedAssessment.current_renewal_date).toLocaleDateString()
                      : "N/A"}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Licenses:</span>{" "}
                    {selectedAssessment.current_licenses || "N/A"}
                  </div>
                </div>
              </div>

              {/* Usage Questions */}
              <div className="space-y-4">
                <h4 className="font-medium">Usage & Impact</h4>
                {selectedAssessment.usage_frequency && (
                  <div>
                    <Label className="text-muted-foreground">Frequency</Label>
                    <p className="text-sm capitalize">{selectedAssessment.usage_frequency}</p>
                  </div>
                )}
                {selectedAssessment.primary_use_cases && (
                  <div>
                    <Label className="text-muted-foreground">Primary Use Cases</Label>
                    <p className="text-sm">{selectedAssessment.primary_use_cases}</p>
                  </div>
                )}
                {selectedAssessment.learning_impact && (
                  <div>
                    <Label className="text-muted-foreground">Learning Impact</Label>
                    <p className="text-sm">{selectedAssessment.learning_impact}</p>
                  </div>
                )}
                {selectedAssessment.workflow_integration && (
                  <div>
                    <Label className="text-muted-foreground">Workflow Integration</Label>
                    <p className="text-sm">{selectedAssessment.workflow_integration}</p>
                  </div>
                )}
                {selectedAssessment.alternatives_considered && (
                  <div>
                    <Label className="text-muted-foreground">Alternatives Considered</Label>
                    <p className="text-sm">{selectedAssessment.alternatives_considered}</p>
                  </div>
                )}
                {selectedAssessment.unique_value && (
                  <div>
                    <Label className="text-muted-foreground">Unique Value</Label>
                    <p className="text-sm">{selectedAssessment.unique_value}</p>
                  </div>
                )}
              </div>

              {/* Stakeholder Feedback */}
              {selectedAssessment.stakeholder_feedback && (
                <div>
                  <Label className="text-muted-foreground">Stakeholder Feedback</Label>
                  <p className="text-sm mt-1">{selectedAssessment.stakeholder_feedback}</p>
                </div>
              )}

              {/* Justification */}
              <div>
                <Label className="text-muted-foreground">Justification</Label>
                <p className="text-sm mt-1">{selectedAssessment.justification}</p>
              </div>

              {/* Proposed Changes */}
              {selectedAssessment.proposed_changes && (
                <div>
                  <Label className="text-muted-foreground">Proposed Changes</Label>
                  <p className="text-sm mt-1">{selectedAssessment.proposed_changes}</p>
                </div>
              )}

              {/* Admin Notes */}
              {selectedAssessment.admin_notes && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-800">Admin Notes</h4>
                  <p className="text-sm mt-1">{selectedAssessment.admin_notes}</p>
                  {selectedAssessment.reviewed_by && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Reviewed by {selectedAssessment.reviewed_by} on{" "}
                      {selectedAssessment.reviewed_at
                        ? new Date(selectedAssessment.reviewed_at).toLocaleString()
                        : "N/A"}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailModalOpen(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setDetailModalOpen(false);
              if (selectedAssessment) openUpdateModal(selectedAssessment);
            }}>
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Status Modal */}
      <Dialog open={updateModalOpen} onOpenChange={setUpdateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Assessment Status</DialogTitle>
            <DialogDescription>
              {selectedAssessment?.apps?.product}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={updateForm.status}
                onValueChange={(v) => setUpdateForm((prev) => ({ ...prev, status: v as AssessmentStatus }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="in_review">In Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Admin Notes</Label>
              <Textarea
                value={updateForm.admin_notes}
                onChange={(e) => setUpdateForm((prev) => ({ ...prev, admin_notes: e.target.value }))}
                placeholder="Add notes about this assessment..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setUpdateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStatus} disabled={updating || !updateForm.status}>
              {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
