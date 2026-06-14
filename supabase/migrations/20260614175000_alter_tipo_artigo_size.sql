DO $$
BEGIN
  ALTER TABLE public.tipo_artigo ALTER COLUMN descricao TYPE VARCHAR(100);
END $$;
