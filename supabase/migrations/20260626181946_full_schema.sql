-- 1. Extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Base Reference Tables
CREATE TABLE IF NOT EXISTS public.grupo_acesso (
    id_ga SERIAL PRIMARY KEY,
    nome_grupo VARCHAR
);

CREATE TABLE IF NOT EXISTS public.recursos_app (
    id_rapp SERIAL PRIMARY KEY,
    nome_recurso VARCHAR,
    id_ga INTEGER REFERENCES public.grupo_acesso(id_ga) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS public.perfis_usuarios (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nome TEXT,
    email TEXT,
    organizacao TEXT,
    nivel_acesso TEXT,
    objetivo_acesso TEXT,
    id_ga INTEGER REFERENCES public.grupo_acesso(id_ga),
    status TEXT DEFAULT 'pendente',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.grupo_colaboradores (
    id_grupo SERIAL PRIMARY KEY,
    descricao VARCHAR
);

CREATE TABLE IF NOT EXISTS public.colaboradores (
    id_colaborador SERIAL PRIMARY KEY,
    nome VARCHAR,
    link_internet VARCHAR,
    formacao VARCHAR,
    foto TEXT,
    status VARCHAR DEFAULT 'Ativo',
    id_grupo INTEGER REFERENCES public.grupo_colaboradores(id_grupo) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS public.wps (
    id_wp SERIAL PRIMARY KEY,
    wp INTEGER,
    titulo TEXT,
    descricao TEXT,
    menu VARCHAR,
    id_gerente INTEGER REFERENCES public.colaboradores(id_colaborador) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS public.projetos_wps (
    id_projeto SERIAL PRIMARY KEY,
    id_wp INTEGER REFERENCES public.wps(id_wp) ON DELETE SET NULL,
    titulo TEXT,
    id_autor INTEGER,
    resumo TEXT,
    objetivos TEXT
);

CREATE TABLE IF NOT EXISTS public.lista_colab (
    id_lista_colab SERIAL PRIMARY KEY,
    id_colaborador INTEGER REFERENCES public.colaboradores(id_colaborador) ON DELETE CASCADE,
    id_wp INTEGER REFERENCES public.wps(id_wp) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.tipo_artigo (
    id_tipo SERIAL PRIMARY KEY,
    descricao TEXT
);

CREATE TABLE IF NOT EXISTS public.artigos (
    id_artigo SERIAL PRIMARY KEY,
    id_projeto INTEGER REFERENCES public.projetos_wps(id_projeto) ON DELETE SET NULL,
    titulo VARCHAR,
    resumo TEXT,
    abstract TEXT,
    doi TEXT,
    arquivo TEXT,
    id_tipo_artigo INTEGER REFERENCES public.tipo_artigo(id_tipo) ON DELETE SET NULL,
    revista VARCHAR,
    ativar BOOLEAN DEFAULT true,
    data_pub DATE
);

CREATE TABLE IF NOT EXISTS public.artigos_autores (
    id_artigo_autor SERIAL PRIMARY KEY,
    id_artigo INTEGER REFERENCES public.artigos(id_artigo) ON DELETE CASCADE,
    id_autor INTEGER REFERENCES public.colaboradores(id_colaborador) ON DELETE CASCADE,
    is_principal BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS public.arq_resultados (
    id_arq_res SERIAL PRIMARY KEY,
    id_projeto INTEGER REFERENCES public.projetos_wps(id_projeto) ON DELETE CASCADE,
    descricao TEXT,
    nome_arq VARCHAR
);

-- 3. Geospatial Tables
CREATE TABLE IF NOT EXISTS public.camadas_mapa (
    id_camada UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT,
    descricao TEXT,
    categoria TEXT,
    tipo_dados TEXT,
    tabela_origem TEXT,
    fonte_raster_url TEXT,
    estilo JSONB DEFAULT '{}'::jsonb,
    legenda JSONB DEFAULT '[]'::jsonb,
    zoom_min INTEGER DEFAULT 0,
    zoom_max INTEGER DEFAULT 22,
    bbox geometry,
    ordem_exibicao INTEGER DEFAULT 0,
    ativo BOOLEAN DEFAULT true,
    visivel_por_padrao BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    status_importacao TEXT DEFAULT 'pendente',
    importado_em TIMESTAMPTZ,
    mensagem_erro TEXT,
    total_feicoes INTEGER DEFAULT 0,
    epsg_origem INTEGER DEFAULT 4674,
    campo_nome TEXT
);

CREATE TABLE IF NOT EXISTS public.feicoes_geoespaciais (
    id_feicao UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_camada UUID REFERENCES public.camadas_mapa(id_camada) ON DELETE CASCADE,
    geom geometry,
    nome_feicao TEXT,
    propriedades JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_feicoes_geoespaciais_camada ON public.feicoes_geoespaciais(id_camada);
CREATE INDEX IF NOT EXISTS idx_feicoes_geoespaciais_geom ON public.feicoes_geoespaciais USING GIST (geom);

-- 4. Simulation SSD Tables
CREATE TABLE IF NOT EXISTS public.fonte_agua (
    id_fonte SERIAL PRIMARY KEY,
    nome_fonte VARCHAR,
    sujeito_perdas BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.acoes (
    id_acao SERIAL PRIMARY KEY,
    descricao VARCHAR,
    obs VARCHAR
);

CREATE TABLE IF NOT EXISTS public.acoes_fonte (
    id_ef SERIAL PRIMARY KEY,
    id_fonte INTEGER REFERENCES public.fonte_agua(id_fonte) ON DELETE CASCADE,
    id_acao INTEGER REFERENCES public.acoes(id_acao) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.cenarios (
    id_cenarios SERIAL PRIMARY KEY,
    cenarios VARCHAR,
    obs_cenario VARCHAR
);

CREATE TABLE IF NOT EXISTS public.tipos_cenarios (
    id_tc SERIAL PRIMARY KEY,
    descricao VARCHAR,
    obs_tipo_cenario VARCHAR
);

CREATE TABLE IF NOT EXISTS public.tipo_cenario_cenario (
    id_tcc SERIAL PRIMARY KEY,
    id_tc INTEGER REFERENCES public.tipos_cenarios(id_tc) ON DELETE CASCADE,
    id_c INTEGER REFERENCES public.cenarios(id_cenarios) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.cenarios_fonte (
    id_cf SERIAL PRIMARY KEY,
    id_fonte INTEGER REFERENCES public.fonte_agua(id_fonte) ON DELETE CASCADE,
    id_tc INTEGER REFERENCES public.tipos_cenarios(id_tc) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.simulacao_ssd (
    id_s SERIAL PRIMARY KEY,
    descricao VARCHAR,
    demanda_auto BOOLEAN DEFAULT false,
    perdas_auto BOOLEAN DEFAULT false,
    pop_inicial DOUBLE PRECISION,
    inicio_perdas VARCHAR,
    perc_inicial_perdas DOUBLE PRECISION,
    total_capex DOUBLE PRECISION,
    media_reducao_perdas DOUBLE PRECISION,
    limiar_alerta DOUBLE PRECISION,
    limiar_crise DOUBLE PRECISION,
    limiar_colapso DOUBLE PRECISION
);

CREATE TABLE IF NOT EXISTS public.cenario_simulacao (
    id_cs SERIAL PRIMARY KEY,
    id_s INTEGER REFERENCES public.simulacao_ssd(id_s) ON DELETE CASCADE,
    id_fonte INTEGER REFERENCES public.fonte_agua(id_fonte) ON DELETE CASCADE,
    id_tc INTEGER REFERENCES public.tipos_cenarios(id_tc) ON DELETE CASCADE,
    id_c INTEGER REFERENCES public.cenarios(id_cenarios) ON DELETE CASCADE,
    id_acao INTEGER REFERENCES public.acoes(id_acao) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.modelos (
    id_mod SERIAL PRIMARY KEY,
    id_fonte INTEGER REFERENCES public.fonte_agua(id_fonte) ON DELETE CASCADE,
    cenario JSONB,
    estrategia JSONB,
    arq_mod TEXT,
    arq_perdas TEXT,
    arq_demanda TEXT,
    arq_capex_estrategias TEXT,
    arq_capex_perdas TEXT,
    arq_opex TEXT,
    arq_indicador JSONB
);

CREATE TABLE IF NOT EXISTS public.dados_simulacao (
    id_ds SERIAL PRIMARY KEY,
    id_s INTEGER REFERENCES public.simulacao_ssd(id_s) ON DELETE CASCADE,
    tempo VARCHAR,
    id_fonte INTEGER REFERENCES public.fonte_agua(id_fonte) ON DELETE CASCADE,
    id_acao INTEGER REFERENCES public.acoes(id_acao) ON DELETE SET NULL,
    volume_captado DOUBLE PRECISION,
    capex_estrategia DOUBLE PRECISION,
    opex DOUBLE PRECISION,
    rebaixamento DOUBLE PRECISION,
    demanda DOUBLE PRECISION,
    perdas DOUBLE PRECISION,
    id_mod INTEGER REFERENCES public.modelos(id_mod) ON DELETE CASCADE,
    capex_perdas DOUBLE PRECISION,
    valores_extras JSONB DEFAULT '{}'::jsonb,
    cenarios JSONB,
    estrategias JSONB
);
CREATE UNIQUE INDEX IF NOT EXISTS dados_simulacao_s_mod_fonte_tempo_key ON public.dados_simulacao(id_s, id_mod, id_fonte, tempo);

CREATE TABLE IF NOT EXISTS public.indicadores (
    id_indicador SERIAL PRIMARY KEY,
    id_fonte INTEGER REFERENCES public.fonte_agua(id_fonte) ON DELETE CASCADE,
    descricao VARCHAR,
    unidade VARCHAR,
    campo_extra VARCHAR
);

CREATE TABLE IF NOT EXISTS public.indicadores_aplicado (
    id_ia SERIAL PRIMARY KEY,
    id_s INTEGER REFERENCES public.simulacao_ssd(id_s) ON DELETE CASCADE,
    id_indicador INTEGER REFERENCES public.indicadores(id_indicador) ON DELETE CASCADE,
    arquivo VARCHAR
);

CREATE TABLE IF NOT EXISTS public.capex_acao (
    id_ca SERIAL PRIMARY KEY,
    id_acao INTEGER REFERENCES public.acoes(id_acao) ON DELETE CASCADE,
    tempo VARCHAR,
    capex DOUBLE PRECISION
);

CREATE TABLE IF NOT EXISTS public.capex_perdas (
    id_cp SERIAL PRIMARY KEY,
    tempo VARCHAR,
    capex DOUBLE PRECISION
);

CREATE TABLE IF NOT EXISTS public.opex (
    id_oa SERIAL PRIMARY KEY,
    tempo VARCHAR,
    opex DOUBLE PRECISION
);

CREATE TABLE IF NOT EXISTS public.cenario_consumo (
    id_cc SERIAL PRIMARY KEY,
    nome_cenario_consumo VARCHAR,
    descricao VARCHAR,
    vol_hab DOUBLE PRECISION
);

CREATE TABLE IF NOT EXISTS public.cenario_demanda (
    id_cd SERIAL PRIMARY KEY,
    nome_cenario_demanda VARCHAR,
    descricao VARCHAR,
    percentual DOUBLE PRECISION
);

CREATE TABLE IF NOT EXISTS public.cenario_perdas (
    id_cp SERIAL PRIMARY KEY,
    nome_cenario_perdas VARCHAR,
    percentual DOUBLE PRECISION
);

CREATE TABLE IF NOT EXISTS public.selecao_cenarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_fonte INTEGER REFERENCES public.fonte_agua(id_fonte) ON DELETE CASCADE,
    id_tc INTEGER REFERENCES public.tipos_cenarios(id_tc) ON DELETE CASCADE,
    id_c INTEGER REFERENCES public.cenarios(id_cenarios) ON DELETE CASCADE,
    id_acao INTEGER REFERENCES public.acoes(id_acao) ON DELETE CASCADE,
    selecionado BOOLEAN DEFAULT true,
    id_usuario UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    criado_at TIMESTAMPTZ DEFAULT NOW(),
    cenarios JSONB DEFAULT '{}'::jsonb,
    estrategias JSONB DEFAULT '[]'::jsonb
);
CREATE INDEX IF NOT EXISTS idx_selecao_cenarios_usuario ON public.selecao_cenarios(id_usuario);

-- 5. Additional Dissemination Tables
CREATE TABLE IF NOT EXISTS public.midia (
    id_midia SERIAL PRIMARY KEY,
    titulo VARCHAR,
    tipo VARCHAR,
    descricao TEXT,
    arq_imagem VARCHAR,
    arq_video VARCHAR,
    link TEXT,
    ativar BOOLEAN DEFAULT true,
    data_pub DATE
);

CREATE TABLE IF NOT EXISTS public.congressos (
    id_congresso SERIAL PRIMARY KEY,
    titulo VARCHAR,
    organizador VARCHAR,
    data DATE,
    periodo VARCHAR,
    local VARCHAR,
    link VARCHAR,
    status VARCHAR,
    ativar BOOLEAN DEFAULT true,
    data_pub DATE
);

CREATE TABLE IF NOT EXISTS public.atividades_sociais (
    id_ativ_soc SERIAL PRIMARY KEY,
    titulo TEXT,
    descricao TEXT,
    data_atividade DATE,
    data_pub DATE,
    link TEXT,
    local TEXT,
    entidade TEXT,
    publico_alvo TEXT,
    fotos JSONB DEFAULT '[]'::jsonb,
    ativar BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.documentos_publicos (
    id SERIAL PRIMARY KEY,
    nome TEXT,
    descricao TEXT,
    url_arquivo TEXT,
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.conteudo_estudo (
    id SERIAL PRIMARY KEY,
    secao TEXT,
    conteudo_html TEXT,
    ordem INTEGER DEFAULT 0
);

-- 6. Functions & Triggers
CREATE OR REPLACE FUNCTION public.fix_users_nulls_and_roles()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role IS NULL OR NEW.role = '' THEN
    NEW.role := 'authenticated';
  END IF;
  IF NEW.aud IS NULL OR NEW.aud = '' THEN
    NEW.aud := 'authenticated';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS fix_users_role_aud_before_insert ON auth.users;
CREATE TRIGGER fix_users_role_aud_before_insert
  BEFORE INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.fix_users_nulls_and_roles();

CREATE OR REPLACE FUNCTION public.on_ddl_end_fix_users()
RETURNS event_trigger AS $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'auth' AND table_name = 'users' AND column_name = 'email_change_token_new'
  ) THEN
    UPDATE auth.users SET 
      confirmation_token = COALESCE(confirmation_token, ''),
      email_change = COALESCE(email_change, ''),
      email_change_token_new = COALESCE(email_change_token_new, ''),
      recovery_token = COALESCE(recovery_token, ''),
      role = CASE WHEN role = '' OR role IS NULL THEN 'authenticated' ELSE role END,
      aud = CASE WHEN aud = '' OR aud IS NULL THEN 'authenticated' ELSE aud END
    WHERE confirmation_token IS NULL
       OR email_change IS NULL
       OR email_change_token_new IS NULL
       OR recovery_token IS NULL
       OR role = ''
       OR role IS NULL
       OR aud = ''
       OR aud IS NULL;
  END IF;
END;
$$ LANGUAGE plpgsql;

DROP EVENT TRIGGER IF EXISTS fix_users_nulls_event_trigger;
CREATE EVENT TRIGGER fix_users_nulls_event_trigger
  ON ddl_command_end
  EXECUTE FUNCTION public.on_ddl_end_fix_users();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.perfis_usuarios (id, email, nome)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'nome', ''))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN (
    SELECT nivel_acesso = 'admin'
    FROM public.perfis_usuarios
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.importar_feicoes_lote(p_id_camada uuid, p_feicoes jsonb)
RETURNS integer AS $$
DECLARE
  v_count integer;
BEGIN
  INSERT INTO public.feicoes_geoespaciais (id_camada, geom, nome_feicao, propriedades)
  SELECT
    p_id_camada,
    ST_SetSRID(ST_GeomFromGeoJSON(item->>'geom'), 4326),
    item->>'nome',
    COALESCE(item->'propriedades', '{}'::jsonb)
  FROM jsonb_array_elements(p_feicoes) AS item;

  SELECT count(*) INTO v_count FROM public.feicoes_geoespaciais WHERE id_camada = p_id_camada;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.finalizar_importacao_vetorial(p_id_camada uuid, p_total integer)
RETURNS void AS $$
BEGIN
  UPDATE public.camadas_mapa
  SET
    bbox = (SELECT ST_Envelope(ST_Collect(geom)) FROM public.feicoes_geoespaciais WHERE id_camada = p_id_camada),
    status_importacao = 'importado',
    total_feicoes = p_total,
    importado_em = NOW(),
    mensagem_erro = NULL
  WHERE id_camada = p_id_camada;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.obter_feicoes_camada(
    p_id_camada UUID,
    p_min_lon DOUBLE PRECISION,
    p_min_lat DOUBLE PRECISION,
    p_max_lon DOUBLE PRECISION,
    p_max_lat DOUBLE PRECISION,
    p_zoom INT DEFAULT 10
)
RETURNS JSONB AS $$
DECLARE
    v_bbox geometry;
    v_tolerance DOUBLE PRECISION;
    v_result JSONB;
BEGIN
    v_bbox := ST_MakeEnvelope(p_min_lon, p_min_lat, p_max_lon, p_max_lat, 4326);
    v_tolerance := 360.0 / (256.0 * power(2, p_zoom));

    SELECT jsonb_build_object(
        'type', 'FeatureCollection',
        'features', COALESCE(jsonb_agg(
            jsonb_build_object(
                'type', 'Feature',
                'geometry', ST_AsGeoJSON(ST_SimplifyPreserveTopology(geom, v_tolerance))::jsonb,
                'properties', propriedades || jsonb_build_object('id_feicao', id_feicao, 'nome', nome_feicao)
            )
        ), '[]'::jsonb)
    )
    INTO v_result
    FROM public.feicoes_geoespaciais
    WHERE id_camada = p_id_camada
      AND geom && v_bbox;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.obter_extensao_camada(p_id_camada uuid)
RETURNS jsonb AS $$
DECLARE
  v_result jsonb;
BEGIN
  SELECT ST_AsGeoJSON(bbox)::jsonb INTO v_result
  FROM public.camadas_mapa
  WHERE id_camada = p_id_camada;
  RETURN v_result;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 7. Global RLS Policies for All Tables
DO $$
DECLARE
    tbl text;
    tables text[] := ARRAY[
        'acoes', 'acoes_fonte', 'arq_resultados', 'artigos', 'artigos_autores',
        'atividades_sociais', 'camadas_mapa', 'capex_acao', 'capex_perdas',
        'cenario_consumo', 'cenario_demanda', 'cenario_perdas', 'cenario_simulacao',
        'cenarios', 'cenarios_fonte', 'colaboradores', 'congressos', 'conteudo_estudo',
        'dados_simulacao', 'documentos_publicos', 'feicoes_geoespaciais', 'fonte_agua',
        'grupo_acesso', 'grupo_colaboradores', 'indicadores', 'indicadores_aplicado',
        'lista_colab', 'midia', 'modelos', 'opex', 'perfis_usuarios', 'projetos_wps',
        'recursos_app', 'selecao_cenarios', 'simulacao_ssd', 'tipo_artigo',
        'tipo_cenario_cenario', 'tipos_cenarios', 'wps'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl);
        
        EXECUTE format('DROP POLICY IF EXISTS "anon_read_%I" ON public.%I;', tbl, tbl);
        EXECUTE format('CREATE POLICY "anon_read_%I" ON public.%I FOR SELECT USING (true);', tbl, tbl);
        
        EXECUTE format('DROP POLICY IF EXISTS "auth_all_%I" ON public.%I;', tbl, tbl);
        EXECUTE format('CREATE POLICY "auth_all_%I" ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true);', tbl, tbl);
    END LOOP;
END $$;

-- 7.1 Base table/sequence/routine privileges for PostgREST roles.
-- RLS policies only decide row-level access; without these GRANTs the
-- request never even reaches policy evaluation (42501 permission denied
-- for table ...). Supabase Cloud sets this up automatically for tables
-- created via the Dashboard; tables created via CLI migrations under the
-- `postgres` role need it granted explicitly. ALTER DEFAULT PRIVILEGES
-- also covers tables created by later migrations in this same role.
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon, authenticated, service_role;

-- 8. Seed Reference Data
INSERT INTO public.grupo_acesso (id_ga, nome_grupo) VALUES
  (1, 'Administradores'),
  (2, 'Gestores'),
  (3, 'Técnicos'),
  (4, 'Pesquisadores')
ON CONFLICT (id_ga) DO NOTHING;

INSERT INTO public.fonte_agua (id_fonte, nome_fonte, sujeito_perdas) VALUES
  (1, 'Superficial', true),
  (2, 'Subterrânea', false),
  (3, 'Reúso', false),
  (4, 'Dessalinização', false)
ON CONFLICT (id_fonte) DO NOTHING;

INSERT INTO public.tipos_cenarios (id_tc, descricao, obs_tipo_cenario) VALUES
  (1, 'Cenários Climáticos', 'Cenários de mudanças climáticas'),
  (2, 'Cenários de Demanda', 'Projeções de crescimento populacional e demanda'),
  (3, 'Cenários de Oferta', 'Disponibilidade de recursos hídricos')
ON CONFLICT (id_tc) DO NOTHING;

-- 9. Seed Initial Users
-- Nota: `\getenv` e `:'var'` são meta-comandos exclusivos do psql e não são
-- interpretados pelo runner de migrations do Supabase CLI (que envia SQL puro).
-- Por isso usamos diretamente os valores padrão aqui.

-- 9.1 Ensure Grupo de Acesso 4 (Administradores APP) exists
INSERT INTO public.grupo_acesso (id_ga, nome_grupo)
VALUES (4, 'Administradores APP')
ON CONFLICT (id_ga) DO UPDATE SET nome_grupo = 'Administradores APP';

-- 9.2 Seed Dynamic Initial Admin User (from env vars or default admin@sacre.org)
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
  is_super_admin, role, aud
)
SELECT 
  'db2adf4a-01e6-40d7-9dc0-e1ed615cda6f'::uuid, 
  '00000000-0000-0000-0000-000000000000', 
  'admin@sacre.org',
  crypt('Abc@123#', gen_salt('bf', 10)),
  NOW(), NOW(), NOW(), 
  '{"provider": "email", "providers": ["email"]}'::jsonb, 
  '{"nome": "Administrador Geral"}'::jsonb,
  false, 'authenticated', 'authenticated'
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE email = 'admin@sacre.org'
);

INSERT INTO public.perfis_usuarios (id, email, nome, nivel_acesso, status, id_ga)
SELECT 
  id,
  email,
  'Administrador Geral',
  'Administrador',
  'aprovado',
  4
FROM auth.users
WHERE email = 'admin@sacre.org'
ON CONFLICT (id) DO UPDATE SET
  nome = EXCLUDED.nome,
  email = EXCLUDED.email,
  nivel_acesso = EXCLUDED.nivel_acesso,
  status = EXCLUDED.status,
  id_ga = EXCLUDED.id_ga;

-- 9.3 Seed warlen@librelon.com.br
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
  is_super_admin, role, aud
)
SELECT 
  '04c1db3e-3175-413f-8fc5-bee70e8208ac'::uuid, 
  '00000000-0000-0000-0000-000000000000', 
  'warlen@librelon.com.br', 
  crypt('Skip@Pass123', gen_salt('bf', 10)), 
  NOW(), NOW(), NOW(), 
  '{"provider": "email", "providers": ["email"]}'::jsonb, 
  '{"nome": "Warlen Librelon"}'::jsonb,
  false, 'authenticated', 'authenticated'
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE email = 'warlen@librelon.com.br'
);

INSERT INTO public.perfis_usuarios (id, email, nome, nivel_acesso, status, id_ga)
SELECT 
  id,
  email,
  'Warlen Librelon',
  'Administrador',
  'aprovado',
  4
FROM auth.users
WHERE email = 'warlen@librelon.com.br'
ON CONFLICT (id) DO UPDATE SET
  nome = EXCLUDED.nome,
  email = EXCLUDED.email,
  nivel_acesso = EXCLUDED.nivel_acesso,
  status = EXCLUDED.status,
  id_ga = EXCLUDED.id_ga;

-- 9.4 Seed warlenlibrelon@ipt.br
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
  is_super_admin, role, aud
)
SELECT 
  '6084482b-044e-41ec-a258-ff6d2d38d459'::uuid, 
  '00000000-0000-0000-0000-000000000000', 
  'warlenlibrelon@ipt.br', 
  crypt('Skip@Pass123', gen_salt('bf', 10)), 
  NOW(), NOW(), NOW(), 
  '{"provider": "email", "providers": ["email"]}'::jsonb, 
  '{"nome": "Warlen Librelon"}'::jsonb,
  false, 'authenticated', 'authenticated'
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE email = 'warlenlibrelon@ipt.br'
);

INSERT INTO public.perfis_usuarios (id, email, nome, nivel_acesso, status, id_ga)
SELECT 
  id,
  email,
  'Warlen Librelon',
  'Administrador',
  'aprovado',
  4
FROM auth.users
WHERE email = 'warlenlibrelon@ipt.br'
ON CONFLICT (id) DO UPDATE SET
  nome = EXCLUDED.nome,
  email = EXCLUDED.email,
  nivel_acesso = EXCLUDED.nivel_acesso,
  status = EXCLUDED.status,
  id_ga = EXCLUDED.id_ga;

-- 9.5 Ensure all necessary resources are assigned to Administradores APP (id_ga = 4)
-- so the UI menus show up properly for these users.
INSERT INTO public.recursos_app (nome_recurso, id_ga)
SELECT r.nome_recurso, 4
FROM (
  SELECT 'Acesso Restrito' as nome_recurso UNION ALL
  SELECT 'Institucional' UNION ALL
  SELECT 'Área de Estudo' UNION ALL
  SELECT 'Projetos' UNION ALL
  SELECT 'SSD' UNION ALL
  SELECT 'Divulgação'
) r
WHERE NOT EXISTS (
  SELECT 1 FROM public.recursos_app ra WHERE ra.id_ga = 4 AND ra.nome_recurso = r.nome_recurso
);
