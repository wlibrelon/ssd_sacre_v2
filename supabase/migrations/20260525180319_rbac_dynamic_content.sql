-- 1. Create tables
CREATE TABLE IF NOT EXISTS public.grupo_acesso (
    id_ga SERIAL PRIMARY KEY,
    nome_grupo VARCHAR(30) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.recursos_app (
    id_rapp SERIAL PRIMARY KEY,
    nome_recurso VARCHAR(40) NOT NULL,
    id_ga INTEGER REFERENCES public.grupo_acesso(id_ga) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.perfis_usuarios (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    email TEXT NOT NULL,
    organizacao TEXT,
    nivel_acesso TEXT,
    objetivo_acesso TEXT,
    id_ga INTEGER REFERENCES public.grupo_acesso(id_ga),
    status TEXT DEFAULT 'pendente',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.conteudo_estudo (
    id SERIAL PRIMARY KEY,
    secao TEXT NOT NULL,
    conteudo_html TEXT,
    ordem INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.documentos_publicos (
    id SERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    descricao TEXT,
    url_arquivo TEXT,
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Insert Groups
INSERT INTO public.grupo_acesso (id_ga, nome_grupo) VALUES 
(1, 'Geral'),
(2, 'Pesquisadores'),
(3, 'Gestores públicos'),
(4, 'Administradores APP')
ON CONFLICT (id_ga) DO NOTHING;

-- Insert Resource mappings
INSERT INTO public.recursos_app (id_rapp, nome_recurso, id_ga) VALUES
(1, 'Projetos', 2),
(2, 'Projetos', 4),
(3, 'SSD', 3),
(4, 'SSD', 4),
(5, 'Acesso Restrito', 4),
(6, 'Institucional', 1),
(7, 'Institucional', 2),
(8, 'Institucional', 3),
(9, 'Institucional', 4),
(10, 'Área de Estudo', 1),
(11, 'Área de Estudo', 2),
(12, 'Área de Estudo', 3),
(13, 'Área de Estudo', 4),
(14, 'Divulgação', 1),
(15, 'Divulgação', 2),
(16, 'Divulgação', 3),
(17, 'Divulgação', 4)
ON CONFLICT (id_rapp) DO NOTHING;

-- Trigger for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.perfis_usuarios (id, nome, email, organizacao, nivel_acesso, objetivo_acesso, status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', ''),
    NEW.email,
    NEW.raw_user_meta_data->>'organizacao',
    NEW.raw_user_meta_data->>'nivel_acesso',
    NEW.raw_user_meta_data->>'objetivo_acesso',
    'pendente'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Seed admin user (warlen@librelon.com.br)
DO $$
DECLARE
  admin_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'warlen@librelon.com.br') THEN
    admin_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current, phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      admin_id, '00000000-0000-0000-0000-000000000000', 'warlen@librelon.com.br', crypt('Skip@Pass123', gen_salt('bf')), NOW(),
      NOW(), NOW(), '{"provider": "email", "providers": ["email"]}', '{"nome": "Warlen Librelon"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
    
    UPDATE public.perfis_usuarios SET status = 'aprovado', id_ga = 4 WHERE id = admin_id;
  END IF;
END $$;

-- Content Seeds
INSERT INTO public.conteudo_estudo (secao, conteudo_html) VALUES 
('contexto', '<p>Conteúdo padrão do contexto.</p>'),
('objetivos', '<p>Conteúdo padrão dos objetivos.</p>')
ON CONFLICT DO NOTHING;

-- Storage Bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('documentos', 'documentos', true) ON CONFLICT (id) DO NOTHING;

-- Storage Policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'documentos');

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
DECLARE
  v_id_ga integer;
BEGIN
  SELECT id_ga INTO v_id_ga FROM public.perfis_usuarios WHERE id = auth.uid();
  RETURN (v_id_ga = 4);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP POLICY IF EXISTS "Admin Insert" ON storage.objects;
CREATE POLICY "Admin Insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'documentos' AND public.is_admin());
DROP POLICY IF EXISTS "Admin Update" ON storage.objects;
CREATE POLICY "Admin Update" ON storage.objects FOR UPDATE USING (bucket_id = 'documentos' AND public.is_admin());
DROP POLICY IF EXISTS "Admin Delete" ON storage.objects;
CREATE POLICY "Admin Delete" ON storage.objects FOR DELETE USING (bucket_id = 'documentos' AND public.is_admin());

-- Enable RLS
ALTER TABLE public.grupo_acesso ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recursos_app ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfis_usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conteudo_estudo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentos_publicos ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "ga_select" ON public.grupo_acesso;
CREATE POLICY "ga_select" ON public.grupo_acesso FOR SELECT USING (true);
DROP POLICY IF EXISTS "ga_admin" ON public.grupo_acesso;
CREATE POLICY "ga_admin" ON public.grupo_acesso FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "rapp_select" ON public.recursos_app;
CREATE POLICY "rapp_select" ON public.recursos_app FOR SELECT USING (true);
DROP POLICY IF EXISTS "rapp_admin" ON public.recursos_app;
CREATE POLICY "rapp_admin" ON public.recursos_app FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "pu_select" ON public.perfis_usuarios;
CREATE POLICY "pu_select" ON public.perfis_usuarios FOR SELECT USING (auth.uid() = id OR public.is_admin());
DROP POLICY IF EXISTS "pu_admin" ON public.perfis_usuarios;
CREATE POLICY "pu_admin" ON public.perfis_usuarios FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "ce_select" ON public.conteudo_estudo;
CREATE POLICY "ce_select" ON public.conteudo_estudo FOR SELECT USING (true);
DROP POLICY IF EXISTS "ce_admin" ON public.conteudo_estudo;
CREATE POLICY "ce_admin" ON public.conteudo_estudo FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "dp_select" ON public.documentos_publicos;
CREATE POLICY "dp_select" ON public.documentos_publicos FOR SELECT USING (true);
DROP POLICY IF EXISTS "dp_admin" ON public.documentos_publicos;
CREATE POLICY "dp_admin" ON public.documentos_publicos FOR ALL USING (public.is_admin());
