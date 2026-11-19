-- ============================================================
-- Ajustes 19/11/2026
-- 1. lista_colab: ressincroniza a sequência do id. Os dados foram
--    carregados com ids explícitos e o contador ficou para trás,
--    gerando "duplicate key value violates unique constraint
--    lista_colab_pkey" ao adicionar colaborador a um WP.
--    (Não existe restrição impedindo o colaborador em vários WPs.)
-- 2. resultado_tabela: data_upload e data_resultado.
-- 3. perfis_usuarios: grupo solicitado no cadastro + organização
--    gravados pelo trigger; função para excluir usuário.
-- ============================================================

-- ── 1. Sequência de lista_colab ──
SELECT setval(
  pg_get_serial_sequence('public.lista_colab', 'id_lista_colab'),
  COALESCE((SELECT MAX(id_lista_colab) FROM public.lista_colab), 0) + 1,
  false
);

-- ── 2. Datas das tabelas de resultado ──
-- Tabelas já existentes recebem a data de upload a partir de criado_em.
ALTER TABLE public.resultado_tabela ADD COLUMN IF NOT EXISTS data_upload DATE;
ALTER TABLE public.resultado_tabela ADD COLUMN IF NOT EXISTS data_resultado DATE;
UPDATE public.resultado_tabela
   SET data_upload = (criado_em AT TIME ZONE 'America/Sao_Paulo')::date
 WHERE data_upload IS NULL AND criado_em IS NOT NULL;
ALTER TABLE public.resultado_tabela ALTER COLUMN data_upload SET DEFAULT CURRENT_DATE;

-- ── 3. Usuários ──
ALTER TABLE public.perfis_usuarios ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.perfis_usuarios
  ADD COLUMN IF NOT EXISTS id_ga_solicitado INTEGER REFERENCES public.grupo_acesso(id_ga) ON DELETE SET NULL;

-- Trigger de cadastro passa a gravar organização e grupo solicitado.
-- O grupo efetivo (id_ga) continua sendo definido só na aprovação.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_ga INTEGER;
BEGIN
  BEGIN
    v_ga := NULLIF(NEW.raw_user_meta_data->>'id_ga_solicitado', '')::INTEGER;
  EXCEPTION WHEN others THEN
    v_ga := NULL;
  END;
  IF v_ga IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.grupo_acesso WHERE id_ga = v_ga) THEN
    v_ga := NULL;
  END IF;

  INSERT INTO public.perfis_usuarios (id, email, nome, organizacao, id_ga_solicitado)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'nome', ''),
    NULLIF(NEW.raw_user_meta_data->>'organizacao', ''),
    v_ga
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Exclusão de usuário (remove o login em auth.users; o perfil sai em cascata).
-- Só quem está aprovado e tem acesso ao "Acesso Restrito" (ou é admin) pode usar.
CREATE OR REPLACE FUNCTION public.excluir_usuario(p_id uuid)
RETURNS void AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Não autenticado';
  END IF;
  IF p_id = auth.uid() THEN
    RAISE EXCEPTION 'Você não pode excluir o próprio usuário';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.perfis_usuarios p
     WHERE p.id = auth.uid()
       AND p.status = 'aprovado'
       AND (p.nivel_acesso = 'admin'
            OR EXISTS (SELECT 1 FROM public.recursos_app r
                        WHERE r.id_ga = p.id_ga AND r.nome_recurso = 'Acesso Restrito'))
  ) THEN
    RAISE EXCEPTION 'Sem permissão para excluir usuários';
  END IF;

  DELETE FROM auth.users WHERE id = p_id;
  DELETE FROM public.perfis_usuarios WHERE id = p_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

REVOKE ALL ON FUNCTION public.excluir_usuario(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.excluir_usuario(uuid) TO authenticated;
