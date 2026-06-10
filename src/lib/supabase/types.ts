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
      acoes: {
        Row: {
          descricao: string | null
          id_acao: number
          obs: string | null
        }
        Insert: {
          descricao?: string | null
          id_acao?: number
          obs?: string | null
        }
        Update: {
          descricao?: string | null
          id_acao?: number
          obs?: string | null
        }
        Relationships: []
      }
      acoes_fonte: {
        Row: {
          id_acao: number | null
          id_ef: number
          id_fonte: number | null
        }
        Insert: {
          id_acao?: number | null
          id_ef?: number
          id_fonte?: number | null
        }
        Update: {
          id_acao?: number | null
          id_ef?: number
          id_fonte?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "acoes_fonte_id_acao_fkey"
            columns: ["id_acao"]
            isOneToOne: false
            referencedRelation: "acoes"
            referencedColumns: ["id_acao"]
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
      capex_acao: {
        Row: {
          capex: number | null
          id_acao: number | null
          id_ca: number
          tempo: string | null
        }
        Insert: {
          capex?: number | null
          id_acao?: number | null
          id_ca?: number
          tempo?: string | null
        }
        Update: {
          capex?: number | null
          id_acao?: number | null
          id_ca?: number
          tempo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "capex_acao_id_acao_fkey"
            columns: ["id_acao"]
            isOneToOne: false
            referencedRelation: "acoes"
            referencedColumns: ["id_acao"]
          },
        ]
      }
      capex_perdas: {
        Row: {
          capex: number | null
          id_cp: number
          tempo: string | null
        }
        Insert: {
          capex?: number | null
          id_cp?: number
          tempo?: string | null
        }
        Update: {
          capex?: number | null
          id_cp?: number
          tempo?: string | null
        }
        Relationships: []
      }
      cenario_consumo: {
        Row: {
          descricao: string | null
          id_cc: number
          nome_cenario_consumo: string | null
          vol_hab: number | null
        }
        Insert: {
          descricao?: string | null
          id_cc?: number
          nome_cenario_consumo?: string | null
          vol_hab?: number | null
        }
        Update: {
          descricao?: string | null
          id_cc?: number
          nome_cenario_consumo?: string | null
          vol_hab?: number | null
        }
        Relationships: []
      }
      cenario_demanda: {
        Row: {
          descricao: string | null
          id_cd: number
          nome_cenario_demanda: string | null
          percentual: number | null
        }
        Insert: {
          descricao?: string | null
          id_cd?: number
          nome_cenario_demanda?: string | null
          percentual?: number | null
        }
        Update: {
          descricao?: string | null
          id_cd?: number
          nome_cenario_demanda?: string | null
          percentual?: number | null
        }
        Relationships: []
      }
      cenario_perdas: {
        Row: {
          id_cp: number
          nome_cenario_perdas: string | null
          percentual: number | null
        }
        Insert: {
          id_cp?: number
          nome_cenario_perdas?: string | null
          percentual?: number | null
        }
        Update: {
          id_cp?: number
          nome_cenario_perdas?: string | null
          percentual?: number | null
        }
        Relationships: []
      }
      cenario_simulacao: {
        Row: {
          id_acao: number | null
          id_c: number | null
          id_cs: number
          id_fonte: number | null
          id_s: number | null
          id_tc: number | null
        }
        Insert: {
          id_acao?: number | null
          id_c?: number | null
          id_cs?: number
          id_fonte?: number | null
          id_s?: number | null
          id_tc?: number | null
        }
        Update: {
          id_acao?: number | null
          id_c?: number | null
          id_cs?: number
          id_fonte?: number | null
          id_s?: number | null
          id_tc?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cenario_simulacao_id_acao_fkey"
            columns: ["id_acao"]
            isOneToOne: false
            referencedRelation: "acoes"
            referencedColumns: ["id_acao"]
          },
          {
            foreignKeyName: "cenario_simulacao_id_c_fkey"
            columns: ["id_c"]
            isOneToOne: false
            referencedRelation: "cenarios"
            referencedColumns: ["id_cenarios"]
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
      conteudo_estudo: {
        Row: {
          conteudo_html: string | null
          id: number
          ordem: number | null
          secao: string
        }
        Insert: {
          conteudo_html?: string | null
          id?: number
          ordem?: number | null
          secao: string
        }
        Update: {
          conteudo_html?: string | null
          id?: number
          ordem?: number | null
          secao?: string
        }
        Relationships: []
      }
      dados_simulacao: {
        Row: {
          capex_estrategia: number | null
          capex_perdas: number | null
          demanda: number | null
          id_acao: number | null
          id_ds: number
          id_fonte: number | null
          id_mod: number | null
          id_s: number | null
          opex: number | null
          perdas: number | null
          rebaixamento: number | null
          tempo: string | null
          valores_extras: Json | null
          volume_captado: number | null
        }
        Insert: {
          capex_estrategia?: number | null
          capex_perdas?: number | null
          demanda?: number | null
          id_acao?: number | null
          id_ds?: number
          id_fonte?: number | null
          id_mod?: number | null
          id_s?: number | null
          opex?: number | null
          perdas?: number | null
          rebaixamento?: number | null
          tempo?: string | null
          valores_extras?: Json | null
          volume_captado?: number | null
        }
        Update: {
          capex_estrategia?: number | null
          capex_perdas?: number | null
          demanda?: number | null
          id_acao?: number | null
          id_ds?: number
          id_fonte?: number | null
          id_mod?: number | null
          id_s?: number | null
          opex?: number | null
          perdas?: number | null
          rebaixamento?: number | null
          tempo?: string | null
          valores_extras?: Json | null
          volume_captado?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "dados_simulacao_id_acao_fkey"
            columns: ["id_acao"]
            isOneToOne: false
            referencedRelation: "acoes"
            referencedColumns: ["id_acao"]
          },
          {
            foreignKeyName: "dados_simulacao_id_fonte_fkey"
            columns: ["id_fonte"]
            isOneToOne: false
            referencedRelation: "fonte_agua"
            referencedColumns: ["id_fonte"]
          },
          {
            foreignKeyName: "dados_simulacao_id_mod_fkey"
            columns: ["id_mod"]
            isOneToOne: false
            referencedRelation: "modelos"
            referencedColumns: ["id_mod"]
          },
          {
            foreignKeyName: "dados_simulacao_id_s_fkey"
            columns: ["id_s"]
            isOneToOne: false
            referencedRelation: "simulacao_ssd"
            referencedColumns: ["id_s"]
          },
        ]
      }
      documentos_publicos: {
        Row: {
          criado_em: string | null
          descricao: string | null
          id: number
          nome: string
          url_arquivo: string | null
        }
        Insert: {
          criado_em?: string | null
          descricao?: string | null
          id?: number
          nome: string
          url_arquivo?: string | null
        }
        Update: {
          criado_em?: string | null
          descricao?: string | null
          id?: number
          nome?: string
          url_arquivo?: string | null
        }
        Relationships: []
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
      grupo_acesso: {
        Row: {
          id_ga: number
          nome_grupo: string
        }
        Insert: {
          id_ga?: number
          nome_grupo: string
        }
        Update: {
          id_ga?: number
          nome_grupo?: string
        }
        Relationships: []
      }
      indicadores: {
        Row: {
          campo_extra: string | null
          descricao: string | null
          id_fonte: number | null
          id_indicador: number
          unidade: string | null
        }
        Insert: {
          campo_extra?: string | null
          descricao?: string | null
          id_fonte?: number | null
          id_indicador?: number
          unidade?: string | null
        }
        Update: {
          campo_extra?: string | null
          descricao?: string | null
          id_fonte?: number | null
          id_indicador?: number
          unidade?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "indicadores_id_fonte_fkey"
            columns: ["id_fonte"]
            isOneToOne: false
            referencedRelation: "fonte_agua"
            referencedColumns: ["id_fonte"]
          },
        ]
      }
      indicadores_aplicado: {
        Row: {
          arquivo: string | null
          id_ia: number
          id_indicador: number | null
          id_s: number | null
        }
        Insert: {
          arquivo?: string | null
          id_ia?: number
          id_indicador?: number | null
          id_s?: number | null
        }
        Update: {
          arquivo?: string | null
          id_ia?: number
          id_indicador?: number | null
          id_s?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "indicadores_aplicado_id_indicador_fkey"
            columns: ["id_indicador"]
            isOneToOne: false
            referencedRelation: "indicadores"
            referencedColumns: ["id_indicador"]
          },
          {
            foreignKeyName: "indicadores_aplicado_id_s_fkey"
            columns: ["id_s"]
            isOneToOne: false
            referencedRelation: "simulacao_ssd"
            referencedColumns: ["id_s"]
          },
        ]
      }
      modelos: {
        Row: {
          arq_capex_estrategias: string | null
          arq_capex_perdas: string | null
          arq_demanda: string | null
          arq_mod: string | null
          arq_opex: string | null
          arq_perdas: string | null
          cenario: string | null
          estrategia: string | null
          id_fonte: number | null
          id_mod: number
        }
        Insert: {
          arq_capex_estrategias?: string | null
          arq_capex_perdas?: string | null
          arq_demanda?: string | null
          arq_mod?: string | null
          arq_opex?: string | null
          arq_perdas?: string | null
          cenario?: string | null
          estrategia?: string | null
          id_fonte?: number | null
          id_mod?: number
        }
        Update: {
          arq_capex_estrategias?: string | null
          arq_capex_perdas?: string | null
          arq_demanda?: string | null
          arq_mod?: string | null
          arq_opex?: string | null
          arq_perdas?: string | null
          cenario?: string | null
          estrategia?: string | null
          id_fonte?: number | null
          id_mod?: number
        }
        Relationships: [
          {
            foreignKeyName: "modelos_id_fonte_fkey"
            columns: ["id_fonte"]
            isOneToOne: false
            referencedRelation: "fonte_agua"
            referencedColumns: ["id_fonte"]
          },
        ]
      }
      opex: {
        Row: {
          id_oa: number
          opex: number | null
          tempo: string | null
        }
        Insert: {
          id_oa?: number
          opex?: number | null
          tempo?: string | null
        }
        Update: {
          id_oa?: number
          opex?: number | null
          tempo?: string | null
        }
        Relationships: []
      }
      perfis_usuarios: {
        Row: {
          created_at: string | null
          email: string
          id: string
          id_ga: number | null
          nivel_acesso: string | null
          nome: string
          objetivo_acesso: string | null
          organizacao: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          id_ga?: number | null
          nivel_acesso?: string | null
          nome: string
          objetivo_acesso?: string | null
          organizacao?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          id_ga?: number | null
          nivel_acesso?: string | null
          nome?: string
          objetivo_acesso?: string | null
          organizacao?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "perfis_usuarios_id_ga_fkey"
            columns: ["id_ga"]
            isOneToOne: false
            referencedRelation: "grupo_acesso"
            referencedColumns: ["id_ga"]
          },
        ]
      }
      recursos_app: {
        Row: {
          id_ga: number | null
          id_rapp: number
          nome_recurso: string
        }
        Insert: {
          id_ga?: number | null
          id_rapp?: number
          nome_recurso: string
        }
        Update: {
          id_ga?: number | null
          id_rapp?: number
          nome_recurso?: string
        }
        Relationships: [
          {
            foreignKeyName: "recursos_app_id_ga_fkey"
            columns: ["id_ga"]
            isOneToOne: false
            referencedRelation: "grupo_acesso"
            referencedColumns: ["id_ga"]
          },
        ]
      }
      simulacao_ssd: {
        Row: {
          demanda_auto: boolean | null
          descricao: string | null
          id_s: number
          inicio_perdas: string | null
          limiar_alerta: number | null
          limiar_colapso: number | null
          limiar_crise: number | null
          media_reducao_perdas: number | null
          perc_inicial_perdas: number | null
          perdas_auto: boolean | null
          pop_inicial: number | null
          total_capex: number | null
        }
        Insert: {
          demanda_auto?: boolean | null
          descricao?: string | null
          id_s?: number
          inicio_perdas?: string | null
          limiar_alerta?: number | null
          limiar_colapso?: number | null
          limiar_crise?: number | null
          media_reducao_perdas?: number | null
          perc_inicial_perdas?: number | null
          perdas_auto?: boolean | null
          pop_inicial?: number | null
          total_capex?: number | null
        }
        Update: {
          demanda_auto?: boolean | null
          descricao?: string | null
          id_s?: number
          inicio_perdas?: string | null
          limiar_alerta?: number | null
          limiar_colapso?: number | null
          limiar_crise?: number | null
          media_reducao_perdas?: number | null
          perc_inicial_perdas?: number | null
          perdas_auto?: boolean | null
          pop_inicial?: number | null
          total_capex?: number | null
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
      is_admin: { Args: never; Returns: boolean }
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
// Table: acoes
//   id_acao: integer (not null)
//   descricao: character varying (nullable)
//   obs: character varying (nullable)
// Table: acoes_fonte
//   id_ef: integer (not null)
//   id_fonte: integer (nullable)
//   id_acao: integer (nullable)
// Table: capex_acao
//   id_ca: integer (not null, default: nextval('capex_acao_id_ca_seq'::regclass))
//   id_acao: integer (nullable)
//   tempo: character varying (nullable)
//   capex: double precision (nullable)
// Table: capex_perdas
//   id_cp: integer (not null, default: nextval('capex_perdas_id_cp_seq'::regclass))
//   tempo: character varying (nullable)
//   capex: double precision (nullable)
// Table: cenario_consumo
//   id_cc: integer (not null)
//   nome_cenario_consumo: character varying (nullable)
//   descricao: character varying (nullable)
//   vol_hab: double precision (nullable)
// Table: cenario_demanda
//   id_cd: integer (not null)
//   nome_cenario_demanda: character varying (nullable)
//   descricao: character varying (nullable)
//   percentual: double precision (nullable)
// Table: cenario_perdas
//   id_cp: integer (not null)
//   nome_cenario_perdas: character varying (nullable)
//   percentual: double precision (nullable)
// Table: cenario_simulacao
//   id_cs: integer (not null)
//   id_s: integer (nullable)
//   id_fonte: integer (nullable)
//   id_tc: integer (nullable)
//   id_c: integer (nullable)
//   id_acao: integer (nullable)
// Table: cenarios
//   id_cenarios: integer (not null)
//   cenarios: character varying (nullable)
//   obs_cenario: character varying (nullable)
// Table: cenarios_fonte
//   id_cf: integer (not null)
//   id_fonte: integer (nullable)
//   id_tc: integer (nullable)
// Table: conteudo_estudo
//   id: integer (not null, default: nextval('conteudo_estudo_id_seq'::regclass))
//   secao: text (not null)
//   conteudo_html: text (nullable)
//   ordem: integer (nullable, default: 0)
// Table: dados_simulacao
//   id_ds: integer (not null)
//   id_s: integer (nullable)
//   tempo: character varying (nullable)
//   id_fonte: integer (nullable)
//   id_acao: integer (nullable)
//   volume_captado: double precision (nullable)
//   capex_estrategia: double precision (nullable)
//   opex: double precision (nullable)
//   rebaixamento: double precision (nullable)
//   demanda: double precision (nullable)
//   perdas: double precision (nullable)
//   id_mod: integer (nullable)
//   capex_perdas: double precision (nullable)
//   valores_extras: jsonb (nullable, default: '{}'::jsonb)
// Table: documentos_publicos
//   id: integer (not null, default: nextval('documentos_publicos_id_seq'::regclass))
//   nome: text (not null)
//   descricao: text (nullable)
//   url_arquivo: text (nullable)
//   criado_em: timestamp with time zone (nullable, default: now())
// Table: fonte_agua
//   id_fonte: integer (not null)
//   nome_fonte: character varying (nullable)
//   sujeito_perdas: boolean (nullable, default: true)
// Table: grupo_acesso
//   id_ga: integer (not null, default: nextval('grupo_acesso_id_ga_seq'::regclass))
//   nome_grupo: character varying (not null)
// Table: indicadores
//   id_indicador: integer (not null, default: nextval('indicadores_id_indicador_seq'::regclass))
//   id_fonte: integer (nullable)
//   descricao: character varying (nullable)
//   unidade: character varying (nullable)
//   campo_extra: character varying (nullable)
// Table: indicadores_aplicado
//   id_ia: integer (not null, default: nextval('indicadores_aplicado_id_ia_seq'::regclass))
//   id_s: integer (nullable)
//   id_indicador: integer (nullable)
//   arquivo: character varying (nullable)
// Table: modelos
//   id_mod: integer (not null, default: nextval('modelos_id_mod_seq'::regclass))
//   id_fonte: integer (nullable)
//   cenario: character varying (nullable)
//   estrategia: character varying (nullable)
//   arq_mod: text (nullable)
//   arq_perdas: text (nullable)
//   arq_demanda: text (nullable)
//   arq_capex_estrategias: text (nullable)
//   arq_capex_perdas: text (nullable)
//   arq_opex: text (nullable)
// Table: opex
//   id_oa: integer (not null, default: nextval('opex_id_oa_seq'::regclass))
//   tempo: character varying (nullable)
//   opex: double precision (nullable)
// Table: perfis_usuarios
//   id: uuid (not null)
//   nome: text (not null)
//   email: text (not null)
//   organizacao: text (nullable)
//   nivel_acesso: text (nullable)
//   objetivo_acesso: text (nullable)
//   id_ga: integer (nullable)
//   status: text (nullable, default: 'pendente'::text)
//   created_at: timestamp with time zone (nullable, default: now())
// Table: recursos_app
//   id_rapp: integer (not null, default: nextval('recursos_app_id_rapp_seq'::regclass))
//   nome_recurso: character varying (not null)
//   id_ga: integer (nullable)
// Table: simulacao_ssd
//   id_s: integer (not null)
//   descricao: character varying (nullable)
//   demanda_auto: boolean (nullable, default: false)
//   perdas_auto: boolean (nullable, default: false)
//   pop_inicial: double precision (nullable)
//   inicio_perdas: character varying (nullable)
//   perc_inicial_perdas: double precision (nullable)
//   total_capex: double precision (nullable)
//   media_reducao_perdas: double precision (nullable)
//   limiar_alerta: double precision (nullable)
//   limiar_crise: double precision (nullable)
//   limiar_colapso: double precision (nullable)
// Table: tipo_cenario_cenario
//   id_tcc: integer (not null)
//   id_tc: integer (nullable)
//   id_c: integer (nullable)
// Table: tipos_cenarios
//   id_tc: integer (not null)
//   descricao: character varying (nullable)
//   obs_tipo_cenario: character varying (nullable)

// --- CONSTRAINTS ---
// Table: acoes
//   PRIMARY KEY estrategias_pkey: PRIMARY KEY (id_acao)
// Table: acoes_fonte
//   FOREIGN KEY acoes_fonte_id_acao_fkey: FOREIGN KEY (id_acao) REFERENCES acoes(id_acao) ON DELETE CASCADE
//   FOREIGN KEY estrategias_fonte_id_fonte_fkey: FOREIGN KEY (id_fonte) REFERENCES fonte_agua(id_fonte) ON DELETE CASCADE
//   PRIMARY KEY estrategias_fonte_pkey: PRIMARY KEY (id_ef)
// Table: capex_acao
//   FOREIGN KEY capex_acao_id_acao_fkey: FOREIGN KEY (id_acao) REFERENCES acoes(id_acao) ON DELETE CASCADE
//   PRIMARY KEY capex_acao_pkey: PRIMARY KEY (id_ca)
// Table: capex_perdas
//   PRIMARY KEY capex_perdas_pkey: PRIMARY KEY (id_cp)
// Table: cenario_consumo
//   PRIMARY KEY cenario_consumo_pkey: PRIMARY KEY (id_cc)
// Table: cenario_demanda
//   PRIMARY KEY cenario_demanda_pkey: PRIMARY KEY (id_cd)
// Table: cenario_perdas
//   PRIMARY KEY cenario_perdas_pkey: PRIMARY KEY (id_cp)
// Table: cenario_simulacao
//   FOREIGN KEY cenario_simulacao_id_acao_fkey: FOREIGN KEY (id_acao) REFERENCES acoes(id_acao) ON DELETE CASCADE
//   FOREIGN KEY cenario_simulacao_id_c_fkey: FOREIGN KEY (id_c) REFERENCES cenarios(id_cenarios) ON DELETE CASCADE
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
// Table: conteudo_estudo
//   PRIMARY KEY conteudo_estudo_pkey: PRIMARY KEY (id)
// Table: dados_simulacao
//   FOREIGN KEY dados_simulacao_id_acao_fkey: FOREIGN KEY (id_acao) REFERENCES acoes(id_acao) ON DELETE CASCADE
//   FOREIGN KEY dados_simulacao_id_fonte_fkey: FOREIGN KEY (id_fonte) REFERENCES fonte_agua(id_fonte) ON DELETE CASCADE
//   FOREIGN KEY dados_simulacao_id_mod_fkey: FOREIGN KEY (id_mod) REFERENCES modelos(id_mod) ON DELETE CASCADE
//   FOREIGN KEY dados_simulacao_id_s_fkey: FOREIGN KEY (id_s) REFERENCES simulacao_ssd(id_s) ON DELETE CASCADE
//   PRIMARY KEY dados_simulacao_pkey: PRIMARY KEY (id_ds)
//   UNIQUE dados_simulacao_ukey: UNIQUE (id_s, id_mod, id_fonte, tempo)
// Table: documentos_publicos
//   PRIMARY KEY documentos_publicos_pkey: PRIMARY KEY (id)
// Table: fonte_agua
//   PRIMARY KEY fonte_agua_pkey: PRIMARY KEY (id_fonte)
// Table: grupo_acesso
//   PRIMARY KEY grupo_acesso_pkey: PRIMARY KEY (id_ga)
// Table: indicadores
//   FOREIGN KEY indicadores_id_fonte_fkey: FOREIGN KEY (id_fonte) REFERENCES fonte_agua(id_fonte) ON DELETE CASCADE
//   PRIMARY KEY indicadores_pkey: PRIMARY KEY (id_indicador)
// Table: indicadores_aplicado
//   FOREIGN KEY indicadores_aplicado_id_indicador_fkey: FOREIGN KEY (id_indicador) REFERENCES indicadores(id_indicador) ON DELETE CASCADE
//   FOREIGN KEY indicadores_aplicado_id_s_fkey: FOREIGN KEY (id_s) REFERENCES simulacao_ssd(id_s) ON DELETE CASCADE
//   PRIMARY KEY indicadores_aplicado_pkey: PRIMARY KEY (id_ia)
// Table: modelos
//   FOREIGN KEY modelos_id_fonte_fkey: FOREIGN KEY (id_fonte) REFERENCES fonte_agua(id_fonte) ON DELETE CASCADE
//   PRIMARY KEY modelos_pkey: PRIMARY KEY (id_mod)
// Table: opex
//   PRIMARY KEY opex_pkey: PRIMARY KEY (id_oa)
// Table: perfis_usuarios
//   FOREIGN KEY perfis_usuarios_id_fkey: FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
//   FOREIGN KEY perfis_usuarios_id_ga_fkey: FOREIGN KEY (id_ga) REFERENCES grupo_acesso(id_ga)
//   PRIMARY KEY perfis_usuarios_pkey: PRIMARY KEY (id)
// Table: recursos_app
//   FOREIGN KEY recursos_app_id_ga_fkey: FOREIGN KEY (id_ga) REFERENCES grupo_acesso(id_ga) ON DELETE CASCADE
//   PRIMARY KEY recursos_app_pkey: PRIMARY KEY (id_rapp)
// Table: simulacao_ssd
//   PRIMARY KEY simulacao_ssd_pkey: PRIMARY KEY (id_s)
// Table: tipo_cenario_cenario
//   FOREIGN KEY tipo_cenario_cenario_id_c_fkey: FOREIGN KEY (id_c) REFERENCES cenarios(id_cenarios) ON DELETE CASCADE
//   FOREIGN KEY tipo_cenario_cenario_id_tc_fkey: FOREIGN KEY (id_tc) REFERENCES tipos_cenarios(id_tc) ON DELETE CASCADE
//   PRIMARY KEY tipo_cenario_cenario_pkey: PRIMARY KEY (id_tcc)
// Table: tipos_cenarios
//   PRIMARY KEY tipos_cenarios_pkey: PRIMARY KEY (id_tc)

// --- ROW LEVEL SECURITY POLICIES ---
// Table: acoes
//   Policy "anon_read" (SELECT, PERMISSIVE) roles={anon}
//     USING: true
//   Policy "authenticated_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: acoes_fonte
//   Policy "anon_read" (SELECT, PERMISSIVE) roles={anon}
//     USING: true
//   Policy "authenticated_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: capex_acao
//   Policy "All capex_acao anon" (ALL, PERMISSIVE) roles={anon}
//     USING: true
//     WITH CHECK: true
//   Policy "All capex_acao auth" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
//   Policy "anon_read" (SELECT, PERMISSIVE) roles={anon}
//     USING: true
//   Policy "authenticated_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: capex_perdas
//   Policy "All capex_perdas anon" (ALL, PERMISSIVE) roles={anon}
//     USING: true
//     WITH CHECK: true
//   Policy "All capex_perdas auth" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
//   Policy "Insert capex_acao anon" (INSERT, PERMISSIVE) roles={anon}
//     WITH CHECK: true
//   Policy "anon_read" (SELECT, PERMISSIVE) roles={anon}
//     USING: true
//   Policy "authenticated_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
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
// Table: conteudo_estudo
//   Policy "ce_admin" (ALL, PERMISSIVE) roles={public}
//     USING: is_admin()
//   Policy "ce_select" (SELECT, PERMISSIVE) roles={public}
//     USING: true
// Table: dados_simulacao
//   Policy "anon_read" (SELECT, PERMISSIVE) roles={anon}
//     USING: true
//   Policy "authenticated_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: documentos_publicos
//   Policy "dp_admin" (ALL, PERMISSIVE) roles={public}
//     USING: is_admin()
//   Policy "dp_select" (SELECT, PERMISSIVE) roles={public}
//     USING: true
// Table: fonte_agua
//   Policy "anon_read" (SELECT, PERMISSIVE) roles={anon}
//     USING: true
//   Policy "authenticated_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: grupo_acesso
//   Policy "ga_admin" (ALL, PERMISSIVE) roles={public}
//     USING: is_admin()
//   Policy "ga_select" (SELECT, PERMISSIVE) roles={public}
//     USING: true
// Table: indicadores
//   Policy "indicadores_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: indicadores_aplicado
//   Policy "indicadores_aplicado_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: modelos
//   Policy "modelos_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: opex
//   Policy "All opex anon" (ALL, PERMISSIVE) roles={anon}
//     USING: true
//     WITH CHECK: true
//   Policy "All opex auth" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
//   Policy "Insert capex_acao anon" (INSERT, PERMISSIVE) roles={anon}
//     WITH CHECK: true
//   Policy "anon_read" (SELECT, PERMISSIVE) roles={anon}
//     USING: true
//   Policy "authenticated_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: perfis_usuarios
//   Policy "pu_admin" (ALL, PERMISSIVE) roles={public}
//     USING: is_admin()
//   Policy "pu_select" (SELECT, PERMISSIVE) roles={public}
//     USING: ((auth.uid() = id) OR is_admin())
// Table: recursos_app
//   Policy "rapp_admin" (ALL, PERMISSIVE) roles={public}
//     USING: is_admin()
//   Policy "rapp_select" (SELECT, PERMISSIVE) roles={public}
//     USING: true
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

// --- DATABASE FUNCTIONS ---
// FUNCTION handle_new_user()
//   CREATE OR REPLACE FUNCTION public.handle_new_user()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     INSERT INTO public.perfis_usuarios (id, nome, email, organizacao, nivel_acesso, objetivo_acesso, status)
//     VALUES (
//       NEW.id,
//       COALESCE(NEW.raw_user_meta_data->>'nome', ''),
//       NEW.email,
//       NEW.raw_user_meta_data->>'organizacao',
//       NEW.raw_user_meta_data->>'nivel_acesso',
//       NEW.raw_user_meta_data->>'objetivo_acesso',
//       'pendente'
//     )
//     ON CONFLICT (id) DO NOTHING;
//     RETURN NEW;
//   END;
//   $function$
//   
// FUNCTION is_admin()
//   CREATE OR REPLACE FUNCTION public.is_admin()
//    RETURNS boolean
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//    SET search_path TO 'public'
//   AS $function$
//   DECLARE
//     v_id_ga integer;
//   BEGIN
//     SELECT id_ga INTO v_id_ga FROM public.perfis_usuarios WHERE id = auth.uid();
//     RETURN (v_id_ga = 4);
//   END;
//   $function$
//   

// --- INDEXES ---
// Table: dados_simulacao
//   CREATE UNIQUE INDEX dados_simulacao_ukey ON public.dados_simulacao USING btree (id_s, id_mod, id_fonte, tempo)

