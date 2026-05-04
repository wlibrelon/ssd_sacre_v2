// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      cenario_consumo: {
        Row: {
          descricao: string | null
          id_cc: number
          nome_cenario_consumo: string | null
        }
        Insert: {
          descricao?: string | null
          id_cc?: number
          nome_cenario_consumo?: string | null
        }
        Update: {
          descricao?: string | null
          id_cc?: number
          nome_cenario_consumo?: string | null
        }
        Relationships: []
      }
      cenario_demanda: {
        Row: {
          descricao: string | null
          id_cd: number
          nome_cenario_demanda: string | null
        }
        Insert: {
          descricao?: string | null
          id_cd?: number
          nome_cenario_demanda?: string | null
        }
        Update: {
          descricao?: string | null
          id_cd?: number
          nome_cenario_demanda?: string | null
        }
        Relationships: []
      }
      cenario_perdas: {
        Row: {
          descricao: string | null
          id_cp: number
          nome_cenario_perdas: string | null
        }
        Insert: {
          descricao?: string | null
          id_cp?: number
          nome_cenario_perdas?: string | null
        }
        Update: {
          descricao?: string | null
          id_cp?: number
          nome_cenario_perdas?: string | null
        }
        Relationships: []
      }
      cenario_simulacao: {
        Row: {
          id_c: number | null
          id_cs: number
          id_e: number | null
          id_fonte: number | null
          id_s: number | null
          id_tc: number | null
        }
        Insert: {
          id_c?: number | null
          id_cs?: number
          id_e?: number | null
          id_fonte?: number | null
          id_s?: number | null
          id_tc?: number | null
        }
        Update: {
          id_c?: number | null
          id_cs?: number
          id_e?: number | null
          id_fonte?: number | null
          id_s?: number | null
          id_tc?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cenario_simulacao_id_c_fkey"
            columns: ["id_c"]
            isOneToOne: false
            referencedRelation: "cenarios"
            referencedColumns: ["id_cenarios"]
          },
          {
            foreignKeyName: "cenario_simulacao_id_e_fkey"
            columns: ["id_e"]
            isOneToOne: false
            referencedRelation: "estrategias"
            referencedColumns: ["id_estrategia"]
          },
          {
            foreignKeyName: "cenario_simulacao_id_fonte_fkey"
            columns: ["id_fonte"]
            isOneToOne: false
            referencedRelation: "fonte_agua"
            referencedColumns: ["id_fonte"]
          },
          {
            foreignKeyName: "cenario_simulacao_id_s_fkey"
            columns: ["id_s"]
            isOneToOne: false
            referencedRelation: "simulacao_ssd"
            referencedColumns: ["id_s"]
          },
          {
            foreignKeyName: "cenario_simulacao_id_tc_fkey"
            columns: ["id_tc"]
            isOneToOne: false
            referencedRelation: "tipos_cenarios"
            referencedColumns: ["id_tc"]
          },
        ]
      }
      cenarios: {
        Row: {
          cenarios: string | null
          id_cenarios: number
          obs_cenario: string | null
        }
        Insert: {
          cenarios?: string | null
          id_cenarios?: number
          obs_cenario?: string | null
        }
        Update: {
          cenarios?: string | null
          id_cenarios?: number
          obs_cenario?: string | null
        }
        Relationships: []
      }
      cenarios_fonte: {
        Row: {
          id_cf: number
          id_fonte: number | null
          id_tc: number | null
        }
        Insert: {
          id_cf?: number
          id_fonte?: number | null
          id_tc?: number | null
        }
        Update: {
          id_cf?: number
          id_fonte?: number | null
          id_tc?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cenarios_fonte_id_fonte_fkey"
            columns: ["id_fonte"]
            isOneToOne: false
            referencedRelation: "fonte_agua"
            referencedColumns: ["id_fonte"]
          },
          {
            foreignKeyName: "cenarios_fonte_id_tc_fkey"
            columns: ["id_tc"]
            isOneToOne: false
            referencedRelation: "tipos_cenarios"
            referencedColumns: ["id_tc"]
          },
        ]
      }
      dados_simulacao: {
        Row: {
          capex: number | null
          demanda: number | null
          id_c: number | null
          id_cc: number | null
          id_cd: number | null
          id_cp: number | null
          id_ds: number
          id_e: number | null
          id_fonte: number | null
          id_s: number | null
          id_tc: number | null
          opex: number | null
          perdas: number | null
          rebaixamento: number | null
          tempo: string | null
          volume_captado: number | null
        }
        Insert: {
          capex?: number | null
          demanda?: number | null
          id_c?: number | null
          id_cc?: number | null
          id_cd?: number | null
          id_cp?: number | null
          id_ds?: number
          id_e?: number | null
          id_fonte?: number | null
          id_s?: number | null
          id_tc?: number | null
          opex?: number | null
          perdas?: number | null
          rebaixamento?: number | null
          tempo?: string | null
          volume_captado?: number | null
        }
        Update: {
          capex?: number | null
          demanda?: number | null
          id_c?: number | null
          id_cc?: number | null
          id_cd?: number | null
          id_cp?: number | null
          id_ds?: number
          id_e?: number | null
          id_fonte?: number | null
          id_s?: number | null
          id_tc?: number | null
          opex?: number | null
          perdas?: number | null
          rebaixamento?: number | null
          tempo?: string | null
          volume_captado?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "dados_simulacao_id_c_fkey"
            columns: ["id_c"]
            isOneToOne: false
            referencedRelation: "cenarios"
            referencedColumns: ["id_cenarios"]
          },
          {
            foreignKeyName: "dados_simulacao_id_cc_fkey"
            columns: ["id_cc"]
            isOneToOne: false
            referencedRelation: "cenario_consumo"
            referencedColumns: ["id_cc"]
          },
          {
            foreignKeyName: "dados_simulacao_id_cd_fkey"
            columns: ["id_cd"]
            isOneToOne: false
            referencedRelation: "cenario_demanda"
            referencedColumns: ["id_cd"]
          },
          {
            foreignKeyName: "dados_simulacao_id_cp_fkey"
            columns: ["id_cp"]
            isOneToOne: false
            referencedRelation: "cenario_perdas"
            referencedColumns: ["id_cp"]
          },
          {
            foreignKeyName: "dados_simulacao_id_e_fkey"
            columns: ["id_e"]
            isOneToOne: false
            referencedRelation: "estrategias"
            referencedColumns: ["id_estrategia"]
          },
          {
            foreignKeyName: "dados_simulacao_id_fonte_fkey"
            columns: ["id_fonte"]
            isOneToOne: false
            referencedRelation: "fonte_agua"
            referencedColumns: ["id_fonte"]
          },
          {
            foreignKeyName: "dados_simulacao_id_s_fkey"
            columns: ["id_s"]
            isOneToOne: false
            referencedRelation: "simulacao_ssd"
            referencedColumns: ["id_s"]
          },
          {
            foreignKeyName: "dados_simulacao_id_tc_fkey"
            columns: ["id_tc"]
            isOneToOne: false
            referencedRelation: "tipos_cenarios"
            referencedColumns: ["id_tc"]
          },
        ]
      }
      estrategias: {
        Row: {
          descricao: string | null
          id_estrategia: number
          obs_estrategia: string | null
        }
        Insert: {
          descricao?: string | null
          id_estrategia?: number
          obs_estrategia?: string | null
        }
        Update: {
          descricao?: string | null
          id_estrategia?: number
          obs_estrategia?: string | null
        }
        Relationships: []
      }
      estrategias_fonte: {
        Row: {
          id_e: number | null
          id_ef: number
          id_fonte: number | null
        }
        Insert: {
          id_e?: number | null
          id_ef?: number
          id_fonte?: number | null
        }
        Update: {
          id_e?: number | null
          id_ef?: number
          id_fonte?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "estrategias_fonte_id_e_fkey"
            columns: ["id_e"]
            isOneToOne: false
            referencedRelation: "estrategias"
            referencedColumns: ["id_estrategia"]
          },
          {
            foreignKeyName: "estrategias_fonte_id_fonte_fkey"
            columns: ["id_fonte"]
            isOneToOne: false
            referencedRelation: "fonte_agua"
            referencedColumns: ["id_fonte"]
          },
        ]
      }
      fonte_agua: {
        Row: {
          id_fonte: number
          nome_fonte: string | null
          sujeito_perdas: boolean | null
        }
        Insert: {
          id_fonte?: number
          nome_fonte?: string | null
          sujeito_perdas?: boolean | null
        }
        Update: {
          id_fonte?: number
          nome_fonte?: string | null
          sujeito_perdas?: boolean | null
        }
        Relationships: []
      }
      simulacao_ssd: {
        Row: {
          descricao: string | null
          id_s: number
        }
        Insert: {
          descricao?: string | null
          id_s?: number
        }
        Update: {
          descricao?: string | null
          id_s?: number
        }
        Relationships: []
      }
      tipo_cenario_cenario: {
        Row: {
          id_c: number | null
          id_tc: number | null
          id_tcc: number
        }
        Insert: {
          id_c?: number | null
          id_tc?: number | null
          id_tcc?: number
        }
        Update: {
          id_c?: number | null
          id_tc?: number | null
          id_tcc?: number
        }
        Relationships: [
          {
            foreignKeyName: "tipo_cenario_cenario_id_c_fkey"
            columns: ["id_c"]
            isOneToOne: false
            referencedRelation: "cenarios"
            referencedColumns: ["id_cenarios"]
          },
          {
            foreignKeyName: "tipo_cenario_cenario_id_tc_fkey"
            columns: ["id_tc"]
            isOneToOne: false
            referencedRelation: "tipos_cenarios"
            referencedColumns: ["id_tc"]
          },
        ]
      }
      tipos_cenarios: {
        Row: {
          descricao: string | null
          id_tc: number
          obs_tipo_cenario: string | null
        }
        Insert: {
          descricao?: string | null
          id_tc?: number
          obs_tipo_cenario?: string | null
        }
        Update: {
          descricao?: string | null
          id_tc?: number
          obs_tipo_cenario?: string | null
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


// ====== DATABASE EXTENDED CONTEXT (auto-generated) ======
// This section contains actual PostgreSQL column types, constraints, RLS policies,
// functions, triggers, indexes and materialized views not present in the type definitions above.
// IMPORTANT: The TypeScript types above map UUID, TEXT, VARCHAR all to "string".
// Use the COLUMN TYPES section below to know the real PostgreSQL type for each column.
// Always use the correct PostgreSQL type when writing SQL migrations.

// --- COLUMN TYPES (actual PostgreSQL types) ---
// Use this to know the real database type when writing migrations.
// "string" in TypeScript types above may be uuid, text, varchar, timestamptz, etc.
// Table: cenario_consumo
//   id_cc: integer (not null)
//   nome_cenario_consumo: character varying (nullable)
//   descricao: character varying (nullable)
// Table: cenario_demanda
//   id_cd: integer (not null)
//   nome_cenario_demanda: character varying (nullable)
//   descricao: character varying (nullable)
// Table: cenario_perdas
//   id_cp: integer (not null)
//   nome_cenario_perdas: character varying (nullable)
//   descricao: character varying (nullable)
// Table: cenario_simulacao
//   id_cs: integer (not null)
//   id_s: integer (nullable)
//   id_fonte: integer (nullable)
//   id_tc: integer (nullable)
//   id_c: integer (nullable)
//   id_e: integer (nullable)
// Table: cenarios
//   id_cenarios: integer (not null)
//   cenarios: character varying (nullable)
//   obs_cenario: character varying (nullable)
// Table: cenarios_fonte
//   id_cf: integer (not null)
//   id_fonte: integer (nullable)
//   id_tc: integer (nullable)
// Table: dados_simulacao
//   id_ds: integer (not null)
//   id_s: integer (nullable)
//   tempo: character varying (nullable)
//   id_fonte: integer (nullable)
//   id_tc: integer (nullable)
//   id_c: integer (nullable)
//   id_e: integer (nullable)
//   id_cd: integer (nullable)
//   id_cc: integer (nullable)
//   id_cp: integer (nullable)
//   volume_captado: double precision (nullable)
//   capex: double precision (nullable)
//   opex: double precision (nullable)
//   rebaixamento: double precision (nullable)
//   demanda: double precision (nullable)
//   perdas: double precision (nullable)
// Table: estrategias
//   id_estrategia: integer (not null)
//   descricao: character varying (nullable)
//   obs_estrategia: character varying (nullable)
// Table: estrategias_fonte
//   id_ef: integer (not null)
//   id_fonte: integer (nullable)
//   id_e: integer (nullable)
// Table: fonte_agua
//   id_fonte: integer (not null)
//   nome_fonte: character varying (nullable)
//   sujeito_perdas: boolean (nullable, default: true)
// Table: simulacao_ssd
//   id_s: integer (not null)
//   descricao: character varying (nullable)
// Table: tipo_cenario_cenario
//   id_tcc: integer (not null)
//   id_tc: integer (nullable)
//   id_c: integer (nullable)
// Table: tipos_cenarios
//   id_tc: integer (not null)
//   descricao: character varying (nullable)
//   obs_tipo_cenario: character varying (nullable)

// --- CONSTRAINTS ---
// Table: cenario_consumo
//   PRIMARY KEY cenario_consumo_pkey: PRIMARY KEY (id_cc)
// Table: cenario_demanda
//   PRIMARY KEY cenario_demanda_pkey: PRIMARY KEY (id_cd)
// Table: cenario_perdas
//   PRIMARY KEY cenario_perdas_pkey: PRIMARY KEY (id_cp)
// Table: cenario_simulacao
//   FOREIGN KEY cenario_simulacao_id_c_fkey: FOREIGN KEY (id_c) REFERENCES cenarios(id_cenarios) ON DELETE CASCADE
//   FOREIGN KEY cenario_simulacao_id_e_fkey: FOREIGN KEY (id_e) REFERENCES estrategias(id_estrategia) ON DELETE CASCADE
//   FOREIGN KEY cenario_simulacao_id_fonte_fkey: FOREIGN KEY (id_fonte) REFERENCES fonte_agua(id_fonte) ON DELETE CASCADE
//   FOREIGN KEY cenario_simulacao_id_s_fkey: FOREIGN KEY (id_s) REFERENCES simulacao_ssd(id_s) ON DELETE CASCADE
//   FOREIGN KEY cenario_simulacao_id_tc_fkey: FOREIGN KEY (id_tc) REFERENCES tipos_cenarios(id_tc) ON DELETE CASCADE
//   PRIMARY KEY cenario_simulacao_pkey: PRIMARY KEY (id_cs)
// Table: cenarios
//   PRIMARY KEY cenarios_pkey: PRIMARY KEY (id_cenarios)
// Table: cenarios_fonte
//   FOREIGN KEY cenarios_fonte_id_fonte_fkey: FOREIGN KEY (id_fonte) REFERENCES fonte_agua(id_fonte) ON DELETE CASCADE
//   FOREIGN KEY cenarios_fonte_id_tc_fkey: FOREIGN KEY (id_tc) REFERENCES tipos_cenarios(id_tc) ON DELETE CASCADE
//   PRIMARY KEY cenarios_fonte_pkey: PRIMARY KEY (id_cf)
// Table: dados_simulacao
//   FOREIGN KEY dados_simulacao_id_c_fkey: FOREIGN KEY (id_c) REFERENCES cenarios(id_cenarios) ON DELETE CASCADE
//   FOREIGN KEY dados_simulacao_id_cc_fkey: FOREIGN KEY (id_cc) REFERENCES cenario_consumo(id_cc) ON DELETE CASCADE
//   FOREIGN KEY dados_simulacao_id_cd_fkey: FOREIGN KEY (id_cd) REFERENCES cenario_demanda(id_cd) ON DELETE CASCADE
//   FOREIGN KEY dados_simulacao_id_cp_fkey: FOREIGN KEY (id_cp) REFERENCES cenario_perdas(id_cp) ON DELETE CASCADE
//   FOREIGN KEY dados_simulacao_id_e_fkey: FOREIGN KEY (id_e) REFERENCES estrategias(id_estrategia) ON DELETE CASCADE
//   FOREIGN KEY dados_simulacao_id_fonte_fkey: FOREIGN KEY (id_fonte) REFERENCES fonte_agua(id_fonte) ON DELETE CASCADE
//   FOREIGN KEY dados_simulacao_id_s_fkey: FOREIGN KEY (id_s) REFERENCES simulacao_ssd(id_s) ON DELETE CASCADE
//   FOREIGN KEY dados_simulacao_id_tc_fkey: FOREIGN KEY (id_tc) REFERENCES tipos_cenarios(id_tc) ON DELETE CASCADE
//   PRIMARY KEY dados_simulacao_pkey: PRIMARY KEY (id_ds)
// Table: estrategias
//   PRIMARY KEY estrategias_pkey: PRIMARY KEY (id_estrategia)
// Table: estrategias_fonte
//   FOREIGN KEY estrategias_fonte_id_e_fkey: FOREIGN KEY (id_e) REFERENCES estrategias(id_estrategia) ON DELETE CASCADE
//   FOREIGN KEY estrategias_fonte_id_fonte_fkey: FOREIGN KEY (id_fonte) REFERENCES fonte_agua(id_fonte) ON DELETE CASCADE
//   PRIMARY KEY estrategias_fonte_pkey: PRIMARY KEY (id_ef)
// Table: fonte_agua
//   PRIMARY KEY fonte_agua_pkey: PRIMARY KEY (id_fonte)
// Table: simulacao_ssd
//   PRIMARY KEY simulacao_ssd_pkey: PRIMARY KEY (id_s)
// Table: tipo_cenario_cenario
//   FOREIGN KEY tipo_cenario_cenario_id_c_fkey: FOREIGN KEY (id_c) REFERENCES cenarios(id_cenarios) ON DELETE CASCADE
//   FOREIGN KEY tipo_cenario_cenario_id_tc_fkey: FOREIGN KEY (id_tc) REFERENCES tipos_cenarios(id_tc) ON DELETE CASCADE
//   PRIMARY KEY tipo_cenario_cenario_pkey: PRIMARY KEY (id_tcc)
// Table: tipos_cenarios
//   PRIMARY KEY tipos_cenarios_pkey: PRIMARY KEY (id_tc)

// --- ROW LEVEL SECURITY POLICIES ---
// Table: cenario_consumo
//   Policy "anon_read" (SELECT, PERMISSIVE) roles={anon}
//     USING: true
//   Policy "authenticated_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: cenario_demanda
//   Policy "anon_read" (SELECT, PERMISSIVE) roles={anon}
//     USING: true
//   Policy "authenticated_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: cenario_perdas
//   Policy "anon_read" (SELECT, PERMISSIVE) roles={anon}
//     USING: true
//   Policy "authenticated_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: cenario_simulacao
//   Policy "anon_read" (SELECT, PERMISSIVE) roles={anon}
//     USING: true
//   Policy "authenticated_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: cenarios
//   Policy "anon_read" (SELECT, PERMISSIVE) roles={anon}
//     USING: true
//   Policy "authenticated_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: cenarios_fonte
//   Policy "anon_read" (SELECT, PERMISSIVE) roles={anon}
//     USING: true
//   Policy "authenticated_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: dados_simulacao
//   Policy "anon_read" (SELECT, PERMISSIVE) roles={anon}
//     USING: true
//   Policy "authenticated_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: estrategias
//   Policy "anon_read" (SELECT, PERMISSIVE) roles={anon}
//     USING: true
//   Policy "authenticated_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: estrategias_fonte
//   Policy "anon_read" (SELECT, PERMISSIVE) roles={anon}
//     USING: true
//   Policy "authenticated_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: fonte_agua
//   Policy "anon_read" (SELECT, PERMISSIVE) roles={anon}
//     USING: true
//   Policy "authenticated_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: simulacao_ssd
//   Policy "anon_read" (SELECT, PERMISSIVE) roles={anon}
//     USING: true
//   Policy "authenticated_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: tipo_cenario_cenario
//   Policy "anon_read" (SELECT, PERMISSIVE) roles={anon}
//     USING: true
//   Policy "authenticated_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: tipos_cenarios
//   Policy "anon_read" (SELECT, PERMISSIVE) roles={anon}
//     USING: true
//   Policy "authenticated_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true

