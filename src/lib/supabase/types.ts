// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
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
            foreignKeyName: 'acoes_fonte_id_fonte_fkey'
            columns: ['id_fonte']
            isOneToOne: false
            referencedRelation: 'fonte_agua'
            referencedColumns: ['id_fonte']
          },
        ]
      }
      capex_acao: {
        Row: {
          id_ca: number
          id_acao: number | null
          tempo: string | null
          capex: number | null
        }
        Insert: {
          id_ca?: number
          id_acao?: number | null
          tempo?: string | null
          capex?: number | null
        }
        Update: {
          id_ca?: number
          id_acao?: number | null
          tempo?: string | null
          capex?: number | null
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
          id_cp: number
          tempo: string | null
          capex: number | null
        }
        Insert: {
          id_cp?: number
          tempo?: string | null
          capex?: number | null
        }
        Update: {
          id_cp?: number
          tempo?: string | null
          capex?: number | null
        }
        Relationships: []
      }
      opex: {
        Row: {
          id_oa: number
          tempo: string | null
          opex: number | null
        }
        Insert: {
          id_oa?: number
          tempo?: string | null
          opex?: number | null
        }
        Update: {
          id_oa?: number
          tempo?: string | null
          opex?: number | null
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
          id_c: number | null
          id_cs: number
          id_acao: number | null
          id_fonte: number | null
          id_s: number | null
          id_tc: number | null
        }
        Insert: {
          id_c?: number | null
          id_cs?: number
          id_acao?: number | null
          id_fonte?: number | null
          id_s?: number | null
          id_tc?: number | null
        }
        Update: {
          id_c?: number | null
          id_cs?: number
          id_acao?: number | null
          id_fonte?: number | null
          id_s?: number | null
          id_tc?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'cenario_simulacao_id_c_fkey'
            columns: ['id_c']
            isOneToOne: false
            referencedRelation: 'cenarios'
            referencedColumns: ['id_cenarios']
          },
          {
            foreignKeyName: 'cenario_simulacao_id_acao_fkey'
            columns: ['id_acao']
            isOneToOne: false
            referencedRelation: 'acoes'
            referencedColumns: ['id_acao']
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
          id_c: number | null
          id_cc: number | null
          id_cd: number | null
          id_cp: number | null
          id_ds: number
          id_acao: number | null
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
          id_acao?: number | null
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
          id_acao?: number | null
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
            foreignKeyName: 'dados_simulacao_id_acao_fkey'
            columns: ['id_acao']
            isOneToOne: false
            referencedRelation: 'acoes'
            referencedColumns: ['id_acao']
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
