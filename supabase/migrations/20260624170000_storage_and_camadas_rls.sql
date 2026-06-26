DO $$
BEGIN
  -- Buckets creation
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES 
    ('camadas-vetor', 'camadas-vetor', false, 52428800, ARRAY['application/zip', 'application/x-zip-compressed']),
    ('camadas-raster', 'camadas-raster', false, 209715200, ARRAY['image/tiff', 'image/x-tiff'])
  ON CONFLICT (id) DO UPDATE SET 
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

  -- Vetor policies
  DROP POLICY IF EXISTS "auth_select_vetor" ON storage.objects;
  CREATE POLICY "auth_select_vetor" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'camadas-vetor');

  DROP POLICY IF EXISTS "auth_insert_vetor" ON storage.objects;
  CREATE POLICY "auth_insert_vetor" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'camadas-vetor');

  DROP POLICY IF EXISTS "auth_update_vetor" ON storage.objects;
  CREATE POLICY "auth_update_vetor" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'camadas-vetor');

  DROP POLICY IF EXISTS "auth_delete_vetor" ON storage.objects;
  CREATE POLICY "auth_delete_vetor" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'camadas-vetor');

  -- Raster policies
  DROP POLICY IF EXISTS "auth_select_raster" ON storage.objects;
  CREATE POLICY "auth_select_raster" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'camadas-raster');

  DROP POLICY IF EXISTS "auth_insert_raster" ON storage.objects;
  CREATE POLICY "auth_insert_raster" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'camadas-raster');

  DROP POLICY IF EXISTS "auth_update_raster" ON storage.objects;
  CREATE POLICY "auth_update_raster" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'camadas-raster');

  DROP POLICY IF EXISTS "auth_delete_raster" ON storage.objects;
  CREATE POLICY "auth_delete_raster" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'camadas-raster');
END $$;

-- RLS for camadas_mapa
DROP POLICY IF EXISTS "auth_all_camadas" ON public.camadas_mapa;
CREATE POLICY "auth_all_camadas" ON public.camadas_mapa FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Fix cascade on feicoes_geoespaciais
ALTER TABLE public.feicoes_geoespaciais DROP CONSTRAINT IF EXISTS feicoes_geoespaciais_id_camada_fkey;
ALTER TABLE public.feicoes_geoespaciais ADD CONSTRAINT feicoes_geoespaciais_id_camada_fkey 
  FOREIGN KEY (id_camada) REFERENCES public.camadas_mapa(id_camada) ON DELETE CASCADE;

-- RLS for feicoes_geoespaciais
DROP POLICY IF EXISTS "auth_all_feicoes" ON public.feicoes_geoespaciais;
CREATE POLICY "auth_all_feicoes" ON public.feicoes_geoespaciais FOR ALL TO authenticated USING (true) WITH CHECK (true);
