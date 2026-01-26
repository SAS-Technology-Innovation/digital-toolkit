/**
 * Supabase Database Types
 *
 * These types define the structure of our Supabase tables.
 * They should match the tables created in Supabase.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      apps: {
        Row: {
          id: string;
          product: string;
          product_id: string | null; // Stable unique identifier from Google Sheets for sync deduplication
          description: string | null;
          category: string | null;
          subject: string | null;
          department: string | null;
          division: string | null;
          audience: string[] | null;
          website: string | null;
          tutorial_link: string | null;
          logo_url: string | null;
          sso_enabled: boolean;
          mobile_app: boolean;
          grade_levels: string | null;
          is_new: boolean;
          vendor: string | null;
          license_type: string | null;
          renewal_date: string | null;
          annual_cost: number | null;
          licenses: number | null;
          utilization: number | null;
          status: string | null;
          created_at: string;
          updated_at: string;
          synced_at: string | null;
          apps_script_id: string | null;
          // Fields from Apps Script
          enterprise: boolean;
          budget: string | null;
          support_email: string | null;
          date_added: string | null;
          is_whole_school: boolean;
          // EdTech Impact fields - Compliance
          privacy_policy_url: string | null;
          terms_url: string | null;
          gdpr_url: string | null;
          risk_rating: string | null;
          // EdTech Impact fields - Assessment
          global_rating: number | null;
          assessment_status: string | null; // RETIRE, UNDER_REVIEW, RETAIN, RECOMMENDED
          recommended_reason: string | null;
          // EdTech Impact fields - Accessibility
          accessibility: string | null;
          languages: Json | null;
          // EdTech Impact fields - Support
          support_options: Json | null;
          training_options: Json | null;
          // EdTech Impact fields - Commercial
          purchase_models: Json | null;
          price_from: string | null;
          alternatives: Json | null;
          // EdTech Impact fields - Contract
          contract_start_date: string | null;
          contract_end_date: string | null;
          auto_renew: boolean;
          notice_period: string | null;
          // EdTech Impact fields - Internal
          product_champion: string | null;
          product_manager: string | null;
          provider_contact: string | null;
          finance_contact: string | null;
          notes: string | null;
          // EdTech Impact metadata
          edtech_impact_id: string | null;
          last_edtech_sync: string | null;
        };
        Insert: {
          id?: string;
          product: string;
          product_id?: string | null;
          description?: string | null;
          category?: string | null;
          subject?: string | null;
          department?: string | null;
          division?: string | null;
          audience?: string[] | null;
          website?: string | null;
          tutorial_link?: string | null;
          logo_url?: string | null;
          sso_enabled?: boolean;
          mobile_app?: boolean;
          grade_levels?: string | null;
          is_new?: boolean;
          vendor?: string | null;
          license_type?: string | null;
          renewal_date?: string | null;
          annual_cost?: number | null;
          licenses?: number | null;
          utilization?: number | null;
          status?: string | null;
          created_at?: string;
          updated_at?: string;
          synced_at?: string | null;
          apps_script_id?: string | null;
          enterprise?: boolean;
          budget?: string | null;
          support_email?: string | null;
          date_added?: string | null;
          is_whole_school?: boolean;
          // EdTech Impact fields
          privacy_policy_url?: string | null;
          terms_url?: string | null;
          gdpr_url?: string | null;
          risk_rating?: string | null;
          global_rating?: number | null;
          assessment_status?: string | null;
          recommended_reason?: string | null;
          accessibility?: string | null;
          languages?: Json | null;
          support_options?: Json | null;
          training_options?: Json | null;
          purchase_models?: Json | null;
          price_from?: string | null;
          alternatives?: Json | null;
          contract_start_date?: string | null;
          contract_end_date?: string | null;
          auto_renew?: boolean;
          notice_period?: string | null;
          product_champion?: string | null;
          product_manager?: string | null;
          provider_contact?: string | null;
          finance_contact?: string | null;
          notes?: string | null;
          edtech_impact_id?: string | null;
          last_edtech_sync?: string | null;
        };
        Update: {
          id?: string;
          product?: string;
          product_id?: string | null;
          description?: string | null;
          category?: string | null;
          subject?: string | null;
          department?: string | null;
          division?: string | null;
          audience?: string[] | null;
          website?: string | null;
          tutorial_link?: string | null;
          logo_url?: string | null;
          sso_enabled?: boolean;
          mobile_app?: boolean;
          grade_levels?: string | null;
          is_new?: boolean;
          vendor?: string | null;
          license_type?: string | null;
          renewal_date?: string | null;
          annual_cost?: number | null;
          licenses?: number | null;
          utilization?: number | null;
          status?: string | null;
          created_at?: string;
          updated_at?: string;
          synced_at?: string | null;
          apps_script_id?: string | null;
          enterprise?: boolean;
          budget?: string | null;
          support_email?: string | null;
          date_added?: string | null;
          is_whole_school?: boolean;
          // EdTech Impact fields
          privacy_policy_url?: string | null;
          terms_url?: string | null;
          gdpr_url?: string | null;
          risk_rating?: string | null;
          global_rating?: number | null;
          assessment_status?: string | null;
          recommended_reason?: string | null;
          accessibility?: string | null;
          languages?: Json | null;
          support_options?: Json | null;
          training_options?: Json | null;
          purchase_models?: Json | null;
          price_from?: string | null;
          alternatives?: Json | null;
          contract_start_date?: string | null;
          contract_end_date?: string | null;
          auto_renew?: boolean;
          notice_period?: string | null;
          product_champion?: string | null;
          product_manager?: string | null;
          provider_contact?: string | null;
          finance_contact?: string | null;
          notes?: string | null;
          edtech_impact_id?: string | null;
          last_edtech_sync?: string | null;
        };
      };
      sync_logs: {
        Row: {
          id: string;
          sync_type: string;
          status: "pending" | "in_progress" | "completed" | "failed";
          records_synced: number | null;
          records_failed: number | null;
          error_message: string | null;
          started_at: string;
          completed_at: string | null;
          triggered_by: string | null;
        };
        Insert: {
          id?: string;
          sync_type: string;
          status?: "pending" | "in_progress" | "completed" | "failed";
          records_synced?: number | null;
          records_failed?: number | null;
          error_message?: string | null;
          started_at?: string;
          completed_at?: string | null;
          triggered_by?: string | null;
        };
        Update: {
          id?: string;
          sync_type?: string;
          status?: "pending" | "in_progress" | "completed" | "failed";
          records_synced?: number | null;
          records_failed?: number | null;
          error_message?: string | null;
          started_at?: string;
          completed_at?: string | null;
          triggered_by?: string | null;
        };
      };
      app_status: {
        Row: {
          id: string;
          app_id: string;
          status: "operational" | "issues" | "maintenance";
          response_time: number | null;
          last_checked: string;
          status_page_url: string | null;
        };
        Insert: {
          id?: string;
          app_id: string;
          status?: "operational" | "issues" | "maintenance";
          response_time?: number | null;
          last_checked?: string;
          status_page_url?: string | null;
        };
        Update: {
          id?: string;
          app_id?: string;
          status?: "operational" | "issues" | "maintenance";
          response_time?: number | null;
          last_checked?: string;
          status_page_url?: string | null;
        };
      };
      renewal_assessments: {
        Row: {
          id: string;
          app_id: string;
          submitter_email: string;
          submitter_name: string | null;
          submitter_department: string | null;
          submitter_division: string | null;
          submitter_profile_id: string | null;
          submission_date: string;
          status: "submitted" | "in_review" | "approved" | "rejected" | "completed";
          current_renewal_date: string | null;
          current_annual_cost: number | null;
          current_licenses: number | null;
          usage_frequency: string | null;
          primary_use_cases: string | null;
          learning_impact: string | null;
          workflow_integration: string | null;
          alternatives_considered: string | null;
          unique_value: string | null;
          stakeholder_feedback: string | null;
          recommendation: "renew" | "renew_with_changes" | "replace" | "retire";
          justification: string;
          proposed_changes: string | null;
          proposed_cost: number | null;
          proposed_licenses: number | null;
          admin_notes: string | null;
          reviewed_by: string | null;
          reviewed_at: string | null;
          outcome_notes: string | null;
          final_decision: "renew" | "renew_with_changes" | "replace" | "retire" | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          app_id: string;
          submitter_email: string;
          submitter_name?: string | null;
          submitter_department?: string | null;
          submitter_division?: string | null;
          submitter_profile_id?: string | null;
          submission_date?: string;
          status?: "submitted" | "in_review" | "approved" | "rejected" | "completed";
          current_renewal_date?: string | null;
          current_annual_cost?: number | null;
          current_licenses?: number | null;
          usage_frequency?: string | null;
          primary_use_cases?: string | null;
          learning_impact?: string | null;
          workflow_integration?: string | null;
          alternatives_considered?: string | null;
          unique_value?: string | null;
          stakeholder_feedback?: string | null;
          recommendation: "renew" | "renew_with_changes" | "replace" | "retire";
          justification: string;
          proposed_changes?: string | null;
          proposed_cost?: number | null;
          proposed_licenses?: number | null;
          admin_notes?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          outcome_notes?: string | null;
          final_decision?: "renew" | "renew_with_changes" | "replace" | "retire" | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          app_id?: string;
          submitter_email?: string;
          submitter_name?: string | null;
          submitter_department?: string | null;
          submitter_division?: string | null;
          submitter_profile_id?: string | null;
          submission_date?: string;
          status?: "submitted" | "in_review" | "approved" | "rejected" | "completed";
          current_renewal_date?: string | null;
          current_annual_cost?: number | null;
          current_licenses?: number | null;
          usage_frequency?: string | null;
          primary_use_cases?: string | null;
          learning_impact?: string | null;
          workflow_integration?: string | null;
          alternatives_considered?: string | null;
          unique_value?: string | null;
          stakeholder_feedback?: string | null;
          recommendation?: "renew" | "renew_with_changes" | "replace" | "retire";
          justification?: string;
          proposed_changes?: string | null;
          proposed_cost?: number | null;
          proposed_licenses?: number | null;
          admin_notes?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          outcome_notes?: string | null;
          final_decision?: "renew" | "renew_with_changes" | "replace" | "retire" | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      renewal_decisions: {
        Row: {
          id: string;
          app_id: string;
          renewal_cycle_year: number;
          ai_summary: string | null;
          ai_summary_generated_at: string | null;
          total_submissions: number;
          renew_count: number;
          renew_with_changes_count: number;
          replace_count: number;
          retire_count: number;
          assessor_email: string | null;
          assessor_name: string | null;
          assessor_comment: string | null;
          assessor_recommendation: "renew" | "renew_with_changes" | "replace" | "retire" | null;
          assessor_reviewed_at: string | null;
          approver_email: string | null;
          approver_name: string | null;
          approver_comment: string | null;
          final_decision: "renew" | "renew_with_changes" | "replace" | "retire" | null;
          final_decided_at: string | null;
          new_renewal_date: string | null;
          new_annual_cost: number | null;
          new_licenses: number | null;
          implementation_notes: string | null;
          status: "collecting" | "summarizing" | "assessor_review" | "final_review" | "decided" | "implemented";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          app_id: string;
          renewal_cycle_year?: number;
          ai_summary?: string | null;
          ai_summary_generated_at?: string | null;
          total_submissions?: number;
          renew_count?: number;
          renew_with_changes_count?: number;
          replace_count?: number;
          retire_count?: number;
          assessor_email?: string | null;
          assessor_name?: string | null;
          assessor_comment?: string | null;
          assessor_recommendation?: "renew" | "renew_with_changes" | "replace" | "retire" | null;
          assessor_reviewed_at?: string | null;
          approver_email?: string | null;
          approver_name?: string | null;
          approver_comment?: string | null;
          final_decision?: "renew" | "renew_with_changes" | "replace" | "retire" | null;
          final_decided_at?: string | null;
          new_renewal_date?: string | null;
          new_annual_cost?: number | null;
          new_licenses?: number | null;
          implementation_notes?: string | null;
          status?: "collecting" | "summarizing" | "assessor_review" | "final_review" | "decided" | "implemented";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          app_id?: string;
          renewal_cycle_year?: number;
          ai_summary?: string | null;
          ai_summary_generated_at?: string | null;
          total_submissions?: number;
          renew_count?: number;
          renew_with_changes_count?: number;
          replace_count?: number;
          retire_count?: number;
          assessor_email?: string | null;
          assessor_name?: string | null;
          assessor_comment?: string | null;
          assessor_recommendation?: "renew" | "renew_with_changes" | "replace" | "retire" | null;
          assessor_reviewed_at?: string | null;
          approver_email?: string | null;
          approver_name?: string | null;
          approver_comment?: string | null;
          final_decision?: "renew" | "renew_with_changes" | "replace" | "retire" | null;
          final_decided_at?: string | null;
          new_renewal_date?: string | null;
          new_annual_cost?: number | null;
          new_licenses?: number | null;
          implementation_notes?: string | null;
          status?: "collecting" | "summarizing" | "assessor_review" | "final_review" | "decided" | "implemented";
          created_at?: string;
          updated_at?: string;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          department: string | null;
          division: string | null;
          role: "staff" | "tic" | "approver" | "admin";
          avatar_url: string | null;
          is_active: boolean;
          first_submission_at: string | null;
          last_submission_at: string | null;
          total_submissions: number;
          auth_user_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name?: string | null;
          department?: string | null;
          division?: string | null;
          role?: "staff" | "tic" | "approver" | "admin";
          avatar_url?: string | null;
          is_active?: boolean;
          first_submission_at?: string | null;
          last_submission_at?: string | null;
          total_submissions?: number;
          auth_user_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          department?: string | null;
          division?: string | null;
          role?: "staff" | "tic" | "approver" | "admin";
          avatar_url?: string | null;
          is_active?: boolean;
          first_submission_at?: string | null;
          last_submission_at?: string | null;
          total_submissions?: number;
          auth_user_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      app_assignments: {
        Row: {
          id: string;
          app_id: string;
          user_id: string;
          role: "owner" | "champion" | "tic_manager";
          assigned_at: string;
          assigned_by: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          app_id: string;
          user_id: string;
          role: "owner" | "champion" | "tic_manager";
          assigned_at?: string;
          assigned_by?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          app_id?: string;
          user_id?: string;
          role?: "owner" | "champion" | "tic_manager";
          assigned_at?: string;
          assigned_by?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      app_status_type: "operational" | "issues" | "maintenance";
      sync_status_type: "pending" | "in_progress" | "completed" | "failed";
      assessment_status: "submitted" | "in_review" | "approved" | "rejected" | "completed";
      assessment_recommendation: "renew" | "renew_with_changes" | "replace" | "retire";
      decision_status: "collecting" | "summarizing" | "assessor_review" | "final_review" | "decided" | "implemented";
      user_role: "staff" | "tic" | "approver" | "admin";
      app_assignment_role: "owner" | "champion" | "tic_manager";
    };
  };
}

// Convenience types
export type App = Database["public"]["Tables"]["apps"]["Row"];
export type AppInsert = Database["public"]["Tables"]["apps"]["Insert"];
export type AppUpdate = Database["public"]["Tables"]["apps"]["Update"];

export type SyncLog = Database["public"]["Tables"]["sync_logs"]["Row"];
export type SyncLogInsert = Database["public"]["Tables"]["sync_logs"]["Insert"];

export type AppStatus = Database["public"]["Tables"]["app_status"]["Row"];

// Renewal Assessment types
export type AssessmentStatus = Database["public"]["Enums"]["assessment_status"];
export type AssessmentRecommendation = Database["public"]["Enums"]["assessment_recommendation"];
export type DecisionStatus = Database["public"]["Enums"]["decision_status"];

export type RenewalAssessment = Database["public"]["Tables"]["renewal_assessments"]["Row"];
export type RenewalAssessmentInsert = Database["public"]["Tables"]["renewal_assessments"]["Insert"];
export type RenewalAssessmentUpdate = Database["public"]["Tables"]["renewal_assessments"]["Update"];

// Renewal Decision types (aggregates multiple assessments)
export type RenewalDecision = Database["public"]["Tables"]["renewal_decisions"]["Row"];
export type RenewalDecisionInsert = Database["public"]["Tables"]["renewal_decisions"]["Insert"];
export type RenewalDecisionUpdate = Database["public"]["Tables"]["renewal_decisions"]["Update"];

export interface RenewalDecisionWithApp extends RenewalDecision {
  apps: {
    id: string;
    product: string;
    vendor: string | null;
    category: string | null;
    division: string | null;
    department: string | null;
    renewal_date: string | null;
    annual_cost: number | null;
    licenses: number | null;
  };
  assessments?: RenewalAssessment[];
}

// Joined type with app details
export interface RenewalAssessmentWithApp extends RenewalAssessment {
  apps: {
    id: string;
    product: string;
    vendor: string | null;
    category: string | null;
    division: string | null;
    department: string | null;
    renewal_date: string | null;
    annual_cost: number | null;
    licenses: number | null;
    license_type: string | null;
    website: string | null;
    description: string | null;
  };
  user_profiles?: {
    id: string;
    name: string | null;
    email: string;
    department: string | null;
    division: string | null;
    role: UserRole;
  } | null;
}

// User Profile types
export type UserRole = Database["public"]["Enums"]["user_role"];

export type UserProfile = Database["public"]["Tables"]["user_profiles"]["Row"];
export type UserProfileInsert = Database["public"]["Tables"]["user_profiles"]["Insert"];
export type UserProfileUpdate = Database["public"]["Tables"]["user_profiles"]["Update"];

// App Assignment types
export type AppAssignmentRole = Database["public"]["Enums"]["app_assignment_role"];

export type AppAssignment = Database["public"]["Tables"]["app_assignments"]["Row"];
export type AppAssignmentInsert = Database["public"]["Tables"]["app_assignments"]["Insert"];
export type AppAssignmentUpdate = Database["public"]["Tables"]["app_assignments"]["Update"];

// Joined type with user and app details
export interface AppAssignmentWithDetails extends AppAssignment {
  user_profiles: {
    id: string;
    name: string | null;
    email: string;
    department: string | null;
    division: string | null;
    avatar_url: string | null;
  };
  apps: {
    id: string;
    product: string;
    category: string | null;
    division: string | null;
    department: string | null;
    logo_url: string | null;
    website: string | null;
  };
}

// Type for "My Apps" view - apps with assignment info
export interface MyApp extends App {
  assignment_role: AppAssignmentRole;
  assigned_at: string;
}
