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
      job_titles_translation: {
        Row: {
          title_key: string
          label_en: string
          label_my: string
        }
        Insert: {
          title_key: string
          label_en: string
          label_my: string
        }
        Update: {
          title_key?: string
          label_en?: string
          label_my?: string
        }
        Relationships: []
      }
      locations_translation: {
        Row: {
          location_key: string
          label_en: string
          label_my: string
        }
        Insert: {
          location_key: string
          label_en: string
          label_my: string
        }
        Update: {
          location_key?: string
          label_en?: string
          label_my?: string
        }
        Relationships: []
      }
      education_translation: {
        Row: {
          education_key: string
          label_en: string
          label_my: string
        }
        Insert: {
          education_key: string
          label_en: string
          label_my: string
        }
        Update: {
          education_key?: string
          label_en?: string
          label_my?: string
        }
        Relationships: []
      }
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
      bookings: {
        Row: {
          confirmed_by_id: string | null
          created_at: string
          id: string
          payment_amount: number
          receipt_url: string
          resource_id: string
          slot_id: string
          status: "Pending" | "Confirmed" | "Rejected"
          user_id: string
        }
        Insert: {
          confirmed_by_id?: string | null
          created_at?: string
          id?: string
          payment_amount: number
          receipt_url: string
          resource_id: string
          slot_id: string
          status?: "Pending" | "Confirmed" | "Rejected"
          user_id: string
        }
        Update: {
          confirmed_by_id?: string | null
          created_at?: string
          id?: string
          payment_amount?: number
          receipt_url?: string
          resource_id?: string
          slot_id?: string
          status?: "Pending" | "Confirmed" | "Rejected"
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "business_resources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: true
            referencedRelation: "slots"
            referencedColumns: ["id"]
          },
        ]
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
      business_resources: {
        Row: {
          base_price: number | null
          business_id: string
          created_at: string
          field_type: string | null
          id: string
          max_capacity: number
          name: string
          service_id: number
          updated_at: string
        }
        Insert: {
          base_price?: number | null
          business_id: string
          created_at?: string
          field_type?: string | null
          id?: string
          max_capacity?: number
          name: string
          service_id: number
          updated_at?: string
        }
        Update: {
          base_price?: number | null
          business_id?: string
          created_at?: string
          field_type?: string | null
          id?: string
          max_capacity?: number
          name?: string
          service_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_resources_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_resources_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
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
      business_schedules: {
        Row: {
          applies_to_date: string | null
          close_time: string
          created_at: string
          day_of_week: number
          id: string
          is_open: boolean
          open_time: string
          resource_id: string
          updated_at: string
        }
        Insert: {
          applies_to_date?: string | null
          close_time: string
          created_at?: string
          day_of_week: number
          id?: string
          is_open?: boolean
          open_time: string
          resource_id: string
          updated_at?: string
        }
        Update: {
          applies_to_date?: string | null
          close_time?: string
          created_at?: string
          day_of_week?: number
          id?: string
          is_open?: boolean
          open_time?: string
          resource_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_schedules_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "business_resources"
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
          featured_business: number
          google_map_location: string | null
          id: string
          image_url: string | null
          information_website: string | null
          last_payment_date: string | null
          license_expired_date: string | null
          listing_expired_date: string | null
          lite_pos: number | null
          lite_pos_expired: string | null
          name: string
          nearest_bus_stop: string | null
          nearest_train_station: string | null
          odoo_expired_date: string | null
          owner_id: string
          payment_status: string
          phone: string | null
          pos_lite_price: string | null
          "POS+Website": number | null
          price_currency: string | null
          product_images: string[] | null
          products_catalog: string | null
          province_district: string | null
          rating: number | null
          receipt_url: string | null
          searchable_business: boolean
          service_listing_price: string | null
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
          featured_business?: number
          google_map_location?: string | null
          id?: string
          image_url?: string | null
          information_website?: string | null
          last_payment_date?: string | null
          license_expired_date?: string | null
          listing_expired_date?: string | null
          lite_pos?: number | null
          lite_pos_expired?: string | null
          name: string
          nearest_bus_stop?: string | null
          nearest_train_station?: string | null
          odoo_expired_date?: string | null
          owner_id: string
          payment_status?: string
          phone?: string | null
          pos_lite_price?: string | null
          "POS+Website"?: number | null
          price_currency?: string | null
          product_images?: string[] | null
          products_catalog?: string | null
          province_district?: string | null
          rating?: number | null
          receipt_url?: string | null
          searchable_business?: boolean
          service_listing_price?: string | null
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
          featured_business?: number
          google_map_location?: string | null
          id?: string
          image_url?: string | null
          information_website?: string | null
          last_payment_date?: string | null
          license_expired_date?: string | null
          listing_expired_date?: string | null
          lite_pos?: number | null
          lite_pos_expired?: string | null
          name?: string
          nearest_bus_stop?: string | null
          nearest_train_station?: string | null
          odoo_expired_date?: string | null
          owner_id?: string
          payment_status?: string
          phone?: string | null
          pos_lite_price?: string | null
          "POS+Website"?: number | null
          price_currency?: string | null
          product_images?: string[] | null
          products_catalog?: string | null
          province_district?: string | null
          rating?: number | null
          receipt_url?: string | null
          searchable_business?: boolean
          service_listing_price?: string | null
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
      job_postings: {
        Row: {
          id: string
          created_at: string
          job_title_key: string | null
          job_location_key: string | null
          education_key: string | null
          job_title_custom: string | null
          education_custom: string | null
          salary_structure: string
          salary_type: string
          salary_min: number | null
          salary_max: number | null
          description_my: string | null
          description_en: string | null
          business_name: string | null
          job_type: string | null
          age_min: number | null
          age_max: number | null
          benefits: string[] | null
          application_deadline: string | null
          whatsapp_number: string | null
          phone_number: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          job_title_key?: string | null
          job_location_key?: string | null
          education_key?: string | null
          job_title_custom?: string | null
          education_custom?: string | null
          salary_structure: string
          salary_type: string
          salary_min?: number | null
          salary_max?: number | null
          description_my?: string | null
          description_en?: string | null
          business_name?: string | null
          job_type?: string | null
          age_min?: number | null
          age_max?: number | null
          benefits?: string[] | null
          application_deadline?: string | null
          whatsapp_number?: string | null
          phone_number?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          job_title_key?: string | null
          job_location_key?: string | null
          education_key?: string | null
          job_title_custom?: string | null
          education_custom?: string | null
          salary_structure?: string
          salary_type?: string
          salary_min?: number | null
          salary_max?: number | null
          description_my?: string | null
          description_en?: string | null
          business_name?: string | null
          job_type?: string | null
          age_min?: number | null
          age_max?: number | null
          benefits?: string[] | null
          application_deadline?: string | null
          whatsapp_number?: string | null
          phone_number?: string | null
        }
        Relationships: []
      }
      job_reports: {
        Row: {
          created_at: string
          id: string
          job_post_id: string
          reason: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          job_post_id: string
          reason: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          job_post_id?: string
          reason?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_reports_job_post_id_fkey"
            columns: ["job_post_id"]
            isOneToOne: false
            referencedRelation: "job_postings"
            referencedColumns: ["id"]
          },
        ]
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
      payment_methods: {
        Row: {
          account_name: string | null
          account_number: string | null
          business_id: string
          created_at: string
          id: string
          method_type: string
          updated_at: string
        }
        Insert: {
          account_name?: string | null
          account_number?: string | null
          business_id: string
          created_at?: string
          id?: string
          method_type: string
          updated_at?: string
        }
        Update: {
          account_name?: string | null
          account_number?: string | null
          business_id?: string
          created_at?: string
          id?: string
          method_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_methods_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
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
      services: {
        Row: {
          category_id: string
          contact_available_start: string | null
          contact_available_until: string | null
          contact_phone: string | null
          created_at: string
          default_duration_min: number | null
          facilities: string | null
          id: number
          popular_products: string
          rules: string | null
          service_images: string[] | null
          service_key: string
          service_listing_expired: string | null
          service_listing_receipt: string | null
          services_description: string | null
          updated_at: string
        }
        Insert: {
          category_id: string
          contact_available_start?: string | null
          contact_available_until?: string | null
          contact_phone?: string | null
          created_at?: string
          default_duration_min?: number | null
          facilities?: string | null
          id?: number
          popular_products: string
          rules?: string | null
          service_images?: string[] | null
          service_key: string
          service_listing_expired?: string | null
          service_listing_receipt?: string | null
          services_description?: string | null
          updated_at?: string
        }
        Update: {
          category_id?: string
          contact_available_start?: string | null
          contact_available_until?: string | null
          contact_phone?: string | null
          created_at?: string
          default_duration_min?: number | null
          facilities?: string | null
          id?: number
          popular_products?: string
          rules?: string | null
          service_images?: string[] | null
          service_key?: string
          service_listing_expired?: string | null
          service_listing_receipt?: string | null
          services_description?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "business_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      slots: {
        Row: {
          booking_id: string | null
          created_at: string
          end_time: string
          id: string
          is_booked: boolean
          resource_id: string
          slot_name: string | null
          slot_price: number
          start_time: string
          updated_at: string
        }
        Insert: {
          booking_id?: string | null
          created_at?: string
          end_time: string
          id?: string
          is_booked?: boolean
          resource_id: string
          slot_name?: string | null
          slot_price: number
          start_time: string
          updated_at?: string
        }
        Update: {
          booking_id?: string | null
          created_at?: string
          end_time?: string
          id?: string
          is_booked?: boolean
          resource_id?: string
          slot_name?: string | null
          slot_price?: number
          start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "slots_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "business_resources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "slots_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
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
      check_admin_rate_limit: { Args: { user_email: string }; Returns: boolean }
      check_rate_limit: { Args: { user_email: string }; Returns: boolean }
      get_pending_businesses_with_emails: {
        Args: never
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
      provision_admin_user: { Args: { user_email: string }; Returns: undefined }
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
          featured_business: number
          google_map_location: string | null
          id: string
          image_url: string | null
          information_website: string | null
          last_payment_date: string | null
          license_expired_date: string | null
          listing_expired_date: string | null
          lite_pos: number | null
          lite_pos_expired: string | null
          name: string
          nearest_bus_stop: string | null
          nearest_train_station: string | null
          odoo_expired_date: string | null
          owner_id: string
          payment_status: string
          phone: string | null
          pos_lite_price: string | null
          "POS+Website": number | null
          price_currency: string | null
          product_images: string[] | null
          products_catalog: string | null
          province_district: string | null
          rating: number | null
          receipt_url: string | null
          searchable_business: boolean
          service_listing_price: string | null
          starting_price: string | null
          tiktok_url: string | null
          towns: string | null
          updated_at: string
          user_email: string | null
          website: string | null
          zip_code: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "businesses"
          isOneToOne: false
          isSetofReturn: true
        }
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
