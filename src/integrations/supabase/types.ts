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
      lpj: {
        Row: {
          accepted_at: string | null
          dokumen_path: string | null
          id: string
          periode_id: string | null
          pesan_revisi: string | null
          pondok_id: string | null
          realisasi_pemasukan: number | null
          realisasi_pengeluaran: number | null
          rencana_pemasukan: number | null
          rencana_pengeluaran: number | null
          saldo_awal: number | null
          sisa_saldo: number | null
          status: string
          submitted_at: string | null
        }
        Insert: {
          accepted_at?: string | null
          dokumen_path?: string | null
          id?: string
          periode_id?: string | null
          pesan_revisi?: string | null
          pondok_id?: string | null
          realisasi_pemasukan?: number | null
          realisasi_pengeluaran?: number | null
          rencana_pemasukan?: number | null
          rencana_pengeluaran?: number | null
          saldo_awal?: number | null
          sisa_saldo?: number | null
          status: string
          submitted_at?: string | null
        }
        Update: {
          accepted_at?: string | null
          dokumen_path?: string | null
          id?: string
          periode_id?: string | null
          pesan_revisi?: string | null
          pondok_id?: string | null
          realisasi_pemasukan?: number | null
          realisasi_pengeluaran?: number | null
          rencana_pemasukan?: number | null
          rencana_pengeluaran?: number | null
          saldo_awal?: number | null
          sisa_saldo?: number | null
          status?: string
          submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lpj_periode_id_fkey"
            columns: ["periode_id"]
            isOneToOne: false
            referencedRelation: "periode"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lpj_pondok_id_fkey"
            columns: ["pondok_id"]
            isOneToOne: false
            referencedRelation: "pondok"
            referencedColumns: ["id"]
          },
        ]
      }
      pengurus: {
        Row: {
          id: string
          jabatan: string
          nama: string
          nomor_telepon: string | null
          pondok_id: string | null
        }
        Insert: {
          id?: string
          jabatan: string
          nama: string
          nomor_telepon?: string | null
          pondok_id?: string | null
        }
        Update: {
          id?: string
          jabatan?: string
          nama?: string
          nomor_telepon?: string | null
          pondok_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pengurus_pondok_id_fkey"
            columns: ["pondok_id"]
            isOneToOne: false
            referencedRelation: "pondok"
            referencedColumns: ["id"]
          },
        ]
      }
      periode: {
        Row: {
          akhir_lpj: string
          akhir_rab: string
          awal_lpj: string
          awal_rab: string
          bulan: number
          id: string
          tahun: number
        }
        Insert: {
          akhir_lpj: string
          akhir_rab: string
          awal_lpj: string
          awal_rab: string
          bulan: number
          id: string
          tahun: number
        }
        Update: {
          akhir_lpj?: string
          akhir_rab?: string
          awal_lpj?: string
          awal_rab?: string
          bulan?: number
          id?: string
          tahun?: number
        }
        Relationships: []
      }
      pondok: {
        Row: {
          accepted_at: string | null
          alamat: string | null
          daerah_sambung_id: string | null
          id: string
          jenis: string | null
          kode_pos: string | null
          kota_id: string | null
          nama: string
          nomor_telepon: string | null
          provinsi_id: string | null
          updated_at: string | null
        }
        Insert: {
          accepted_at?: string | null
          alamat?: string | null
          daerah_sambung_id?: string | null
          id: string
          jenis?: string | null
          kode_pos?: string | null
          kota_id?: string | null
          nama: string
          nomor_telepon?: string | null
          provinsi_id?: string | null
          updated_at?: string | null
        }
        Update: {
          accepted_at?: string | null
          alamat?: string | null
          daerah_sambung_id?: string | null
          id?: string
          jenis?: string | null
          kode_pos?: string | null
          kota_id?: string | null
          nama?: string
          nomor_telepon?: string | null
          provinsi_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      rab: {
        Row: {
          accepted_at: string | null
          dokumen_path: string | null
          id: string
          periode_id: string | null
          pesan_revisi: string | null
          pondok_id: string | null
          rencana_pemasukan: number | null
          rencana_pengeluaran: number | null
          saldo_awal: number | null
          status: string
          submitted_at: string | null
        }
        Insert: {
          accepted_at?: string | null
          dokumen_path?: string | null
          id?: string
          periode_id?: string | null
          pesan_revisi?: string | null
          pondok_id?: string | null
          rencana_pemasukan?: number | null
          rencana_pengeluaran?: number | null
          saldo_awal?: number | null
          status: string
          submitted_at?: string | null
        }
        Update: {
          accepted_at?: string | null
          dokumen_path?: string | null
          id?: string
          periode_id?: string | null
          pesan_revisi?: string | null
          pondok_id?: string | null
          rencana_pemasukan?: number | null
          rencana_pengeluaran?: number | null
          saldo_awal?: number | null
          status?: string
          submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rab_periode_id_fkey"
            columns: ["periode_id"]
            isOneToOne: false
            referencedRelation: "periode"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rab_pondok_id_fkey"
            columns: ["pondok_id"]
            isOneToOne: false
            referencedRelation: "pondok"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profile: {
        Row: {
          email: string
          id: string
          nama: string
          nomor_telepon: string | null
          pondok_id: string | null
          role: string
        }
        Insert: {
          email: string
          id: string
          nama: string
          nomor_telepon?: string | null
          pondok_id?: string | null
          role: string
        }
        Update: {
          email?: string
          id?: string
          nama?: string
          nomor_telepon?: string | null
          pondok_id?: string | null
          role?: string
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
