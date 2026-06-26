-- Read environment variables from docker-compose/system env
\getenv admin_email INITIAL_ADMIN_EMAIL
\getenv admin_password INITIAL_ADMIN_PASSWORD

-- 1. Ensure Grupo de Acesso 4 (Administradores APP) exists
INSERT INTO public.grupo_acesso (id_ga, nome_grupo)
VALUES (4, 'Administradores APP')
ON CONFLICT (id_ga) DO UPDATE SET nome_grupo = 'Administradores APP';

-- 2. Insert user into auth.users if not exists
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
  is_super_admin, role, aud
)
SELECT 
  gen_random_uuid(), 
  '00000000-0000-0000-0000-000000000000', 
  COALESCE(NULLIF(:'admin_email', ''), 'admin@sacre.org'), 
  crypt(COALESCE(NULLIF(:'admin_password', ''), 'Abc@123#'), gen_salt('bf', 10)), 
  NOW(),
  NOW(), 
  NOW(), 
  '{"provider": "email", "providers": ["email"]}'::jsonb, 
  '{"nome": "Administrador Geral"}'::jsonb,
  false, 
  '', 
  ''
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE email = COALESCE(NULLIF(:'admin_email', ''), 'admin@sacre.org')
);

-- 3. Ensure profile exists in public.perfis_usuarios and is linked to Administradores APP (id_ga = 4)
INSERT INTO public.perfis_usuarios (id, nome, email, organizacao, nivel_acesso, id_ga, status)
SELECT 
  id,
  'Administrador Geral',
  email,
  'Sacre',
  'Administrador',
  4,
  'aprovado'
FROM auth.users
WHERE email = COALESCE(NULLIF(:'admin_email', ''), 'admin@sacre.org')
ON CONFLICT (id) DO UPDATE SET
  id_ga = EXCLUDED.id_ga,
  status = EXCLUDED.status,
  nivel_acesso = EXCLUDED.nivel_acesso,
  nome = COALESCE(NULLIF(public.perfis_usuarios.nome, ''), EXCLUDED.nome);
