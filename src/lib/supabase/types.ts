// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.5'
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
            foreignKeyName: 'acoes_fonte_id_acao_fkey'
            columns: ['id_acao']
            isOneToOne: false
            referencedRelation: 'acoes'
            referencedColumns: ['id_acao']
          },
          {
            foreignKeyName: 'estrategias_fonte_id_fonte_fkey'
            columns: ['id_fonte']
            isOneToOne: false
            referencedRelation: 'fonte_agua'
            referencedColumns: ['id_fonte']
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
            foreignKeyName: 'capex_acao_id_acao_fkey'
            columns: ['id_acao']
            isOneToOne: false
            referencedRelation: 'acoes'
            referencedColumns: ['id_acao']
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
            foreignKeyName: 'cenario_simulacao_id_acao_fkey'
            columns: ['id_acao']
            isOneToOne: false
            referencedRelation: 'acoes'
            referencedColumns: ['id_acao']
          },
          {
            foreignKeyName: 'cenario_simulacao_id_c_fkey'
            columns: ['id_c']
            isOneToOne: false
            referencedRelation: 'cenarios'
            referencedColumns: ['id_cenarios']
          },
          {
            foreignKeyName: 'cenario_simulacao_id_fonte_fkey'
            columns: ['id_fonte']
            isOneToOne: false
            referencedRelation: 'fonte_agua'
            referencedColumns: ['id_fonte']
          },
          {
            foreignKeyName: 'cenario_simulacao_id_s_fkey'
            columns: ['id_s']
            isOneToOne: false
            referencedRelation: 'simulacao_ssd'
            referencedColumns: ['id_s']
          },
          {
            foreignKeyName: 'cenario_simulacao_id_tc_fkey'
            columns: ['id_tc']
            isOneToOne: false
            referencedRelation: 'tipos_cenarios'
            referencedColumns: ['id_tc']
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
            foreignKeyName: 'cenarios_fonte_id_fonte_fkey'
            columns: ['id_fonte']
            isOneToOne: false
            referencedRelation: 'fonte_agua'
            referencedColumns: ['id_fonte']
          },
          {
            foreignKeyName: 'cenarios_fonte_id_tc_fkey'
            columns: ['id_tc']
            isOneToOne: false
            referencedRelation: 'tipos_cenarios'
            referencedColumns: ['id_tc']
          },
        ]
      }
      dados_simulacao: {
        Row: {
          capex: number | null
          demanda: number | null
          id_acao: number | null
          id_c: number | null
          id_cc: number | null
          id_cd: number | null
          id_cp: number | null
          id_ds: number
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
          id_acao?: number | null
          id_c?: number | null
          id_cc?: number | null
          id_cd?: number | null
          id_cp?: number | null
          id_ds?: number
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
          id_acao?: number | null
          id_c?: number | null
          id_cc?: number | null
          id_cd?: number | null
          id_cp?: number | null
          id_ds?: number
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
            foreignKeyName: 'dados_simulacao_id_acao_fkey'
            columns: ['id_acao']
            isOneToOne: false
            referencedRelation: 'acoes'
            referencedColumns: ['id_acao']
          },
          {
            foreignKeyName: 'dados_simulacao_id_c_fkey'
            columns: ['id_c']
            isOneToOne: false
            referencedRelation: 'cenarios'
            referencedColumns: ['id_cenarios']
          },
          {
            foreignKeyName: 'dados_simulacao_id_cc_fkey'
            columns: ['id_cc']
            isOneToOne: false
            referencedRelation: 'cenario_consumo'
            referencedColumns: ['id_cc']
          },
          {
            foreignKeyName: 'dados_simulacao_id_cd_fkey'
            columns: ['id_cd']
            isOneToOne: false
            referencedRelation: 'cenario_demanda'
            referencedColumns: ['id_cd']
          },
          {
            foreignKeyName: 'dados_simulacao_id_cp_fkey'
            columns: ['id_cp']
            isOneToOne: false
            referencedRelation: 'cenario_perdas'
            referencedColumns: ['id_cp']
          },
          {
            foreignKeyName: 'dados_simulacao_id_fonte_fkey'
            columns: ['id_fonte']
            isOneToOne: false
            referencedRelation: 'fonte_agua'
            referencedColumns: ['id_fonte']
          },
          {
            foreignKeyName: 'dados_simulacao_id_s_fkey'
            columns: ['id_s']
            isOneToOne: false
            referencedRelation: 'simulacao_ssd'
            referencedColumns: ['id_s']
          },
          {
            foreignKeyName: 'dados_simulacao_id_tc_fkey'
            columns: ['id_tc']
            isOneToOne: false
            referencedRelation: 'tipos_cenarios'
            referencedColumns: ['id_tc']
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
      members: {
        Row: {
          birth_date: string | null
          birth_place: string | null
          created_at: string | null
          gender: string | null
          id: string
          is_deceased: boolean | null
          is_librelon: boolean | null
          message: string | null
          name: string
          parent_union_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          birth_date?: string | null
          birth_place?: string | null
          created_at?: string | null
          gender?: string | null
          id?: string
          is_deceased?: boolean | null
          is_librelon?: boolean | null
          message?: string | null
          name: string
          parent_union_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          birth_date?: string | null
          birth_place?: string | null
          created_at?: string | null
          gender?: string | null
          id?: string
          is_deceased?: boolean | null
          is_librelon?: boolean | null
          message?: string | null
          name?: string
          parent_union_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'members_parent_union_id_fkey'
            columns: ['parent_union_id']
            isOneToOne: false
            referencedRelation: 'unions'
            referencedColumns: ['id']
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
      simulacao_ssd: {
        Row: {
          demanda_auto: boolean | null
          descricao: string | null
          id_s: number
          inicio_perdas: string | null
          perc_inicial_perdas: number | null
          perdas_auto: boolean | null
          pop_inicial: number | null
        }
        Insert: {
          demanda_auto?: boolean | null
          descricao?: string | null
          id_s?: number
          inicio_perdas?: string | null
          perc_inicial_perdas?: number | null
          perdas_auto?: boolean | null
          pop_inicial?: number | null
        }
        Update: {
          demanda_auto?: boolean | null
          descricao?: string | null
          id_s?: number
          inicio_perdas?: string | null
          perc_inicial_perdas?: number | null
          perdas_auto?: boolean | null
          pop_inicial?: number | null
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
            foreignKeyName: 'tipo_cenario_cenario_id_c_fkey'
            columns: ['id_c']
            isOneToOne: false
            referencedRelation: 'cenarios'
            referencedColumns: ['id_cenarios']
          },
          {
            foreignKeyName: 'tipo_cenario_cenario_id_tc_fkey'
            columns: ['id_tc']
            isOneToOne: false
            referencedRelation: 'tipos_cenarios'
            referencedColumns: ['id_tc']
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
      unions: {
        Row: {
          created_at: string | null
          id: string
          partner1_id: string
          partner2_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          partner1_id: string
          partner2_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          partner1_id?: string
          partner2_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'unions_partner1_id_fkey'
            columns: ['partner1_id']
            isOneToOne: false
            referencedRelation: 'members'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'unions_partner2_id_fkey'
            columns: ['partner2_id']
            isOneToOne: false
            referencedRelation: 'members'
            referencedColumns: ['id']
          },
        ]
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

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
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
// Table: dados_simulacao
//   id_ds: integer (not null)
//   id_s: integer (nullable)
//   tempo: character varying (nullable)
//   id_fonte: integer (nullable)
//   id_tc: integer (nullable)
//   id_c: integer (nullable)
//   id_acao: integer (nullable)
//   id_cd: integer (nullable)
//   id_cc: integer (nullable)
//   id_cp: integer (nullable)
//   volume_captado: double precision (nullable)
//   capex: double precision (nullable)
//   opex: double precision (nullable)
//   rebaixamento: double precision (nullable)
//   demanda: double precision (nullable)
//   perdas: double precision (nullable)
// Table: fonte_agua
//   id_fonte: integer (not null)
//   nome_fonte: character varying (nullable)
//   sujeito_perdas: boolean (nullable, default: true)
// Table: members
//   id: uuid (not null, default: gen_random_uuid())
//   name: text (not null)
//   gender: character varying (nullable)
//   birth_date: date (nullable)
//   birth_place: text (nullable)
//   is_deceased: boolean (nullable, default: false)
//   is_librelon: boolean (nullable, default: true)
//   status: text (nullable, default: 'Pendente'::text)
//   message: text (nullable)
//   parent_union_id: uuid (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
//   updated_at: timestamp with time zone (nullable, default: now())
// Table: opex
//   id_oa: integer (not null, default: nextval('opex_id_oa_seq'::regclass))
//   tempo: character varying (nullable)
//   opex: double precision (nullable)
// Table: simulacao_ssd
//   id_s: integer (not null)
//   descricao: character varying (nullable)
//   demanda_auto: boolean (nullable, default: false)
//   perdas_auto: boolean (nullable, default: false)
//   pop_inicial: double precision (nullable)
//   inicio_perdas: character varying (nullable)
//   perc_inicial_perdas: double precision (nullable)
// Table: tipo_cenario_cenario
//   id_tcc: integer (not null)
//   id_tc: integer (nullable)
//   id_c: integer (nullable)
// Table: tipos_cenarios
//   id_tc: integer (not null)
//   descricao: character varying (nullable)
//   obs_tipo_cenario: character varying (nullable)
// Table: unions
//   id: uuid (not null, default: gen_random_uuid())
//   partner1_id: uuid (not null)
//   partner2_id: uuid (not null)
//   status: text (nullable, default: 'Active'::text)
//   created_at: timestamp with time zone (nullable, default: now())
//   updated_at: timestamp with time zone (nullable, default: now())

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
// Table: dados_simulacao
//   FOREIGN KEY dados_simulacao_id_acao_fkey: FOREIGN KEY (id_acao) REFERENCES acoes(id_acao) ON DELETE CASCADE
//   FOREIGN KEY dados_simulacao_id_c_fkey: FOREIGN KEY (id_c) REFERENCES cenarios(id_cenarios) ON DELETE CASCADE
//   FOREIGN KEY dados_simulacao_id_cc_fkey: FOREIGN KEY (id_cc) REFERENCES cenario_consumo(id_cc) ON DELETE CASCADE
//   FOREIGN KEY dados_simulacao_id_cd_fkey: FOREIGN KEY (id_cd) REFERENCES cenario_demanda(id_cd) ON DELETE CASCADE
//   FOREIGN KEY dados_simulacao_id_cp_fkey: FOREIGN KEY (id_cp) REFERENCES cenario_perdas(id_cp) ON DELETE CASCADE
//   FOREIGN KEY dados_simulacao_id_fonte_fkey: FOREIGN KEY (id_fonte) REFERENCES fonte_agua(id_fonte) ON DELETE CASCADE
//   FOREIGN KEY dados_simulacao_id_s_fkey: FOREIGN KEY (id_s) REFERENCES simulacao_ssd(id_s) ON DELETE CASCADE
//   FOREIGN KEY dados_simulacao_id_tc_fkey: FOREIGN KEY (id_tc) REFERENCES tipos_cenarios(id_tc) ON DELETE CASCADE
//   PRIMARY KEY dados_simulacao_pkey: PRIMARY KEY (id_ds)
// Table: fonte_agua
//   PRIMARY KEY fonte_agua_pkey: PRIMARY KEY (id_fonte)
// Table: members
//   CHECK members_gender_check: CHECK (((gender)::text = ANY ((ARRAY['M'::character varying, 'F'::character varying])::text[])))
//   FOREIGN KEY members_parent_union_id_fkey: FOREIGN KEY (parent_union_id) REFERENCES unions(id) ON DELETE SET NULL
//   PRIMARY KEY members_pkey: PRIMARY KEY (id)
//   CHECK members_status_check: CHECK ((status = ANY (ARRAY['Ativo'::text, 'Pendente'::text])))
// Table: opex
//   PRIMARY KEY opex_pkey: PRIMARY KEY (id_oa)
// Table: simulacao_ssd
//   PRIMARY KEY simulacao_ssd_pkey: PRIMARY KEY (id_s)
// Table: tipo_cenario_cenario
//   FOREIGN KEY tipo_cenario_cenario_id_c_fkey: FOREIGN KEY (id_c) REFERENCES cenarios(id_cenarios) ON DELETE CASCADE
//   FOREIGN KEY tipo_cenario_cenario_id_tc_fkey: FOREIGN KEY (id_tc) REFERENCES tipos_cenarios(id_tc) ON DELETE CASCADE
//   PRIMARY KEY tipo_cenario_cenario_pkey: PRIMARY KEY (id_tcc)
// Table: tipos_cenarios
//   PRIMARY KEY tipos_cenarios_pkey: PRIMARY KEY (id_tc)
// Table: unions
//   FOREIGN KEY unions_partner1_id_fkey: FOREIGN KEY (partner1_id) REFERENCES members(id) ON DELETE CASCADE
//   FOREIGN KEY unions_partner2_id_fkey: FOREIGN KEY (partner2_id) REFERENCES members(id) ON DELETE CASCADE
//   PRIMARY KEY unions_pkey: PRIMARY KEY (id)
//   CHECK unions_status_check: CHECK ((status = ANY (ARRAY['Active'::text, 'Separated'::text])))

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
//   Policy "Insert capex_acao anon" (INSERT, PERMISSIVE) roles={anon}
//     WITH CHECK: true
//   Policy "anon_read" (SELECT, PERMISSIVE) roles={anon}
//     USING: true
//   Policy "authenticated_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: capex_perdas
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
// Table: dados_simulacao
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
// Table: members
//   Policy "Admin full access for members" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
//   Policy "Public insert access for members" (INSERT, PERMISSIVE) roles={public}
//     WITH CHECK: ((status = 'Pendente'::text) OR (auth.role() = 'authenticated'::text))
//   Policy "Public read access for active members" (SELECT, PERMISSIVE) roles={public}
//     USING: ((status = 'Ativo'::text) OR (auth.role() = 'authenticated'::text))
// Table: opex
//   Policy "Insert capex_acao anon" (INSERT, PERMISSIVE) roles={anon}
//     WITH CHECK: true
//   Policy "Insert opex anon" (UPDATE, PERMISSIVE) roles={anon}
//     WITH CHECK: true
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
// Table: unions
//   Policy "Admin full access for unions" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
//   Policy "Public read access for unions" (SELECT, PERMISSIVE) roles={public}
//     USING: true
