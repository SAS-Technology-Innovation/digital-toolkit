"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AudienceBadgeList } from "@/components/ui/audience-badge";
import { CategoryBadge } from "@/components/ui/category-badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/lib/auth/auth-context";
import type { AppData } from "@/components/app-card";
import {
  ExternalLink,
  PlayCircle,
  ShieldCheck,
  Smartphone,
  Layers,
  Key,
  Users,
  Crown,
  Star,
  Shield,
  Plus,
  X,
  Loader2,
} from "lucide-react";

// Get favicon URL from website
function getFaviconUrl(website: string | undefined): string {
  if (!website) return "";
  try {
    const domain = new URL(website).hostname;
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;
  } catch {
    return "";
  }
}

// Assignment types
interface Assignment {
  id: string;
  role: "owner" | "champion" | "tic_manager";
  assigned_at: string;
  notes: string | null;
  user_profiles: {
    id: string;
    name: string | null;
    email: string;
    department: string | null;
    division: string | null;
    avatar_url: string | null;
  };
}

interface User {
  id: string;
  name: string | null;
  email: string;
  department: string | null;
}

// Role display config
const roleConfig = {
  owner: { label: "Owner", icon: Crown, color: "bg-amber-500 text-white", description: "Primary responsible person" },
  champion: { label: "Champion", icon: Star, color: "bg-purple-500 text-white", description: "Product advocate/expert" },
  tic_manager: { label: "TIC Manager", icon: Shield, color: "bg-blue-500 text-white", description: "Technical oversight" },
};

