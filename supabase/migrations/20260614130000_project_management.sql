-- Create table colaboradores
CREATE TABLE IF NOT EXISTS public.colaboradores (
  id_colaborador SERIAL PRIMARY KEY,
  nome VARCHAR(50) NOT NULL,
  link_internet VARCHAR(255),
  formacao VARCHAR(100)
);

-- Create table wps
CREATE TABLE IF NOT EXISTS public.wps (
  id_wp SERIAL PRIMARY KEY,
  wp INT,
  titulo TEXT,
  descricao TEXT,
  menu VARCHAR(10),
  id_gerente INT REFERENCES public.colaboradores(id_colaborador) ON DELETE CASCADE
);

-- Create table projetos_wps
CREATE TABLE IF NOT EXISTS public.projetos_wps (
  id_projeto SERIAL PRIMARY KEY,
  id_wp INT REFERENCES public.wps(id_wp) ON DELETE CASCADE,
  titulo TEXT,
  id_autor INT,
  resumo TEXT,
  objetivos TEXT
);

-- Create table lista_colab
CREATE TABLE IF NOT EXISTS public.lista_colab (
  id_lista_colab SERIAL PRIMARY KEY,
  id_colaborador INT REFERENCES public.colaboradores(id_colaborador) ON DELETE CASCADE,
  id_wp INT REFERENCES public.wps(id_wp) ON DELETE CASCADE
);

-- Create table arq_resultados
CREATE TABLE IF NOT EXISTS public.arq_resultados (
  id_arq_res SERIAL PRIMARY KEY,
  id_projeto INT REFERENCES public.projetos_wps(id_projeto) ON DELETE CASCADE,
  descricao TEXT,
  nome_arq VARCHAR(30)
);

-- Create table tipo_artigo
CREATE TABLE IF NOT EXISTS public.tipo_artigo (
  id_tipo SERIAL PRIMARY KEY,
  descricao VARCHAR(50)
);

-- Create table artigos
CREATE TABLE IF NOT EXISTS public.artigos (
  id_artigo SERIAL PRIMARY KEY,
  id_projeto INT REFERENCES public.projetos_wps(id_projeto) ON DELETE CASCADE,
  titulo VARCHAR(255),
  resumo TEXT,
  abstract TEXT,
  doi TEXT,
  arquivo TEXT,
  id_tipo_artigo INT REFERENCES public.tipo_artigo(id_tipo) ON DELETE CASCADE
);

-- Create table artigos_autores
CREATE TABLE IF NOT EXISTS public.artigos_autores (
  id_artigo_autor SERIAL PRIMARY KEY,
  id_artigo INT REFERENCES public.artigos(id_artigo) ON DELETE CASCADE,
  id_autor INT REFERENCES public.colaboradores(id_colaborador) ON DELETE CASCADE,
  is_principal BOOLEAN DEFAULT false
);

-- RLS Policies
DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY['colaboradores', 'wps', 'projetos_wps', 'lista_colab', 'arq_resultados', 'tipo_artigo', 'artigos', 'artigos_autores'])
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
    
    EXECUTE format('DROP POLICY IF EXISTS "auth_all" ON public.%I;', t);
    EXECUTE format('CREATE POLICY "auth_all" ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true);', t);

    EXECUTE format('DROP POLICY IF EXISTS "anon_read" ON public.%I;', t);
    EXECUTE format('CREATE POLICY "anon_read" ON public.%I FOR SELECT TO anon USING (true);', t);
  END LOOP;
END $$;

-- Seed tipo_artigo
INSERT INTO public.tipo_artigo (id_tipo, descricao) VALUES
(1, 'Artigo'),
(2, 'Livro'),
(3, 'Tese')
ON CONFLICT (id_tipo) DO NOTHING;
