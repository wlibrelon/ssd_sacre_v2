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
      arq_resultados: {
        Row: {
          descricao: string | null
          id_arq_res: number
          id_projeto: number | null
          nome_arq: string | null
        }
        Insert: {
          descricao?: string | null
          id_arq_res?: number
          id_projeto?: number | null
          nome_arq?: string | null
        }
        Update: {
          descricao?: string | null
          id_arq_res?: number
          id_projeto?: number | null
          nome_arq?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'arq_resultados_id_projeto_fkey'
            columns: ['id_projeto']
            isOneToOne: false
            referencedRelation: 'projetos_wps'
            referencedColumns: ['id_projeto']
          },
        ]
      }
      artigos: {
        Row: {
          abstract: string | null
          arquivo: string | null
          doi: string | null
          id_artigo: number
          id_projeto: number | null
          id_tipo_artigo: number | null
          resumo: string | null
          revista: string | null
          titulo: string | null
        }
        Insert: {
          abstract?: string | null
          arquivo?: string | null
          doi?: string | null
          id_artigo?: number
          id_projeto?: number | null
          id_tipo_artigo?: number | null
          resumo?: string | null
          revista?: string | null
          titulo?: string | null
        }
        Update: {
          abstract?: string | null
          arquivo?: string | null
          doi?: string | null
          id_artigo?: number
          id_projeto?: number | null
          id_tipo_artigo?: number | null
          resumo?: string | null
          revista?: string | null
          titulo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'artigos_id_projeto_fkey'
            columns: ['id_projeto']
            isOneToOne: false
            referencedRelation: 'projetos_wps'
            referencedColumns: ['id_projeto']
          },
          {
            foreignKeyName: 'artigos_id_tipo_artigo_fkey'
            columns: ['id_tipo_artigo']
            isOneToOne: false
            referencedRelation: 'tipo_artigo'
            referencedColumns: ['id_tipo']
          },
        ]
      }
      artigos_autores: {
        Row: {
          id_artigo: number | null
          id_artigo_autor: number
          id_autor: number | null
          is_principal: boolean | null
        }
        Insert: {
          id_artigo?: number | null
          id_artigo_autor?: number
          id_autor?: number | null
          is_principal?: boolean | null
        }
        Update: {
          id_artigo?: number | null
          id_artigo_autor?: number
          id_autor?: number | null
          is_principal?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: 'artigos_autores_id_artigo_fkey'
            columns: ['id_artigo']
            isOneToOne: false
            referencedRelation: 'artigos'
            referencedColumns: ['id_artigo']
          },
          {
            foreignKeyName: 'artigos_autores_id_autor_fkey'
            columns: ['id_autor']
            isOneToOne: false
            referencedRelation: 'colaboradores'
            referencedColumns: ['id_colaborador']
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
      colaboradores: {
        Row: {
          formacao: string | null
          foto: string | null
          id_colaborador: number
          id_grupo: number | null
          link_internet: string | null
          nome: string
          status: string | null
        }
        Insert: {
          formacao?: string | null
          foto?: string | null
          id_colaborador?: number
          id_grupo?: number | null
          link_internet?: string | null
          nome: string
          status?: string | null
        }
        Update: {
          formacao?: string | null
          foto?: string | null
          id_colaborador?: number
          id_grupo?: number | null
          link_internet?: string | null
          nome?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'fk_colaboradores_grupo'
            columns: ['id_grupo']
            isOneToOne: false
            referencedRelation: 'grupo_colaboradores'
            referencedColumns: ['id_grupo']
          },
        ]
      }
      congressos: {
        Row: {
          data: string | null
          id_congresso: number
          link: string | null
          local: string | null
          organizador: string | null
          periodo: string | null
          status: string | null
          titulo: string
        }
        Insert: {
          data?: string | null
          id_congresso?: number
          link?: string | null
          local?: string | null
          organizador?: string | null
          periodo?: string | null
          status?: string | null
          titulo: string
        }
        Update: {
          data?: string | null
          id_congresso?: number
          link?: string | null
          local?: string | null
          organizador?: string | null
          periodo?: string | null
          status?: string | null
          titulo?: string
        }
        Relationships: []
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
          cenarios: Json | null
          demanda: number | null
          estrategias: Json | null
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
          cenarios?: Json | null
          demanda?: number | null
          estrategias?: Json | null
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
          cenarios?: Json | null
          demanda?: number | null
          estrategias?: Json | null
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
            foreignKeyName: 'dados_simulacao_id_mod_fkey'
            columns: ['id_mod']
            isOneToOne: false
            referencedRelation: 'modelos'
            referencedColumns: ['id_mod']
          },
          {
            foreignKeyName: 'dados_simulacao_id_s_fkey'
            columns: ['id_s']
            isOneToOne: false
            referencedRelation: 'simulacao_ssd'
            referencedColumns: ['id_s']
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
      grupo_colaboradores: {
        Row: {
          descricao: string
          id_grupo: number
        }
        Insert: {
          descricao: string
          id_grupo?: number
        }
        Update: {
          descricao?: string
          id_grupo?: number
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
            foreignKeyName: 'indicadores_id_fonte_fkey'
            columns: ['id_fonte']
            isOneToOne: false
            referencedRelation: 'fonte_agua'
            referencedColumns: ['id_fonte']
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
            foreignKeyName: 'indicadores_aplicado_id_indicador_fkey'
            columns: ['id_indicador']
            isOneToOne: false
            referencedRelation: 'indicadores'
            referencedColumns: ['id_indicador']
          },
          {
            foreignKeyName: 'indicadores_aplicado_id_s_fkey'
            columns: ['id_s']
            isOneToOne: false
            referencedRelation: 'simulacao_ssd'
            referencedColumns: ['id_s']
          },
        ]
      }
      lista_colab: {
        Row: {
          id_colaborador: number | null
          id_lista_colab: number
          id_wp: number | null
        }
        Insert: {
          id_colaborador?: number | null
          id_lista_colab?: number
          id_wp?: number | null
        }
        Update: {
          id_colaborador?: number | null
          id_lista_colab?: number
          id_wp?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'lista_colab_id_colaborador_fkey'
            columns: ['id_colaborador']
            isOneToOne: false
            referencedRelation: 'colaboradores'
            referencedColumns: ['id_colaborador']
          },
          {
            foreignKeyName: 'lista_colab_id_wp_fkey'
            columns: ['id_wp']
            isOneToOne: false
            referencedRelation: 'wps'
            referencedColumns: ['id_wp']
          },
        ]
      }
      midia: {
        Row: {
          arq_imagem: string | null
          arq_video: string | null
          descricao: string | null
          id_midia: number
          link: string | null
          tipo: string | null
          titulo: string
        }
        Insert: {
          arq_imagem?: string | null
          arq_video?: string | null
          descricao?: string | null
          id_midia?: number
          link?: string | null
          tipo?: string | null
          titulo: string
        }
        Update: {
          arq_imagem?: string | null
          arq_video?: string | null
          descricao?: string | null
          id_midia?: number
          link?: string | null
          tipo?: string | null
          titulo?: string
        }
        Relationships: []
      }
      modelos: {
        Row: {
          arq_capex_estrategias: string | null
          arq_capex_perdas: string | null
          arq_demanda: string | null
          arq_indicador: Json | null
          arq_mod: string | null
          arq_opex: string | null
          arq_perdas: string | null
          cenario: Json | null
          estrategia: Json | null
          id_fonte: number | null
          id_mod: number
        }
        Insert: {
          arq_capex_estrategias?: string | null
          arq_capex_perdas?: string | null
          arq_demanda?: string | null
          arq_indicador?: Json | null
          arq_mod?: string | null
          arq_opex?: string | null
          arq_perdas?: string | null
          cenario?: Json | null
          estrategia?: Json | null
          id_fonte?: number | null
          id_mod?: number
        }
        Update: {
          arq_capex_estrategias?: string | null
          arq_capex_perdas?: string | null
          arq_demanda?: string | null
          arq_indicador?: Json | null
          arq_mod?: string | null
          arq_opex?: string | null
          arq_perdas?: string | null
          cenario?: Json | null
          estrategia?: Json | null
          id_fonte?: number | null
          id_mod?: number
        }
        Relationships: [
          {
            foreignKeyName: 'modelos_id_fonte_fkey'
            columns: ['id_fonte']
            isOneToOne: false
            referencedRelation: 'fonte_agua'
            referencedColumns: ['id_fonte']
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
            foreignKeyName: 'perfis_usuarios_id_ga_fkey'
            columns: ['id_ga']
            isOneToOne: false
            referencedRelation: 'grupo_acesso'
            referencedColumns: ['id_ga']
          },
        ]
      }
      projetos_wps: {
        Row: {
          id_autor: number | null
          id_projeto: number
          id_wp: number | null
          objetivos: string | null
          resumo: string | null
          titulo: string | null
        }
        Insert: {
          id_autor?: number | null
          id_projeto?: number
          id_wp?: number | null
          objetivos?: string | null
          resumo?: string | null
          titulo?: string | null
        }
        Update: {
          id_autor?: number | null
          id_projeto?: number
          id_wp?: number | null
          objetivos?: string | null
          resumo?: string | null
          titulo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'projetos_wps_id_wp_fkey'
            columns: ['id_wp']
            isOneToOne: false
            referencedRelation: 'wps'
            referencedColumns: ['id_wp']
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
            foreignKeyName: 'recursos_app_id_ga_fkey'
            columns: ['id_ga']
            isOneToOne: false
            referencedRelation: 'grupo_acesso'
            referencedColumns: ['id_ga']
          },
        ]
      }
      selecao_cenarios: {
        Row: {
          cenarios: Json | null
          criado_at: string | null
          estrategias: Json | null
          id: string
          id_acao: number | null
          id_c: number | null
          id_fonte: number | null
          id_tc: number | null
          id_usuario: string
          selecionado: boolean | null
        }
        Insert: {
          cenarios?: Json | null
          criado_at?: string | null
          estrategias?: Json | null
          id?: string
          id_acao?: number | null
          id_c?: number | null
          id_fonte?: number | null
          id_tc?: number | null
          id_usuario: string
          selecionado?: boolean | null
        }
        Update: {
          cenarios?: Json | null
          criado_at?: string | null
          estrategias?: Json | null
          id?: string
          id_acao?: number | null
          id_c?: number | null
          id_fonte?: number | null
          id_tc?: number | null
          id_usuario?: string
          selecionado?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: 'selecao_cenarios_id_acao_fkey'
            columns: ['id_acao']
            isOneToOne: false
            referencedRelation: 'acoes'
            referencedColumns: ['id_acao']
          },
          {
            foreignKeyName: 'selecao_cenarios_id_c_fkey'
            columns: ['id_c']
            isOneToOne: false
            referencedRelation: 'cenarios'
            referencedColumns: ['id_cenarios']
          },
          {
            foreignKeyName: 'selecao_cenarios_id_fonte_fkey'
            columns: ['id_fonte']
            isOneToOne: false
            referencedRelation: 'fonte_agua'
            referencedColumns: ['id_fonte']
          },
          {
            foreignKeyName: 'selecao_cenarios_id_tc_fkey'
            columns: ['id_tc']
            isOneToOne: false
            referencedRelation: 'tipos_cenarios'
            referencedColumns: ['id_tc']
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
      tipo_artigo: {
        Row: {
          descricao: string | null
          id_tipo: number
        }
        Insert: {
          descricao?: string | null
          id_tipo?: number
        }
        Update: {
          descricao?: string | null
          id_tipo?: number
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
      wps: {
        Row: {
          descricao: string | null
          id_gerente: number | null
          id_wp: number
          menu: string | null
          titulo: string | null
          wp: number | null
        }
        Insert: {
          descricao?: string | null
          id_gerente?: number | null
          id_wp?: number
          menu?: string | null
          titulo?: string | null
          wp?: number | null
        }
        Update: {
          descricao?: string | null
          id_gerente?: number | null
          id_wp?: number
          menu?: string | null
          titulo?: string | null
          wp?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'wps_id_gerente_fkey'
            columns: ['id_gerente']
            isOneToOne: false
            referencedRelation: 'colaboradores'
            referencedColumns: ['id_colaborador']
          },
        ]
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
