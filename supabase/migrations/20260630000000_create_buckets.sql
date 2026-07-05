-- ============================================================
-- Criação de buckets de Storage + políticas RLS
-- Todos os buckets são privados (public = false)
-- ============================================================

-- ── 1. Criação dos buckets ─────────────────────────────────
INSERT INTO storage.buckets (id, name, public) VALUES
  ('dados_brutos', 'dados_brutos', false),
  ('atividades_sociais',   'atividades_sociais',   false),
  ('camadas_raster',       'camadas_raster',       false),
  ('camadas_vetor',        'camadas_vetor',        false),
  ('arquivos_resultados',  'arquivos_resultados',  false),
  ('parceiros',            'parceiros',            false),
  ('fotos_colaboradores',  'fotos_colaboradores',  false),
  ('imagens',              'imagens',              false),
  ('artigos_referencia',   'artigos_referencia',   false),
  ('artigos_sacre',        'artigos_sacre',        false),
  ('documentos',           'documentos',           false),
  ('imagens_app',          'imagens_app',          false)
ON CONFLICT (id) DO NOTHING;


-- ── 2. Garante RLS habilitado na tabela de objetos ─────────
-- No Supabase o RLS já vem habilitado em storage.objects por padrão.
-- O bloco abaixo só tenta habilitar se necessário e ignora falta de
-- permissão (o role postgres não é owner da tabela na stack self-hosted).

DO $$
BEGIN
  IF NOT (SELECT relrowsecurity FROM pg_class
          WHERE oid = 'storage.objects'::regclass) THEN
    ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
  END IF;
EXCEPTION WHEN insufficient_privilege THEN
  RAISE NOTICE 'Sem permissão para ALTER TABLE storage.objects — RLS deve ser habilitado como supabase_admin, se ainda não estiver.';
END $$;

-- ── 3. Políticas RLS — leitura (SELECT) ────────────────────
CREATE POLICY "dados_brutos: leitura"
ON storage.objects FOR SELECT
USING (bucket_id = 'dados_brutos');

CREATE POLICY "atividades_sociais: leitura"
ON storage.objects FOR SELECT
USING (bucket_id = 'atividades_sociais');

CREATE POLICY "camadas_raster: leitura"
ON storage.objects FOR SELECT
USING (bucket_id = 'camadas_raster');

CREATE POLICY "camadas_vetor: leitura"
ON storage.objects FOR SELECT
USING (bucket_id = 'camadas_vetor');

CREATE POLICY "arquivos_resultados: leitura"
ON storage.objects FOR SELECT
USING (bucket_id = 'arquivos_resultados');

CREATE POLICY "parceiros: leitura"
ON storage.objects FOR SELECT
USING (bucket_id = 'parceiros');

CREATE POLICY "fotos_colaboradores: leitura"
ON storage.objects FOR SELECT
USING (bucket_id = 'fotos_colaboradores');

CREATE POLICY "imagens: leitura"
ON storage.objects FOR SELECT
USING (bucket_id = 'imagens');

CREATE POLICY "artigos_referencia: leitura"
ON storage.objects FOR SELECT
USING (bucket_id = 'artigos_referencia');

CREATE POLICY "artigos_sacre: leitura"
ON storage.objects FOR SELECT
USING (bucket_id = 'artigos_sacre');

CREATE POLICY "documentos: leitura"
ON storage.objects FOR SELECT
USING (bucket_id = 'documentos');

CREATE POLICY "imagens_app: leitura"
ON storage.objects FOR SELECT
USING (bucket_id = 'imagens_app');

-- ── 4. Políticas RLS — upload (INSERT) ─────────────────────
CREATE POLICY "dados_brutos: upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'dados_brutos');

CREATE POLICY "atividades_sociais: upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'atividades_sociais');

CREATE POLICY "camadas_raster: upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'camadas_raster');

CREATE POLICY "camadas_vetor: upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'camadas_vetor');

CREATE POLICY "arquivos_resultados: upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'arquivos_resultados');

CREATE POLICY "parceiros: upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'parceiros');

CREATE POLICY "fotos_colaboradores: upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'fotos_colaboradores');

CREATE POLICY "imagens: upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'imagens');

