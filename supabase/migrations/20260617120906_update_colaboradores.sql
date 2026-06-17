DO $$
BEGIN
  -- Create table grupo_colaboradores
  CREATE TABLE IF NOT EXISTS public.grupo_colaboradores (
    id_grupo SERIAL PRIMARY KEY,
    descricao VARCHAR(50) NOT NULL
  );

  -- Add columns to colaboradores
  ALTER TABLE public.colaboradores 
  ADD COLUMN IF NOT EXISTS foto TEXT,
  ADD COLUMN IF NOT EXISTS status VARCHAR(7) DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Inativo')),
  ADD COLUMN IF NOT EXISTS id_grupo INT;

  -- Add FK separately in case it needs to be dropped/recreated
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_colaboradores_grupo'
  ) THEN
    ALTER TABLE public.colaboradores
    ADD CONSTRAINT fk_colaboradores_grupo FOREIGN KEY (id_grupo) REFERENCES public.grupo_colaboradores(id_grupo) ON DELETE SET NULL;
  END IF;

  -- Seed data for grupo_colaboradores
  INSERT INTO public.grupo_colaboradores (id_grupo, descricao) VALUES
  (1, 'Pesquisadores Principais'),
  (2, 'Pesquisadores Associados'),
  (3, 'Alunos e Bolsistas')
  ON CONFLICT (id_grupo) DO NOTHING;

END $$;

-- RLS Policies
ALTER TABLE public.grupo_colaboradores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_all" ON public.grupo_colaboradores;
CREATE POLICY "auth_all" ON public.grupo_colaboradores FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_read" ON public.grupo_colaboradores;
CREATE POLICY "anon_read" ON public.grupo_colaboradores FOR SELECT TO anon USING (true);

-- Storage buckets setup
INSERT INTO storage.buckets (id, name, public) 
VALUES ('fotos_colaboradores', 'fotos_colaboradores', true) 
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('parceiros', 'parceiros', true) 
ON CONFLICT (id) DO NOTHING;

-- Storage policies for fotos_colaboradores
DROP POLICY IF EXISTS "public_read_fotos" ON storage.objects;
CREATE POLICY "public_read_fotos" ON storage.objects FOR SELECT USING (bucket_id = 'fotos_colaboradores');

DROP POLICY IF EXISTS "auth_all_fotos" ON storage.objects;
CREATE POLICY "auth_all_fotos" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'fotos_colaboradores') WITH CHECK (bucket_id = 'fotos_colaboradores');

-- Storage policies for parceiros
DROP POLICY IF EXISTS "public_read_parceiros" ON storage.objects;
CREATE POLICY "public_read_parceiros" ON storage.objects FOR SELECT USING (bucket_id = 'parceiros');

DROP POLICY IF EXISTS "auth_all_parceiros" ON storage.objects;
CREATE POLICY "auth_all_parceiros" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'parceiros') WITH CHECK (bucket_id = 'parceiros');