interface AppDetailModalProps {
  app: AppData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AppDetailModal({ app, open, onOpenChange }: AppDetailModalProps) {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [addingAssignment, setAddingAssignment] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [userProfile, setUserProfile] = useState<{ role: string } | null>(null);

  // Check if current user can manage assignments (admin or tic)
  const canManageAssignments = userProfile && ["admin", "tic"].includes(userProfile.role);

  // Fetch user profile to check permissions
  useEffect(() => {
    if (user && open) {
      fetch("/api/users?current=true")
        .then((res) => res.json())
        .then((data) => {
          if (data.user) {
            setUserProfile({ role: data.user.role });
          }
        })
        .catch(() => setUserProfile(null));
    }
  }, [user, open]);

  // Fetch assignments when modal opens
  const fetchAssignments = useCallback(async () => {
    if (!app?.id) return;
    setLoadingAssignments(true);
    try {
      const res = await fetch(`/api/app-assignments?app_id=${app.id}`);
      const data = await res.json();
      setAssignments(data.assignments || []);
    } catch (err) {
      console.error("Failed to fetch assignments:", err);
      setAssignments([]);
    } finally {
      setLoadingAssignments(false);
    }
  }, [app?.id]);

  // Fetch users for assignment dropdown
  const fetchUsers = useCallback(async () => {
    if (!canManageAssignments) return;
    setLoadingUsers(true);
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  }, [canManageAssignments]);

  useEffect(() => {
    if (open && app?.id) {
      fetchAssignments();
    }
  }, [open, app?.id, fetchAssignments]);

  useEffect(() => {
    if (showAddForm && canManageAssignments) {
      fetchUsers();
    }
  }, [showAddForm, canManageAssignments, fetchUsers]);

  // Add assignment
  const handleAddAssignment = async () => {
    if (!app?.id || !selectedUserId || !selectedRole) return;
    setAddingAssignment(true);
    try {
      const res = await fetch("/api/app-assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          app_id: app.id,
          user_id: selectedUserId,
          role: selectedRole,
        }),
      });
      if (res.ok) {
        await fetchAssignments();
        setSelectedUserId("");
        setSelectedRole("");
        setShowAddForm(false);
      } else {
        const error = await res.json();
        alert(error.error || "Failed to add assignment");
      }
    } catch (err) {
      console.error("Failed to add assignment:", err);
      alert("Failed to add assignment");
    } finally {
      setAddingAssignment(false);
    }
  };

  // Remove assignment
  const handleRemoveAssignment = async (assignmentId: string) => {
    if (!confirm("Remove this assignment?")) return;
    try {
      const res = await fetch(`/api/app-assignments?id=${assignmentId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchAssignments();
      } else {
        alert("Failed to remove assignment");
      }
    } catch (err) {
      console.error("Failed to remove assignment:", err);
      alert("Failed to remove assignment");
    }
  };

  // Get initials from name or email
  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  // Filter out already assigned users for the selected role
  const availableUsers = users.filter(u => {
    if (!selectedRole) return true;
    // For owner and tic_manager, check if already assigned (only 1 allowed)
    if (selectedRole === "owner" || selectedRole === "tic_manager") {
      const existing = assignments.find(a => a.role === selectedRole);
      if (existing) return false;
    }
    // Check if this user is already assigned this role
    return !assignments.some(a => a.user_profiles.id === u.id && a.role === selectedRole);
  });

  if (!app) return null;

  const logoUrl = app.logoUrl || getFaviconUrl(app.website);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 gap-0">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-start gap-4 pr-8">
            {logoUrl && (
              <div className="w-16 h-16 flex items-center justify-center shrink-0">
                <img
                  src={logoUrl}
                  alt={`${app.product} logo`}
                  className="max-w-full max-h-full object-contain rounded-lg"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-2xl font-bold text-primary">
                {app.product}
              </DialogTitle>
              {app.description && (
                <DialogDescription className="mt-1">
                  {app.description}
                </DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Body */}
        <ScrollArea className="max-h-[calc(90vh-280px)]">
          <div className="p-6 space-y-6">
            {/* Team Section - Only show if app has ID */}
            {app.id && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4" />
                  Team
                  {canManageAssignments && !showAddForm && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-auto h-6 px-2"
                      onClick={() => setShowAddForm(true)}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add
                    </Button>
                  )}
                </h3>

                {/* Add Assignment Form */}
                {showAddForm && canManageAssignments && (
                  <div className="bg-muted/50 rounded-lg p-4 mb-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Add Team Member</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => {
                          setShowAddForm(false);
                          setSelectedUserId("");
                          setSelectedRole("");
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Select value={selectedRole} onValueChange={setSelectedRole}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(roleConfig).map(([key, config]) => {
                            // Disable if owner/tic_manager already exists
                            const disabled = (key === "owner" || key === "tic_manager") &&
                              assignments.some(a => a.role === key);
                            return (
                              <SelectItem key={key} value={key} disabled={disabled}>
                                <span className="flex items-center gap-2">
                                  <config.icon className="w-3 h-3" />
                                  {config.label}
                                </span>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <Select
                        value={selectedUserId}
                        onValueChange={setSelectedUserId}
                        disabled={!selectedRole || loadingUsers}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={loadingUsers ? "Loading..." : "Select user"} />
                        </SelectTrigger>
                        <SelectContent>
                          {availableUsers.map((u) => (
                            <SelectItem key={u.id} value={u.id}>
                              {u.name || u.email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      size="sm"
                      className="w-full"
                      disabled={!selectedUserId || !selectedRole || addingAssignment}
                      onClick={handleAddAssignment}
                    >
                      {addingAssignment ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Plus className="w-4 h-4 mr-2" />
                      )}
                      Add Assignment
                    </Button>
                  </div>
                )}

                {/* Assignments List */}
                {loadingAssignments ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  </div>
                ) : assignments.length === 0 ? (
                  <div className="text-center py-4 text-sm text-muted-foreground bg-muted/30 rounded-lg">
                    No team members assigned yet
                  </div>
                ) : (
                  <div className="space-y-2">
                    {(["owner", "champion", "tic_manager"] as const).map((role) => {
                      const roleAssignments = assignments.filter(a => a.role === role);
                      if (roleAssignments.length === 0) return null;
                      const config = roleConfig[role];
                      const RoleIcon = config.icon;
                      return (
                        <div key={role} className="space-y-2">
                          {roleAssignments.map((assignment) => (
                            <div
                              key={assignment.id}
                              className="flex items-center gap-3 bg-muted/50 rounded-lg p-3"
                            >
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-xs">
                                  {getInitials(assignment.user_profiles.name, assignment.user_profiles.email)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm truncate">
                                  {assignment.user_profiles.name || assignment.user_profiles.email}
                                </div>
                                <div className="text-xs text-muted-foreground truncate">
                                  {assignment.user_profiles.department || assignment.user_profiles.email}
                                </div>
                              </div>
                              <Badge className={`${config.color} shrink-0`}>
                                <RoleIcon className="w-3 h-3 mr-1" />
                                {config.label}
                              </Badge>
                              {canManageAssignments && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                                  onClick={() => handleRemoveAssignment(assignment.id)}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {app.id && <Separator />}

            {/* Details Section */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2 mb-3">
                <Layers className="w-4 h-4" />
                Details
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {app.category && app.category !== "N/A" && (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="text-xs font-medium text-muted-foreground uppercase">Category</div>
                    <div className="mt-1">
                      <CategoryBadge category={app.category} />
                    </div>
                  </div>
                )}
                {app.subject && app.subject !== "N/A" && (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="text-xs font-medium text-muted-foreground uppercase">Subject</div>
                    <div className="font-semibold">{app.subject}</div>
                  </div>
                )}
                {app.department && app.department !== "N/A" && (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="text-xs font-medium text-muted-foreground uppercase">Department</div>
                    <div className="font-semibold">{app.department}</div>
                  </div>
                )}
                {app.division && app.division !== "N/A" && (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="text-xs font-medium text-muted-foreground uppercase">Division</div>
                    <div className="font-semibold">{app.division}</div>
                  </div>
                )}
                {app.gradeLevels && app.gradeLevels !== "N/A" && (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="text-xs font-medium text-muted-foreground uppercase">Grade Levels</div>
                    <div className="font-semibold">{app.gradeLevels}</div>
                  </div>
                )}
                {app.audience && app.audience !== "N/A" && (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="text-xs font-medium text-muted-foreground uppercase mb-1">Audience</div>
                    <AudienceBadgeList audiences={app.audience} />
                  </div>
                )}
              </div>
            </div>

            {/* License Information Section */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2 mb-3">
                <Key className="w-4 h-4" />
                License Information
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {app.licenseType && app.licenseType !== "N/A" && (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="text-xs font-medium text-muted-foreground uppercase">License Type</div>
                    <div className="font-semibold">{app.licenseType}</div>
                  </div>
                )}
                {app.dateAdded && (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="text-xs font-medium text-muted-foreground uppercase">Date Added</div>
                    <div className="font-semibold">{new Date(app.dateAdded).toLocaleDateString()}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Features Section */}
            {(app.ssoEnabled || (app.mobileApp && app.mobileApp.toLowerCase() !== "no")) && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2 mb-3">
                  <ShieldCheck className="w-4 h-4" />
                  Features
                </h3>
                <div className="flex flex-wrap gap-2">
                  {app.ssoEnabled && (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                      <ShieldCheck className="w-4 h-4 mr-1" />
                      SSO Enabled
                    </Badge>
                  )}
                  {app.mobileApp && app.mobileApp.toLowerCase() !== "no" && (
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                      <Smartphone className="w-4 h-4 mr-1" />
                      Mobile App Available
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <DialogFooter className="p-4 border-t bg-muted/30 sm:justify-start">
          <div className="flex flex-wrap gap-3 w-full">
            {app.website && app.website !== "#" && app.website !== "N/A" && (
              <Button asChild className="flex-1 min-w-[140px]">
                <a href={app.website} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Visit Website
                </a>
              </Button>
            )}
            {app.tutorialLink && app.tutorialLink !== "N/A" && (
              <Button variant="secondary" asChild className="flex-1 min-w-[140px]">
                <a href={app.tutorialLink} target="_blank" rel="noopener noreferrer">
                  <PlayCircle className="w-4 h-4 mr-2" />
                  View Tutorial
                </a>
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
