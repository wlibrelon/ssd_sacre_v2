DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- 1. Create table atividades_sociais
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

  -- 2. Storage Bucket
  INSERT INTO storage.buckets (id, name, public) 
  VALUES ('atividades_sociais', 'atividades_sociais', true) 
  ON CONFLICT (id) DO NOTHING;

  -- 3. Storage Policies
  DROP POLICY IF EXISTS "public_read_atividades_sociais" ON storage.objects;
  CREATE POLICY "public_read_atividades_sociais" ON storage.objects FOR SELECT TO public USING (bucket_id = 'atividades_sociais');
  
  DROP POLICY IF EXISTS "anon_read_atividades_sociais" ON storage.objects;
  CREATE POLICY "anon_read_atividades_sociais" ON storage.objects FOR SELECT TO anon USING (bucket_id = 'atividades_sociais');

  DROP POLICY IF EXISTS "auth_insert_atividades_sociais" ON storage.objects;
  CREATE POLICY "auth_insert_atividades_sociais" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'atividades_sociais');

  DROP POLICY IF EXISTS "auth_update_atividades_sociais" ON storage.objects;
  CREATE POLICY "auth_update_atividades_sociais" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'atividades_sociais') WITH CHECK (bucket_id = 'atividades_sociais');

  DROP POLICY IF EXISTS "auth_delete_atividades_sociais" ON storage.objects;
  CREATE POLICY "auth_delete_atividades_sociais" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'atividades_sociais');

  -- 4. Table RLS Policies
  ALTER TABLE public.atividades_sociais ENABLE ROW LEVEL SECURITY;
  
  DROP POLICY IF EXISTS "anon_read_atividades_sociais_tbl" ON public.atividades_sociais;
  CREATE POLICY "anon_read_atividades_sociais_tbl" ON public.atividades_sociais FOR SELECT TO anon USING (ativar = true);
  
  DROP POLICY IF EXISTS "public_read_atividades_sociais_tbl" ON public.atividades_sociais;
  CREATE POLICY "public_read_atividades_sociais_tbl" ON public.atividades_sociais FOR SELECT TO public USING (ativar = true);
  
  DROP POLICY IF EXISTS "auth_all_atividades_sociais_tbl" ON public.atividades_sociais;
  CREATE POLICY "auth_all_atividades_sociais_tbl" ON public.atividades_sociais FOR ALL TO authenticated USING (true) WITH CHECK (true);

  -- 5. Seed user
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'warlen@librelon.com.br') THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'warlen@librelon.com.br',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Warlen Librelon"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL,
      '', '', ''
    );

    INSERT INTO public.perfis_usuarios (id, email, nome, status, id_ga)
    VALUES (new_user_id, 'warlen@librelon.com.br', 'Warlen Librelon', 'aprovado', 4)
    ON CONFLICT (id) DO NOTHING;
  END IF;

END $$;
