export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      cofounders: {
        Row: {
          founder_page_id: string
          id: string
          related_founder_id: string | null
          startup_id: string | null
        }
        Insert: {
          founder_page_id: string
          id?: string
          related_founder_id?: string | null
          startup_id?: string | null
        }
        Update: {
          founder_page_id?: string
          id?: string
          related_founder_id?: string | null
          startup_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cofounders_founder_page_id_fkey"
            columns: ["founder_page_id"]
            isOneToOne: false
            referencedRelation: "founder_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cofounders_related_founder_id_fkey"
            columns: ["related_founder_id"]
            isOneToOne: false
            referencedRelation: "founder_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cofounders_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "startups"
            referencedColumns: ["id"]
          },
        ]
      }
      founder_pages: {
        Row: {
          build_score: number
          content: string | null
          created_at: string
          created_by: string | null
          founder_name: string
          id: string
          profile_image_url: string | null
          slug: string
          summary: string | null
          updated_at: string
          verified_founder: boolean
          view_count: number
        }
        Insert: {
          build_score?: number
          content?: string | null
          created_at?: string
          created_by?: string | null
          founder_name: string
          id?: string
          profile_image_url?: string | null
          slug: string
          summary?: string | null
          updated_at?: string
          verified_founder?: boolean
          view_count?: number
        }
        Update: {
          build_score?: number
          content?: string | null
          created_at?: string
          created_by?: string | null
          founder_name?: string
          id?: string
          profile_image_url?: string | null
          slug?: string
          summary?: string | null
          updated_at?: string
          verified_founder?: boolean
          view_count?: number
        }
        Relationships: []
      }
      founder_startups: {
        Row: {
          founder_page_id: string
          id: string
          role: string | null
          startup_id: string
        }
        Insert: {
          founder_page_id: string
          id?: string
          role?: string | null
          startup_id: string
        }
        Update: {
          founder_page_id?: string
          id?: string
          role?: string | null
          startup_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "founder_startups_founder_page_id_fkey"
            columns: ["founder_page_id"]
            isOneToOne: false
            referencedRelation: "founder_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "founder_startups_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "startups"
            referencedColumns: ["id"]
          },
        ]
      }
      milestones: {
        Row: {
          date: string | null
          description: string | null
          id: string
          page_id: string
          title: string
          type: string | null
        }
        Insert: {
          date?: string | null
          description?: string | null
          id?: string
          page_id: string
          title: string
          type?: string | null
        }
        Update: {
          date?: string | null
          description?: string | null
          id?: string
          page_id?: string
          title?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "milestones_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "founder_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      page_claims: {
        Row: {
          claimer_user_id: string
          id: string
          page_id: string
          verification_method: string | null
          verified: boolean
          verified_at: string | null
        }
        Insert: {
          claimer_user_id: string
          id?: string
          page_id: string
          verification_method?: string | null
          verified?: boolean
          verified_at?: string | null
        }
        Update: {
          claimer_user_id?: string
          id?: string
          page_id?: string
          verification_method?: string | null
          verified?: boolean
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "page_claims_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "founder_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      page_revisions: {
        Row: {
          edited_at: string
          edited_by: string | null
          id: string
          new_content: string
          page_id: string
          previous_content: string
        }
        Insert: {
          edited_at?: string
          edited_by?: string | null
          id?: string
          new_content?: string
          page_id: string
          previous_content?: string
        }
        Update: {
          edited_at?: string
          edited_by?: string | null
          id?: string
          new_content?: string
          page_id?: string
          previous_content?: string
        }
        Relationships: [
          {
            foreignKeyName: "page_revisions_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "founder_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      page_views: {
        Row: {
          country: string | null
          device_type: string | null
          id: string
          page_id: string
          timestamp: string
          viewer_ip: string | null
        }
        Insert: {
          country?: string | null
          device_type?: string | null
          id?: string
          page_id: string
          timestamp?: string
          viewer_ip?: string | null
        }
        Update: {
          country?: string | null
          device_type?: string | null
          id?: string
          page_id?: string
          timestamp?: string
          viewer_ip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "page_views_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "founder_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      product_launches: {
        Row: {
          description: string | null
          id: string
          launch_date: string | null
          page_id: string
          product_name: string
          product_url: string | null
        }
        Insert: {
          description?: string | null
          id?: string
          launch_date?: string | null
          page_id: string
          product_name: string
          product_url?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          launch_date?: string | null
          page_id?: string
          product_name?: string
          product_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_launches_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "founder_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          reputation_score: number
          user_id: string
          username: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          reputation_score?: number
          user_id: string
          username?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          reputation_score?: number
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      startups: {
        Row: {
          description: string | null
          founded_year: number | null
          id: string
          name: string
          website: string | null
        }
        Insert: {
          description?: string | null
          founded_year?: number | null
          id?: string
          name: string
          website?: string | null
        }
        Update: {
          description?: string | null
          founded_year?: number | null
          id?: string
          name?: string
          website?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_view_count: {
        Args: { page_id_param: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "user" | "moderator" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["user", "moderator", "admin"],
    },
  },
} as const