CREATE POLICY "artigos_referencia: upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'artigos_referencia');

CREATE POLICY "artigos_sacre: upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'artigos_sacre');

CREATE POLICY "documentos: upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'documentos');

CREATE POLICY "imagens_app: upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'imagens_app');

-- ── 5. Políticas RLS — atualização (UPDATE) ────────────────
CREATE POLICY "dados_brutos: atualizacao"
ON storage.objects FOR UPDATE
USING (bucket_id = 'dados_brutos');

CREATE POLICY "atividades_sociais: atualizacao"
ON storage.objects FOR UPDATE
USING (bucket_id = 'atividades_sociais');

CREATE POLICY "camadas_raster: atualizacao"
ON storage.objects FOR UPDATE
USING (bucket_id = 'camadas_raster');

CREATE POLICY "camadas_vetor: atualizacao"
ON storage.objects FOR UPDATE
USING (bucket_id = 'camadas_vetor');

CREATE POLICY "arquivos_resultados: atualizacao"
ON storage.objects FOR UPDATE
USING (bucket_id = 'arquivos_resultados');

CREATE POLICY "parceiros: atualizacao"
ON storage.objects FOR UPDATE
USING (bucket_id = 'parceiros');

CREATE POLICY "fotos_colaboradores: atualizacao"
ON storage.objects FOR UPDATE
USING (bucket_id = 'fotos_colaboradores');

CREATE POLICY "imagens: atualizacao"
ON storage.objects FOR UPDATE
USING (bucket_id = 'imagens');

CREATE POLICY "artigos_referencia: atualizacao"
ON storage.objects FOR UPDATE
USING (bucket_id = 'artigos_referencia');

CREATE POLICY "artigos_sacre: atualizacao"
ON storage.objects FOR UPDATE
USING (bucket_id = 'artigos_sacre');

CREATE POLICY "documentos: atualizacao"
ON storage.objects FOR UPDATE
USING (bucket_id = 'documentos');

CREATE POLICY "imagens_app: atualizacao"
ON storage.objects FOR UPDATE
USING (bucket_id = 'imagens_app');

-- ── 6. Políticas RLS — exclusão (DELETE) ───────────────────
CREATE POLICY "dados_brutos: exclusao"
ON storage.objects FOR DELETE
USING (bucket_id = 'dados_brutos');

CREATE POLICY "atividades_sociais: exclusao"
ON storage.objects FOR DELETE
USING (bucket_id = 'atividades_sociais');

CREATE POLICY "camadas_raster: exclusao"
ON storage.objects FOR DELETE
USING (bucket_id = 'camadas_raster');

CREATE POLICY "camadas_vetor: exclusao"
ON storage.objects FOR DELETE
USING (bucket_id = 'camadas_vetor');

CREATE POLICY "arquivos_resultados: exclusao"
ON storage.objects FOR DELETE
USING (bucket_id = 'arquivos_resultados');

CREATE POLICY "parceiros: exclusao"
ON storage.objects FOR DELETE
USING (bucket_id = 'parceiros');

CREATE POLICY "fotos_colaboradores: exclusao"
ON storage.objects FOR DELETE
USING (bucket_id = 'fotos_colaboradores');

CREATE POLICY "imagens: exclusao"
ON storage.objects FOR DELETE
USING (bucket_id = 'imagens');

CREATE POLICY "artigos_referencia: exclusao"
ON storage.objects FOR DELETE
USING (bucket_id = 'artigos_referencia');

CREATE POLICY "artigos_sacre: exclusao"
ON storage.objects FOR DELETE
USING (bucket_id = 'artigos_sacre');

CREATE POLICY "documentos: exclusao"
ON storage.objects FOR DELETE
USING (bucket_id = 'documentos');

CREATE POLICY "imagens_app: exclusao"
ON storage.objects FOR DELETE
USING (bucket_id = 'imagens_app');

-- ============================================================
-- Verificação (opcional — rode separadamente para conferir)
-- ============================================================
-- SELECT id, name, public FROM storage.buckets ORDER BY id;
-- SELECT policyname, tablename FROM pg_policies WHERE tablename = 'objects' ORDER BY policyname;
