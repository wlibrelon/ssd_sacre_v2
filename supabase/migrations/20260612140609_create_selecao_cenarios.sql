CREATE TABLE IF NOT EXISTS public.selecao_cenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_fonte INTEGER REFERENCES public.fonte_agua(id_fonte) ON DELETE CASCADE,
  id_tc INTEGER REFERENCES public.tipos_cenarios(id_tc) ON DELETE CASCADE,
  id_c INTEGER REFERENCES public.cenarios(id_cenarios) ON DELETE CASCADE,
  id_acao INTEGER REFERENCES public.acoes(id_acao) ON DELETE CASCADE,
  selecionado BOOLEAN DEFAULT true,
  id_usuario UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  criado_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_selecao_cenarios_usuario ON public.selecao_cenarios(id_usuario);

ALTER TABLE public.selecao_cenarios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "selecao_cenarios_select" ON public.selecao_cenarios;
CREATE POLICY "selecao_cenarios_select" ON public.selecao_cenarios 
  FOR SELECT TO authenticated USING (auth.uid() = id_usuario);

DROP POLICY IF EXISTS "selecao_cenarios_insert" ON public.selecao_cenarios;
CREATE POLICY "selecao_cenarios_insert" ON public.selecao_cenarios 
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id_usuario);

DROP POLICY IF EXISTS "selecao_cenarios_update" ON public.selecao_cenarios;
CREATE POLICY "selecao_cenarios_update" ON public.selecao_cenarios 
  FOR UPDATE TO authenticated USING (auth.uid() = id_usuario) WITH CHECK (auth.uid() = id_usuario);

DROP POLICY IF EXISTS "selecao_cenarios_delete" ON public.selecao_cenarios;
CREATE POLICY "selecao_cenarios_delete" ON public.selecao_cenarios 
  FOR DELETE TO authenticated USING (auth.uid() = id_usuario);
