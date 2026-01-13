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
        };
        Insert: {
          id?: string;
          product: string;
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
        };
        Update: {
          id?: string;
          product?: string;
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
