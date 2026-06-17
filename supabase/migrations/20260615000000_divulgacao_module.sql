DO $$
BEGIN
  -- 1. Add revista column to artigos
  ALTER TABLE public.artigos ADD COLUMN IF NOT EXISTS revista VARCHAR(255);

  -- 2. Create midia table
  CREATE TABLE IF NOT EXISTS public.midia (
    id_midia SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    tipo VARCHAR(10) CHECK (tipo IN ('Reportagem', 'Vídeo')),
    descricao TEXT,
    arq_imagem VARCHAR(100),
    arq_video VARCHAR(100),
    link TEXT
  );

  -- 3. Create congressos table
  CREATE TABLE IF NOT EXISTS public.congressos (
    id_congresso SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    organizador VARCHAR(100),
    data DATE,
    periodo VARCHAR(100),
    local VARCHAR(255),
    link VARCHAR(255),
    status VARCHAR(9) CHECK (status IN ('Próximo', 'Realizado'))
  );

  -- 4. Enable RLS on midia
  ALTER TABLE public.midia ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "anon_read_midia" ON public.midia;
  CREATE POLICY "anon_read_midia" ON public.midia FOR SELECT TO anon USING (true);
  DROP POLICY IF EXISTS "public_read_midia" ON public.midia;
  CREATE POLICY "public_read_midia" ON public.midia FOR SELECT TO public USING (true);
  DROP POLICY IF EXISTS "auth_all_midia" ON public.midia;
  CREATE POLICY "auth_all_midia" ON public.midia FOR ALL TO authenticated USING (true) WITH CHECK (true);

  -- 5. Enable RLS on congressos
  ALTER TABLE public.congressos ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "anon_read_congressos" ON public.congressos;
  CREATE POLICY "anon_read_congressos" ON public.congressos FOR SELECT TO anon USING (true);
  DROP POLICY IF EXISTS "public_read_congressos" ON public.congressos;
  CREATE POLICY "public_read_congressos" ON public.congressos FOR SELECT TO public USING (true);
  DROP POLICY IF EXISTS "auth_all_congressos" ON public.congressos;
  CREATE POLICY "auth_all_congressos" ON public.congressos FOR ALL TO authenticated USING (true) WITH CHECK (true);

  -- 6. Setup Storage Bucket "imagens"
  INSERT INTO storage.buckets (id, name, public) 
  VALUES ('imagens', 'imagens', true) 
  ON CONFLICT (id) DO NOTHING;

  -- 7. Storage Policies for "imagens"
  DROP POLICY IF EXISTS "public_read_imagens" ON storage.objects;
  CREATE POLICY "public_read_imagens" ON storage.objects FOR SELECT TO public USING (bucket_id = 'imagens');
  
  DROP POLICY IF EXISTS "anon_read_imagens" ON storage.objects;
  CREATE POLICY "anon_read_imagens" ON storage.objects FOR SELECT TO anon USING (bucket_id = 'imagens');

  DROP POLICY IF EXISTS "auth_insert_imagens" ON storage.objects;
  CREATE POLICY "auth_insert_imagens" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'imagens');

  DROP POLICY IF EXISTS "auth_update_imagens" ON storage.objects;
  CREATE POLICY "auth_update_imagens" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'imagens') WITH CHECK (bucket_id = 'imagens');

  DROP POLICY IF EXISTS "auth_delete_imagens" ON storage.objects;
  CREATE POLICY "auth_delete_imagens" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'imagens');

END $$;
