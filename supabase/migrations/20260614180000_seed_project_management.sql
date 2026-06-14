DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Seed user
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
      crypt('Skip@Pass123!', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"nome": "Warlen Admin", "nivel_acesso": "admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );

    INSERT INTO public.perfis_usuarios (id, email, nome, id_ga, status)
    VALUES (new_user_id, 'warlen@librelon.com.br', 'Warlen Admin', 4, 'aprovado')
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- Seed Types
  INSERT INTO public.tipo_artigo (id_tipo, descricao) VALUES
  (1, 'Artigo'),
  (2, 'Livro'),
  (3, 'Tese'),
  (4, 'Dissertação'),
  (5, 'Relatório Técnico')
  ON CONFLICT (id_tipo) DO NOTHING;

  -- Seed WPs
  IF NOT EXISTS (SELECT 1 FROM public.wps LIMIT 1) THEN
    INSERT INTO public.wps (wp, titulo, descricao, menu) VALUES
    (1, 'Coordenação e Gestão do Projeto', 'Gerenciamento geral e administrativo', 'WP1'),
    (2, 'Estudos Preliminares', 'Levantamento de dados e estudos de base', 'WP2');
  END IF;
  
  -- Seed Colaboradores
  IF NOT EXISTS (SELECT 1 FROM public.colaboradores LIMIT 1) THEN
    INSERT INTO public.colaboradores (nome, formacao, link_internet) VALUES
    ('Warlen', 'Doutor em Ciências da Computação', 'https://github.com/warlen'),
    ('João Silva', 'Engenheiro Ambiental', 'https://linkedin.com/in/joaosilva');
  END IF;
END $$;
