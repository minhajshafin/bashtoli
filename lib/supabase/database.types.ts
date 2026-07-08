export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      addresses: {
        Row: {
          id: string
          user_id: string
          label: string | null
          full_address: string
          phone: string | null
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string | null
          user_id: string
          label?: string | null
          full_address: string
          phone?: string | null
          is_default?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string | null
          user_id?: string | null
          label?: string | null
          full_address?: string | null
          phone?: string | null
          is_default?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          id: string
          cart_id: string
          variant_id: string
          qty: number
        }
        Insert: {
          id?: string | null
          cart_id: string
          variant_id: string
          qty?: number | null
        }
        Update: {
          id?: string | null
          cart_id?: string | null
          variant_id?: string | null
          qty?: number | null
        }
        Relationships: []
      }
      carts: {
        Row: {
          id: string
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string | null
          user_id: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string | null
          user_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string | null
          name: string
          slug: string
          sort_order?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string | null
          name?: string | null
          slug?: string | null
          sort_order?: number | null
          created_at?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          variant_id: string
          qty: number
          price_at_purchase: number
          product_name: string
        }
        Insert: {
          id?: string | null
          order_id: string
          product_id: string
          variant_id: string
          qty: number
          price_at_purchase: number
          product_name: string
        }
        Update: {
          id?: string | null
          order_id?: string | null
          product_id?: string | null
          variant_id?: string | null
          qty?: number | null
          price_at_purchase?: number | null
          product_name?: string | null
        }
        Relationships: []
      }
      order_status_history: {
        Row: {
          id: string
          order_id: string
          status: 'pending' | 'confirmed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled'
          changed_by: string | null
          changed_at: string
        }
        Insert: {
          id?: string | null
          order_id: string
          status: 'pending' | 'confirmed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled'
          changed_by?: string | null
          changed_at?: string | null
        }
        Update: {
          id?: string | null
          order_id?: string | null
          status?: 'pending' | 'confirmed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | null
          changed_by?: string | null
          changed_at?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          id: string
          order_number: string
          user_id: string | null
          customer_name: string
          phone: string
          guest_email: string | null
          address: string
          notes: string | null
          fulfillment_type: 'delivery' | 'pickup'
          delivery_zone: 'inside_dhaka' | 'outside_dhaka' | null
          subtotal: number
          delivery_fee: number
          total: number
          status: 'pending' | 'confirmed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string | null
          order_number: string
          user_id?: string | null
          customer_name: string
          phone: string
          guest_email?: string | null
          address: string
          notes?: string | null
          fulfillment_type: 'delivery' | 'pickup'
          delivery_zone?: 'inside_dhaka' | 'outside_dhaka' | null
          subtotal?: number | null
          delivery_fee?: number | null
          total?: number | null
          status?: 'pending' | 'confirmed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string | null
          order_number?: string | null
          user_id?: string | null
          customer_name?: string | null
          phone?: string | null
          guest_email?: string | null
          address?: string | null
          notes?: string | null
          fulfillment_type?: 'delivery' | 'pickup' | null
          delivery_zone?: 'inside_dhaka' | 'outside_dhaka' | null
          subtotal?: number | null
          delivery_fee?: number | null
          total?: number | null
          status?: 'pending' | 'confirmed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      product_images: {
        Row: {
          id: string
          product_id: string
          url: string
          alt_text: string | null
          sort_order: number
        }
        Insert: {
          id?: string | null
          product_id: string
          url: string
          alt_text?: string | null
          sort_order?: number | null
        }
        Update: {
          id?: string | null
          product_id?: string | null
          url?: string | null
          alt_text?: string | null
          sort_order?: number | null
        }
        Relationships: []
      }
      product_option_values: {
        Row: {
          id: string
          option_id: string
          value: string
          sort_order: number
        }
        Insert: {
          id?: string | null
          option_id: string
          value: string
          sort_order?: number | null
        }
        Update: {
          id?: string | null
          option_id?: string | null
          value?: string | null
          sort_order?: number | null
        }
        Relationships: []
      }
      product_options: {
        Row: {
          id: string
          product_id: string
          name: string
          sort_order: number
        }
        Insert: {
          id?: string | null
          product_id: string
          name: string
          sort_order?: number | null
        }
        Update: {
          id?: string | null
          product_id?: string | null
          name?: string | null
          sort_order?: number | null
        }
        Relationships: []
      }
      product_variants: {
        Row: {
          id: string
          product_id: string
          sku: string | null
          option_values: Json
          stock_qty: number
          price: number
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string | null
          product_id: string
          sku?: string | null
          option_values: Json
          stock_qty?: number | null
          price?: number | null
          active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string | null
          product_id?: string | null
          sku?: string | null
          option_values?: Json | null
          stock_qty?: number | null
          price?: number | null
          active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          category_id: string | null
          base_price: number
          active: boolean
          featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string | null
          name: string
          slug: string
          description?: string | null
          category_id?: string | null
          base_price?: number | null
          active?: boolean | null
          featured?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string | null
          name?: string | null
          slug?: string | null
          description?: string | null
          category_id?: string | null
          base_price?: number | null
          active?: boolean | null
          featured?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          role: 'customer' | 'staff' | 'admin'
          full_name: string | null
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string | null
          role?: 'customer' | 'staff' | 'admin' | null
          full_name?: string | null
          phone?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string | null
          role?: 'customer' | 'staff' | 'admin' | null
          full_name?: string | null
          phone?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      wishlist: {
        Row: {
          id: string
          user_id: string
          product_id: string
          created_at: string
        }
        Insert: {
          id?: string | null
          user_id: string
          product_id: string
          created_at?: string | null
        }
        Update: {
          id?: string | null
          user_id?: string | null
          product_id?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      delivery_zone: 'inside_dhaka' | 'outside_dhaka'
      fulfillment_type: 'delivery' | 'pickup'
      order_status: 'pending' | 'confirmed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled'
      user_role: 'customer' | 'staff' | 'admin'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
