DO $$
DECLARE
  v_user_1_id uuid;
  v_user_2_id uuid;
  v_ga_admin_id integer := 4;
BEGIN
  -- 1. Ensure Grupo de Acesso 4 (Administradores APP) exists
  INSERT INTO public.grupo_acesso (id_ga, nome_grupo)
  VALUES (4, 'Administradores APP')
  ON CONFLICT (id_ga) DO UPDATE SET nome_grupo = 'Administradores APP';

  -- 2. Synchronize User 1: warlenlibrelon@ipt.br
  SELECT id INTO v_user_1_id FROM auth.users WHERE email = 'warlenlibrelon@ipt.br';
  
  IF v_user_1_id IS NULL THEN
    v_user_1_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud
    ) VALUES (
      v_user_1_id, '00000000-0000-0000-0000-000000000000', 'warlenlibrelon@ipt.br', crypt('Skip@Pass123', gen_salt('bf', 10)), NOW(),
      NOW(), NOW(), '{"provider": "email", "providers": ["email"]}', '{"nome": "Warlen Librelon"}',
      false, 'authenticated', 'authenticated'
    );

  END IF;

  INSERT INTO public.perfis_usuarios (id, nome, email, organizacao, nivel_acesso, id_ga, status)
  VALUES (
    v_user_1_id,
    'Warlen Librelon',
    'warlenlibrelon@ipt.br',
    'IPT',
    'Administrador',
    v_ga_admin_id,
    'aprovado'
  )
  ON CONFLICT (id) DO UPDATE SET
    id_ga = EXCLUDED.id_ga,
    status = EXCLUDED.status,
    nivel_acesso = EXCLUDED.nivel_acesso,
    nome = COALESCE(NULLIF(public.perfis_usuarios.nome, ''), EXCLUDED.nome),
    organizacao = COALESCE(NULLIF(public.perfis_usuarios.organizacao, ''), EXCLUDED.organizacao);

  -- 3. Synchronize User 2: warlen@librelon.com.br
  SELECT id INTO v_user_2_id FROM auth.users WHERE email = 'warlen@librelon.com.br';
  
  IF v_user_2_id IS NULL THEN
    v_user_2_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud
    ) VALUES (
      v_user_2_id, '00000000-0000-0000-0000-000000000000', 'warlen@librelon.com.br', crypt('Skip@Pass123', gen_salt('bf', 10)), NOW(),
      NOW(), NOW(), '{"provider": "email", "providers": ["email"]}', '{"nome": "Warlen Librelon"}',
      false, 'authenticated', 'authenticated'
    );
  END IF;

  INSERT INTO public.perfis_usuarios (id, nome, email, organizacao, nivel_acesso, id_ga, status)
  VALUES (
    v_user_2_id,
    'Warlen Librelon',
    'warlen@librelon.com.br',
    'Librelon',
    'Administrador',
    v_ga_admin_id,
    'aprovado'
  )
  ON CONFLICT (id) DO UPDATE SET
    id_ga = EXCLUDED.id_ga,
    status = EXCLUDED.status,
    nivel_acesso = EXCLUDED.nivel_acesso,
    nome = COALESCE(NULLIF(public.perfis_usuarios.nome, ''), EXCLUDED.nome),
    organizacao = COALESCE(NULLIF(public.perfis_usuarios.organizacao, ''), EXCLUDED.organizacao);

  -- 4. Ensure all necessary resources are assigned to Administradores APP (id_ga = 4)
  -- so the UI menus show up properly for these users.
  IF NOT EXISTS (SELECT 1 FROM public.recursos_app WHERE id_ga = 4 AND nome_recurso = 'Acesso Restrito') THEN
    INSERT INTO public.recursos_app (nome_recurso, id_ga) VALUES ('Acesso Restrito', 4);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.recursos_app WHERE id_ga = 4 AND nome_recurso = 'Institucional') THEN
    INSERT INTO public.recursos_app (nome_recurso, id_ga) VALUES ('Institucional', 4);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.recursos_app WHERE id_ga = 4 AND nome_recurso = 'Área de Estudo') THEN
    INSERT INTO public.recursos_app (nome_recurso, id_ga) VALUES ('Área de Estudo', 4);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.recursos_app WHERE id_ga = 4 AND nome_recurso = 'Projetos') THEN
    INSERT INTO public.recursos_app (nome_recurso, id_ga) VALUES ('Projetos', 4);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.recursos_app WHERE id_ga = 4 AND nome_recurso = 'SSD') THEN
    INSERT INTO public.recursos_app (nome_recurso, id_ga) VALUES ('SSD', 4);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.recursos_app WHERE id_ga = 4 AND nome_recurso = 'Divulgação') THEN
    INSERT INTO public.recursos_app (nome_recurso, id_ga) VALUES ('Divulgação', 4);
  END IF;
  
END $$;
