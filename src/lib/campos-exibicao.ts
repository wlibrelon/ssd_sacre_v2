// Nomes de exibição dos atributos de uma camada vetorial — ver
// CamadaFormModal.tsx (cadastro) e área-estudo/Camadas.tsx (janela de
// detalhes da feição no mapa).

export type CampoExibicao = { campo: string; nome_exibicao: string }

/**
 * Normaliza o valor salvo em `camadas_mapa.campos_exibicao`.
 *
 * Aceita tanto o formato antigo (lista simples de nomes de campo, sem
 * apelido — ex: `["nm_bairro", "populacao"]`) quanto o formato atual (lista
 * de `{ campo, nome_exibicao }`), assim camadas cadastradas antes da criação
 * dos nomes de exibição continuam funcionando sem precisar reconfiguração:
 * cada campo antigo vira seu próprio nome de exibição.
 *
 * Entradas sem nome de exibição preenchido são descartadas — só atributos
 * com um nome definido devem aparecer na janela de detalhes do mapa.
 */
export function normalizarCamposExibicao(valor: unknown): CampoExibicao[] {
  if (!Array.isArray(valor)) return []
  return valor
    .map((item): CampoExibicao | null => {
      if (typeof item === 'string') {
        return item.trim() ? { campo: item, nome_exibicao: item } : null
      }
      if (item && typeof item === 'object' && typeof (item as any).campo === 'string') {
        const campo = (item as any).campo
        const nomeExibicao =
          typeof (item as any).nome_exibicao === 'string' ? (item as any).nome_exibicao : campo
        return { campo, nome_exibicao: nomeExibicao }
      }
      return null
    })
    .filter((item): item is CampoExibicao => !!item && item.nome_exibicao.trim() !== '')
}
