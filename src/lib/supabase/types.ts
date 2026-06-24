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
            foreignKeyName: "arq_resultados_id_projeto_fkey"
            columns: ["id_projeto"]
            isOneToOne: false
            referencedRelation: "projetos_wps"
            referencedColumns: ["id_projeto"]
          },
        ]
      }
      artigos: {
        Row: {
          abstract: string | null
          arquivo: string | null
          ativar: boolean
          data_pub: string | null
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
          ativar?: boolean
          data_pub?: string | null
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
          ativar?: boolean
          data_pub?: string | null
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
            foreignKeyName: "artigos_id_projeto_fkey"
            columns: ["id_projeto"]
            isOneToOne: false
            referencedRelation: "projetos_wps"
            referencedColumns: ["id_projeto"]
          },
          {
            foreignKeyName: "artigos_id_tipo_artigo_fkey"
            columns: ["id_tipo_artigo"]
            isOneToOne: false
            referencedRelation: "tipo_artigo"
            referencedColumns: ["id_tipo"]
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
            foreignKeyName: "artigos_autores_id_artigo_fkey"
            columns: ["id_artigo"]
            isOneToOne: false
            referencedRelation: "artigos"
            referencedColumns: ["id_artigo"]
          },
          {
            foreignKeyName: "artigos_autores_id_autor_fkey"
            columns: ["id_autor"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id_colaborador"]
          },
        ]
      }
      camadas_mapa: {
        Row: {
          ativo: boolean | null
          bbox: unknown
          categoria: string
          created_at: string | null
          descricao: string | null
          estilo: Json | null
          fonte_raster_url: string | null
          id_camada: string
          legenda: Json | null
          nome: string
          ordem_exibicao: number | null
          tabela_origem: string | null
          tipo_dados: string
          visivel_por_padrao: boolean | null
          zoom_max: number | null
          zoom_min: number | null
        }
        Insert: {
          ativo?: boolean | null
          bbox?: unknown
          categoria: string
          created_at?: string | null
          descricao?: string | null
          estilo?: Json | null
          fonte_raster_url?: string | null
          id_camada?: string
          legenda?: Json | null
          nome: string
          ordem_exibicao?: number | null
          tabela_origem?: string | null
          tipo_dados: string
          visivel_por_padrao?: boolean | null
          zoom_max?: number | null
          zoom_min?: number | null
        }
        Update: {
          ativo?: boolean | null
          bbox?: unknown
          categoria?: string
          created_at?: string | null
          descricao?: string | null
          estilo?: Json | null
          fonte_raster_url?: string | null
          id_camada?: string
          legenda?: Json | null
          nome?: string
          ordem_exibicao?: number | null
          tabela_origem?: string | null
          tipo_dados?: string
          visivel_por_padrao?: boolean | null
          zoom_max?: number | null
          zoom_min?: number | null
        }
        Relationships: []
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
            foreignKeyName: "fk_colaboradores_grupo"
            columns: ["id_grupo"]
            isOneToOne: false
            referencedRelation: "grupo_colaboradores"
            referencedColumns: ["id_grupo"]
          },
        ]
      }
      congressos: {
        Row: {
          ativar: boolean
          data: string | null
          data_pub: string | null
          id_congresso: number
          link: string | null
          local: string | null
          organizador: string | null
          periodo: string | null
          status: string | null
          titulo: string
        }
        Insert: {
          ativar?: boolean
          data?: string | null
          data_pub?: string | null
          id_congresso?: number
          link?: string | null
          local?: string | null
          organizador?: string | null
          periodo?: string | null
          status?: string | null
          titulo: string
        }
        Update: {
          ativar?: boolean
          data?: string | null
          data_pub?: string | null
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
      feicoes_geoespaciais: {
        Row: {
          geom: unknown
          id_camada: string | null
          id_feicao: string
          nome_feicao: string | null
          propriedades: Json | null
        }
        Insert: {
          geom?: unknown
          id_camada?: string | null
          id_feicao?: string
          nome_feicao?: string | null
          propriedades?: Json | null
        }
        Update: {
          geom?: unknown
          id_camada?: string | null
          id_feicao?: string
          nome_feicao?: string | null
          propriedades?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "feicoes_geoespaciais_id_camada_fkey"
            columns: ["id_camada"]
            isOneToOne: false
            referencedRelation: "camadas_mapa"
            referencedColumns: ["id_camada"]
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
            foreignKeyName: "lista_colab_id_colaborador_fkey"
            columns: ["id_colaborador"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id_colaborador"]
          },
          {
            foreignKeyName: "lista_colab_id_wp_fkey"
            columns: ["id_wp"]
            isOneToOne: false
            referencedRelation: "wps"
            referencedColumns: ["id_wp"]
          },
        ]
      }
      midia: {
        Row: {
          arq_imagem: string | null
          arq_video: string | null
          ativar: boolean
          data_pub: string | null
          descricao: string | null
          id_midia: number
          link: string | null
          tipo: string | null
          titulo: string
        }
        Insert: {
          arq_imagem?: string | null
          arq_video?: string | null
          ativar?: boolean
          data_pub?: string | null
          descricao?: string | null
          id_midia?: number
          link?: string | null
          tipo?: string | null
          titulo: string
        }
        Update: {
          arq_imagem?: string | null
          arq_video?: string | null
          ativar?: boolean
          data_pub?: string | null
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
            foreignKeyName: "projetos_wps_id_wp_fkey"
            columns: ["id_wp"]
            isOneToOne: false
            referencedRelation: "wps"
            referencedColumns: ["id_wp"]
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
            foreignKeyName: "selecao_cenarios_id_acao_fkey"
            columns: ["id_acao"]
            isOneToOne: false
            referencedRelation: "acoes"
            referencedColumns: ["id_acao"]
          },
          {
            foreignKeyName: "selecao_cenarios_id_c_fkey"
            columns: ["id_c"]
            isOneToOne: false
            referencedRelation: "cenarios"
            referencedColumns: ["id_cenarios"]
          },
          {
            foreignKeyName: "selecao_cenarios_id_fonte_fkey"
            columns: ["id_fonte"]
            isOneToOne: false
            referencedRelation: "fonte_agua"
            referencedColumns: ["id_fonte"]
          },
          {
            foreignKeyName: "selecao_cenarios_id_tc_fkey"
            columns: ["id_tc"]
            isOneToOne: false
            referencedRelation: "tipos_cenarios"
            referencedColumns: ["id_tc"]
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
      spatial_ref_sys: {
        Row: {
          auth_name: string | null
          auth_srid: number | null
          proj4text: string | null
          srid: number
          srtext: string | null
        }
        Insert: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid: number
          srtext?: string | null
        }
        Update: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid?: number
          srtext?: string | null
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
            foreignKeyName: "wps_id_gerente_fkey"
            columns: ["id_gerente"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id_colaborador"]
          },
        ]
      }
    }
    Views: {
      geography_columns: {
        Row: {
          coord_dimension: number | null
          f_geography_column: unknown
          f_table_catalog: unknown
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Relationships: []
      }
      geometry_columns: {
        Row: {
          coord_dimension: number | null
          f_geometry_column: unknown
          f_table_catalog: string | null
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Insert: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Update: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      _postgis_deprecate: {
        Args: { newname: string; oldname: string; version: string }
        Returns: undefined
      }
      _postgis_index_extent: {
        Args: { col: string; tbl: unknown }
        Returns: unknown
      }
      _postgis_pgsql_version: { Args: never; Returns: string }
      _postgis_scripts_pgsql_version: { Args: never; Returns: string }
      _postgis_selectivity: {
        Args: { att_name: string; geom: unknown; mode?: string; tbl: unknown }
        Returns: number
      }
      _postgis_stats: {
        Args: { ""?: string; att_name: string; tbl: unknown }
        Returns: string
      }
      _st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      _st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_intersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      _st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      _st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      _st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_sortablehash: { Args: { geom: unknown }; Returns: number }
      _st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_voronoi: {
        Args: {
          clip?: unknown
          g1: unknown
          return_polygons?: boolean
          tolerance?: number
        }
        Returns: unknown
      }
      _st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      addauth: { Args: { "": string }; Returns: boolean }
      addgeometrycolumn:
        | {
            Args: {
              catalog_name: string
              column_name: string
              new_dim: number
              new_srid_in: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
      disablelongtransactions: { Args: never; Returns: string }
      dropgeometrycolumn:
        | {
            Args: {
              catalog_name: string
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { column_name: string; table_name: string }; Returns: string }
      dropgeometrytable:
        | {
            Args: {
              catalog_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { schema_name: string; table_name: string }; Returns: string }
        | { Args: { table_name: string }; Returns: string }
      enablelongtransactions: { Args: never; Returns: string }
      equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      geometry: { Args: { "": string }; Returns: unknown }
      geometry_above: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_below: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_cmp: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_contained_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_distance_box: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_distance_centroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_eq: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_ge: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_gt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_le: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_left: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_lt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overabove: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overbelow: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overleft: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overright: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_right: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geomfromewkt: { Args: { "": string }; Returns: unknown }
      gettransactionid: { Args: never; Returns: unknown }
      is_admin: { Args: never; Returns: boolean }
      longtransactionsenabled: { Args: never; Returns: boolean }
      obter_feicoes_camada: {
        Args: {
          p_id_camada: string
          p_max_lat: number
          p_max_lon: number
          p_min_lat: number
          p_min_lon: number
          p_zoom?: number
        }
        Returns: Json
      }
      populate_geometry_columns:
        | { Args: { tbl_oid: unknown; use_typmod?: boolean }; Returns: number }
        | { Args: { use_typmod?: boolean }; Returns: string }
      postgis_constraint_dims: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_srid: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_type: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: string
      }
      postgis_extensions_upgrade: { Args: never; Returns: string }
      postgis_full_version: { Args: never; Returns: string }
      postgis_geos_version: { Args: never; Returns: string }
      postgis_lib_build_date: { Args: never; Returns: string }
      postgis_lib_revision: { Args: never; Returns: string }
      postgis_lib_version: { Args: never; Returns: string }
      postgis_libjson_version: { Args: never; Returns: string }
      postgis_liblwgeom_version: { Args: never; Returns: string }
      postgis_libprotobuf_version: { Args: never; Returns: string }
      postgis_libxml_version: { Args: never; Returns: string }
      postgis_proj_version: { Args: never; Returns: string }
      postgis_scripts_build_date: { Args: never; Returns: string }
      postgis_scripts_installed: { Args: never; Returns: string }
      postgis_scripts_released: { Args: never; Returns: string }
      postgis_svn_version: { Args: never; Returns: string }
      postgis_type_name: {
        Args: {
          coord_dimension: number
          geomname: string
          use_new_name?: boolean
        }
        Returns: string
      }
      postgis_version: { Args: never; Returns: string }
      postgis_wagyu_version: { Args: never; Returns: string }
      st_3dclosestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3ddistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_3dlongestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmakebox: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmaxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dshortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_addpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_angle:
        | { Args: { line1: unknown; line2: unknown }; Returns: number }
        | {
            Args: { pt1: unknown; pt2: unknown; pt3: unknown; pt4?: unknown }
            Returns: number
          }
      st_area:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_asencodedpolyline: {
        Args: { geom: unknown; nprecision?: number }
        Returns: string
      }
      st_asewkt: { Args: { "": string }; Returns: string }
      st_asgeojson:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: {
              geom_column?: string
              maxdecimaldigits?: number
              pretty_bool?: boolean
              r: Record<string, unknown>
            }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_asgml:
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
            }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
      st_askml:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_aslatlontext: {
        Args: { geom: unknown; tmpl?: string }
        Returns: string
      }
      st_asmarc21: { Args: { format?: string; geom: unknown }; Returns: string }
      st_asmvtgeom: {
        Args: {
          bounds: unknown
          buffer?: number
          clip_geom?: boolean
          extent?: number
          geom: unknown
        }
        Returns: unknown
      }
      st_assvg:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_astext: { Args: { "": string }; Returns: string }
      st_astwkb:
        | {
            Args: {
              geom: unknown
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown[]
              ids: number[]
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
      st_asx3d: {
        Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
        Returns: string
      }
      st_azimuth:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: number }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
      st_boundingdiagonal: {
        Args: { fits?: boolean; geom: unknown }
        Returns: unknown
      }
      st_buffer:
        | {
            Args: { geom: unknown; options?: string; radius: number }
            Returns: unknown
          }
        | {
            Args: { geom: unknown; quadsegs: number; radius: number }
            Returns: unknown
          }
      st_centroid: { Args: { "": string }; Returns: unknown }
      st_clipbybox2d: {
        Args: { box: unknown; geom: unknown }
        Returns: unknown
      }
      st_closestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_collect: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_concavehull: {
        Args: {
          param_allow_holes?: boolean
          param_geom: unknown
          param_pctconvex: number
        }
        Returns: unknown
      }
      st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_coorddim: { Args: { geometry: unknown }; Returns: number }
      st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_crosses: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_curvetoline: {
        Args: { flags?: number; geom: unknown; tol?: number; toltype?: number }
        Returns: unknown
      }
      st_delaunaytriangles: {
        Args: { flags?: number; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_difference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_disjoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_distance:
        | {
            Args: { geog1: unknown; geog2: unknown; use_spheroid?: boolean }
            Returns: number
          }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
      st_distancesphere:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | {
            Args: { geom1: unknown; geom2: unknown; radius: number }
            Returns: number
          }
      st_distancespheroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_expand:
        | { Args: { box: unknown; dx: number; dy: number }; Returns: unknown }
        | {
            Args: { box: unknown; dx: number; dy: number; dz?: number }
            Returns: unknown
          }
        | {
            Args: {
              dm?: number
              dx: number
              dy: number
              dz?: number
              geom: unknown
            }
            Returns: unknown
          }
      st_force3d: { Args: { geom: unknown; zvalue?: number }; Returns: unknown }
      st_force3dm: {
        Args: { geom: unknown; mvalue?: number }
        Returns: unknown
      }
      st_force3dz: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force4d: {
        Args: { geom: unknown; mvalue?: number; zvalue?: number }
        Returns: unknown
      }
      st_generatepoints:
        | { Args: { area: unknown; npoints: number }; Returns: unknown }
        | {
            Args: { area: unknown; npoints: number; seed: number }
            Returns: unknown
          }
      st_geogfromtext: { Args: { "": string }; Returns: unknown }
      st_geographyfromtext: { Args: { "": string }; Returns: unknown }
      st_geohash:
        | { Args: { geog: unknown; maxchars?: number }; Returns: string }
        | { Args: { geom: unknown; maxchars?: number }; Returns: string }
      st_geomcollfromtext: { Args: { "": string }; Returns: unknown }
      st_geometricmedian: {
        Args: {
          fail_if_not_converged?: boolean
          g: unknown
          max_iter?: number
          tolerance?: number
        }
        Returns: unknown
      }
      st_geometryfromtext: { Args: { "": string }; Returns: unknown }
      st_geomfromewkt: { Args: { "": string }; Returns: unknown }
      st_geomfromgeojson:
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": string }; Returns: unknown }
      st_geomfromgml: { Args: { "": string }; Returns: unknown }
      st_geomfromkml: { Args: { "": string }; Returns: unknown }
      st_geomfrommarc21: { Args: { marc21xml: string }; Returns: unknown }
      st_geomfromtext: { Args: { "": string }; Returns: unknown }
      st_gmltosql: { Args: { "": string }; Returns: unknown }
      st_hasarc: { Args: { geometry: unknown }; Returns: boolean }
      st_hausdorffdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_hexagon: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_hexagongrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_interpolatepoint: {
        Args: { line: unknown; point: unknown }
        Returns: number
      }
      st_intersection: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_intersects:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_isvaliddetail: {
        Args: { flags?: number; geom: unknown }
        Returns: Database["public"]["CompositeTypes"]["valid_detail"]
        SetofOptions: {
          from: "*"
          to: "valid_detail"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      st_length:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_letters: { Args: { font?: Json; letters: string }; Returns: unknown }
      st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      st_linefromencodedpolyline: {
        Args: { nprecision?: number; txtin: string }
        Returns: unknown
      }
      st_linefromtext: { Args: { "": string }; Returns: unknown }
      st_linelocatepoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_linetocurve: { Args: { geometry: unknown }; Returns: unknown }
      st_locatealong: {
        Args: { geometry: unknown; leftrightoffset?: number; measure: number }
        Returns: unknown
      }
      st_locatebetween: {
        Args: {
          frommeasure: number
          geometry: unknown
          leftrightoffset?: number
          tomeasure: number
        }
        Returns: unknown
      }
      st_locatebetweenelevations: {
        Args: { fromelevation: number; geometry: unknown; toelevation: number }
        Returns: unknown
      }
      st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makebox2d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makeline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makevalid: {
        Args: { geom: unknown; params: string }
        Returns: unknown
      }
      st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_minimumboundingcircle: {
        Args: { inputgeom: unknown; segs_per_quarter?: number }
        Returns: unknown
      }
      st_mlinefromtext: { Args: { "": string }; Returns: unknown }
      st_mpointfromtext: { Args: { "": string }; Returns: unknown }
      st_mpolyfromtext: { Args: { "": string }; Returns: unknown }
      st_multilinestringfromtext: { Args: { "": string }; Returns: unknown }
      st_multipointfromtext: { Args: { "": string }; Returns: unknown }
      st_multipolygonfromtext: { Args: { "": string }; Returns: unknown }
      st_node: { Args: { g: unknown }; Returns: unknown }
      st_normalize: { Args: { geom: unknown }; Returns: unknown }
      st_offsetcurve: {
        Args: { distance: number; line: unknown; params?: string }
        Returns: unknown
      }
      st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_perimeter: {
        Args: { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_pointfromtext: { Args: { "": string }; Returns: unknown }
      st_pointm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
        }
        Returns: unknown
      }
      st_pointz: {
        Args: {
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_pointzm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_polyfromtext: { Args: { "": string }; Returns: unknown }
      st_polygonfromtext: { Args: { "": string }; Returns: unknown }
      st_project: {
        Args: { azimuth: number; distance: number; geog: unknown }
        Returns: unknown
      }
      st_quantizecoordinates: {
        Args: {
          g: unknown
          prec_m?: number
          prec_x: number
          prec_y?: number
          prec_z?: number
        }
        Returns: unknown
      }
      st_reduceprecision: {
        Args: { geom: unknown; gridsize: number }
        Returns: unknown
      }
      st_relate: { Args: { geom1: unknown; geom2: unknown }; Returns: string }
      st_removerepeatedpoints: {
        Args: { geom: unknown; tolerance?: number }
        Returns: unknown
      }
      st_segmentize: {
        Args: { geog: unknown; max_segment_length: number }
        Returns: unknown
      }
      st_setsrid:
        | { Args: { geog: unknown; srid: number }; Returns: unknown }
        | { Args: { geom: unknown; srid: number }; Returns: unknown }
      st_sharedpaths: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_shortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_simplifypolygonhull: {
        Args: { geom: unknown; is_outer?: boolean; vertex_fraction: number }
        Returns: unknown
      }
      st_split: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_square: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_squaregrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_srid:
        | { Args: { geog: unknown }; Returns: number }
        | { Args: { geom: unknown }; Returns: number }
      st_subdivide: {
        Args: { geom: unknown; gridsize?: number; maxvertices?: number }
        Returns: unknown[]
      }
      st_swapordinates: {
        Args: { geom: unknown; ords: unknown }
        Returns: unknown
      }
      st_symdifference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_symmetricdifference: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_tileenvelope: {
        Args: {
          bounds?: unknown
          margin?: number
          x: number
          y: number
          zoom: number
        }
        Returns: unknown
      }
      st_touches: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_transform:
        | {
            Args: { from_proj: string; geom: unknown; to_proj: string }
            Returns: unknown
          }
        | {
            Args: { from_proj: string; geom: unknown; to_srid: number }
            Returns: unknown
          }
        | { Args: { geom: unknown; to_proj: string }; Returns: unknown }
      st_triangulatepolygon: { Args: { g1: unknown }; Returns: unknown }
      st_union:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
        | {
            Args: { geom1: unknown; geom2: unknown; gridsize: number }
            Returns: unknown
          }
      st_voronoilines: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_voronoipolygons: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_wkbtosql: { Args: { wkb: string }; Returns: unknown }
      st_wkttosql: { Args: { "": string }; Returns: unknown }
      st_wrapx: {
        Args: { geom: unknown; move: number; wrap: number }
        Returns: unknown
      }
      unlockrows: { Args: { "": string }; Returns: number }
      updategeometrysrid: {
        Args: {
          catalogn_name: string
          column_name: string
          new_srid_in: number
          schema_name: string
          table_name: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      geometry_dump: {
        path: number[] | null
        geom: unknown
      }
      valid_detail: {
        valid: boolean | null
        reason: string | null
        location: unknown
      }
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

