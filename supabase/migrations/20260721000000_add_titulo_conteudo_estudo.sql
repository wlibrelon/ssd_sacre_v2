-- Torna o menu "Área de Estudo" (Contexto/Objetivos) dinâmico, gerenciável em
-- Painel Administrativo > Gestão de Conteúdo. A tabela conteudo_estudo passa a
-- guardar tanto o rótulo exibido no menu (titulo) quanto o HTML da página
-- (conteudo_html, já existente) e a ordem de exibição (ordem, já existente).

ALTER TABLE public.conteudo_estudo
  ADD COLUMN IF NOT EXISTS titulo TEXT;

-- Preenche título e ordem das linhas já existentes (contexto/objetivos),
-- que passam a ser apenas os dois primeiros itens dinâmicos do menu.
UPDATE public.conteudo_estudo SET titulo = 'Contexto', ordem = 1 WHERE secao = 'contexto' AND titulo IS NULL;
UPDATE public.conteudo_estudo SET titulo = 'Objetivos', ordem = 2 WHERE secao = 'objetivos' AND titulo IS NULL;

-- Qualquer linha antiga sem título (não deveria haver, mas por segurança)
-- ganha um rótulo genérico para não quebrar o menu.
UPDATE public.conteudo_estudo SET titulo = 'Sem título' WHERE titulo IS NULL;
