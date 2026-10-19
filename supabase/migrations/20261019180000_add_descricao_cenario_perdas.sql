-- Descrição (premissa) do cenário de perdas, exibida abaixo do combobox
-- de perdas na configuração da simulação — mesmo padrão de
-- cenario_demanda.descricao e cenario_consumo.descricao.
ALTER TABLE public.cenario_perdas
  ADD COLUMN IF NOT EXISTS descricao VARCHAR;
