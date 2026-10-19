-- Cenários usados no cálculo automático de demanda e perdas passam a ser
-- gravados na configuração da simulação (antes ficavam só na tela e se
-- perdiam ao sair do módulo).
ALTER TABLE public.simulacao_ssd
  ADD COLUMN IF NOT EXISTS id_cd INTEGER REFERENCES public.cenario_demanda(id_cd) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS id_cc INTEGER REFERENCES public.cenario_consumo(id_cc) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS id_cp INTEGER REFERENCES public.cenario_perdas(id_cp) ON DELETE SET NULL;
