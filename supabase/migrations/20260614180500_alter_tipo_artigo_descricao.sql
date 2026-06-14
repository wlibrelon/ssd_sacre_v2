-- Drop policies depending on the column
DROP POLICY IF EXISTS "anon_read" ON public.tipo_artigo;
DROP POLICY IF EXISTS "auth_all" ON public.tipo_artigo;

-- Alter column to TEXT to allow longer descriptions
ALTER TABLE public.tipo_artigo ALTER COLUMN descricao TYPE TEXT;

-- Recreate policies
CREATE POLICY "anon_read" ON public.tipo_artigo
  FOR SELECT TO anon USING (true);

CREATE POLICY "auth_all" ON public.tipo_artigo
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Ensure sequence is synchronized before inserts
SELECT setval('public.tipo_artigo_id_tipo_seq', COALESCE((SELECT MAX(id_tipo) FROM public.tipo_artigo), 1));

-- Ensure base categories exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.tipo_artigo WHERE descricao = 'Relatório Técnico') THEN
    INSERT INTO public.tipo_artigo (descricao) VALUES ('Relatório Técnico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.tipo_artigo WHERE descricao = 'Artigo Científico') THEN
    INSERT INTO public.tipo_artigo (descricao) VALUES ('Artigo Científico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.tipo_artigo WHERE descricao = 'Apresentação') THEN
    INSERT INTO public.tipo_artigo (descricao) VALUES ('Apresentação');
  END IF;
END $$;
