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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          admin_role: string | null
          created_at: string
          id: string
          two_factor_enabled: boolean | null
          two_factor_secret: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_role?: string | null
          created_at?: string
          id?: string
          two_factor_enabled?: boolean | null
          two_factor_secret?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_role?: string | null
          created_at?: string
          id?: string
          two_factor_enabled?: boolean | null
          two_factor_secret?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      bookmarks: {
        Row: {
          business_id: string
          id: string
          user_id: string
        }
        Insert: {
          business_id: string
          id?: string
          user_id: string
        }
        Update: {
          business_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookmarks_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_categories: {
        Row: {
          created_at: string
          id: string
          name: string
          popular_products: string[] | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          popular_products?: string[] | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          popular_products?: string[] | null
        }
        Relationships: []
      }
      business_reviews: {
        Row: {
          business_id: string
          comment: string | null
          created_at: string
          id: string
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          business_id: string
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          updated_at?: string
          user_id: string
        }
        Update: {
          business_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_reviews_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          address: string | null
          business_options: string[] | null
          category: string | null
          created_at: string
          description: string | null
          email: string | null
          facebook_page: string | null
          id: string
          image_url: string | null
          information_website: string | null
          last_payment_date: string | null
          license_expired_date: string | null
          listing_expired_date: string | null
          name: string
          odoo_expired_date: string | null
          owner_id: string
          payment_status: string
          phone: string | null
          "POS+Website": number | null
          product_images: string[] | null
          products_catalog: string | null
          province_district: string | null
          rating: number | null
          receipt_url: string | null
          starting_price: string | null
          tiktok_url: string | null
          towns: string | null
          updated_at: string
          user_email: string | null
          website: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          business_options?: string[] | null
          category?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          facebook_page?: string | null
          id?: string
          image_url?: string | null
          information_website?: string | null
          last_payment_date?: string | null
          license_expired_date?: string | null
          listing_expired_date?: string | null
          name: string
          odoo_expired_date?: string | null
          owner_id: string
          payment_status?: string
          phone?: string | null
          "POS+Website"?: number | null
          product_images?: string[] | null
          products_catalog?: string | null
          province_district?: string | null
          rating?: number | null
          receipt_url?: string | null
          starting_price?: string | null
          tiktok_url?: string | null
          towns?: string | null
          updated_at?: string
          user_email?: string | null
          website?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          business_options?: string[] | null
          category?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          facebook_page?: string | null
          id?: string
          image_url?: string | null
          information_website?: string | null
          last_payment_date?: string | null
          license_expired_date?: string | null
          listing_expired_date?: string | null
          name?: string
          odoo_expired_date?: string | null
          owner_id?: string
          payment_status?: string
          phone?: string | null
          "POS+Website"?: number | null
          product_images?: string[] | null
          products_catalog?: string | null
          province_district?: string | null
          rating?: number | null
          receipt_url?: string | null
          starting_price?: string | null
          tiktok_url?: string | null
          towns?: string | null
          updated_at?: string
          user_email?: string | null
          website?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      locations: {
        Row: {
          created_at: string
          id: string
          province_district: string
          towns: string[]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          province_district: string
          towns?: string[]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          province_district?: string
          towns?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      login_attempts: {
        Row: {
          created_at: string
          email: string
          id: string
          ip_address: string | null
          success: boolean
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          ip_address?: string | null
          success: boolean
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          ip_address?: string | null
          success?: boolean
          user_agent?: string | null
        }
        Relationships: []
      }
      plans: {
        Row: {
          created_at: string
          currency_symbol: string | null
          duration: string
          features: string
          id: string
          name: string
          pricing: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency_symbol?: string | null
          duration: string
          features: string
          id?: string
          name: string
          pricing: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency_symbol?: string | null
          duration?: string
          features?: string
          id?: string
          name?: string
          pricing?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_confirm_business_payment: {
        Args: { business_id: string; pos_website_option: number }
        Returns: Json
      }
      check_admin_rate_limit: {
        Args: { user_email: string }
        Returns: boolean
      }
      check_rate_limit: {
        Args: { user_email: string }
        Returns: boolean
      }
      get_pending_businesses_with_emails: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          id: string
          last_payment_date: string
          listing_expired_date: string
          name: string
          odoo_expired_date: string
          owner_id: string
          payment_status: string
          "POS+Website": number
          receipt_url: string
          user_email: string
        }[]
      }
      get_public_business_by_id: {
        Args: { business_id: string }
        Returns: {
          category: string
          city: string
          description: string
          id: string
          image_url: string
          name: string
          rating: number
          state: string
          website: string
        }[]
      }
      get_public_businesses: {
        Args: {
          category_filter?: string
          location_filter?: string
          search_term?: string
        }
        Returns: {
          business_options: string[]
          category: string
          city: string
          description: string
          id: string
          image_url: string
          license_expired_date: string
          name: string
          product_images: string[]
          rating: number
          starting_price: string
          state: string
          website: string
        }[]
      }
      log_admin_login_attempt: {
        Args: { attempt_success: boolean; user_email: string }
        Returns: undefined
      }
      log_login_attempt: {
        Args: { attempt_success: boolean; user_email: string }
        Returns: undefined
      }
      provision_admin_user: {
        Args: { user_email: string }
        Returns: undefined
      }
      search_businesses: {
        Args: {
          category_id?: string
          delivery_options?: string[]
          location_province?: string
          location_token?: string
          location_town?: string
          page?: number
          page_size?: number
          product_terms?: string[]
          search_terms?: string[]
        }
        Returns: {
          address: string | null
          business_options: string[] | null
          category: string | null
          created_at: string
          description: string | null
          email: string | null
          facebook_page: string | null
          id: string
          image_url: string | null
          information_website: string | null
          last_payment_date: string | null
          license_expired_date: string | null
          listing_expired_date: string | null
          name: string
          odoo_expired_date: string | null
          owner_id: string
          payment_status: string
          phone: string | null
          "POS+Website": number | null
          product_images: string[] | null
          products_catalog: string | null
          province_district: string | null
          rating: number | null
          receipt_url: string | null
          starting_price: string | null
          tiktok_url: string | null
          towns: string | null
          updated_at: string
          user_email: string | null
          website: string | null
          zip_code: string | null
        }[]
      }
      verify_totp_token: {
        Args: { secret_key: string; token_input: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
