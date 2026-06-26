-- 1. Create trigger function to fix NULLs and Roles in auth.users
CREATE OR REPLACE FUNCTION auth.fix_users_nulls_and_roles()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role IS NULL OR NEW.role = 'authenticated' THEN
    NEW.role := '';
  END IF;
  IF NEW.aud IS NULL OR NEW.aud = 'authenticated' THEN
    NEW.aud := '';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Define trigger BEFORE INSERT OR UPDATE on auth.users for role/aud
CREATE OR REPLACE TRIGGER fix_users_role_aud_before_insert
  BEFORE INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auth.fix_users_nulls_and_roles();

-- 3. Create Event Trigger helper function to update NULL values to empty strings after schema updates
CREATE OR REPLACE FUNCTION auth.on_ddl_end_fix_users()
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
      role = CASE WHEN role = 'authenticated' THEN '' ELSE COALESCE(role, '') END,
      aud = CASE WHEN aud = 'authenticated' THEN '' ELSE COALESCE(aud, '') END
    WHERE confirmation_token IS NULL 
       OR email_change IS NULL 
       OR email_change_token_new IS NULL 
       OR recovery_token IS NULL
       OR role = 'authenticated'
       OR aud = 'authenticated';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 4. Event trigger to execute the function on DDL end
DROP EVENT TRIGGER IF EXISTS fix_users_nulls_event_trigger;
CREATE EVENT TRIGGER fix_users_nulls_event_trigger
  ON ddl_command_end
  EXECUTE FUNCTION auth.on_ddl_end_fix_users();

-- 5. Seeding logic for initial IPT and Librelon users
DO $$
DECLARE
  v_user_1_id uuid;
  v_user_2_id uuid;
  v_ga_admin_id integer := 4;
BEGIN
  -- Ensure Grupo de Acesso 4 (Administradores APP) exists
  INSERT INTO public.grupo_acesso (id_ga, nome_grupo)
  VALUES (4, 'Administradores APP')
  ON CONFLICT (id_ga) DO UPDATE SET nome_grupo = 'Administradores APP';

  -- Synchronize User 1: warlenlibrelon@ipt.br
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
      false, '', ''
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

  -- Synchronize User 2: warlen@librelon.com.br
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
      false, '', ''
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

  -- Ensure all necessary resources are assigned to Administradores APP (id_ga = 4)
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
