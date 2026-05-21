import { useState, useEffect } from 'react'
import { getTable } from '@/services/ssd'

export function useSsdData() {
  const [data, setData] = useState<any>({
    fonte_agua: [],
    tipos_cenarios: [],
    cenarios: [],
    acoes: [],
    simulacao_ssd: [],
    cenario_demanda: [],
    cenario_consumo: [],
    cenario_perdas: [],
    cenario_simulacao: [],
    acoes_fonte: [],
  })

  const load = async () => {
    const [f, tc, c, a, s, cd, cc, cp, cs, af] = await Promise.all([
      getTable('fonte_agua'),
      getTable('tipos_cenarios'),
      getTable('cenarios'),
      getTable('acoes'),
      getTable('simulacao_ssd'),
      getTable('cenario_demanda'),
      getTable('cenario_consumo'),
      getTable('cenario_perdas'),
      getTable('cenario_simulacao'),
      getTable('acoes_fonte'),
    ])
    setData({
      fonte_agua: f,
      tipos_cenarios: tc,
      cenarios: c,
      acoes: a,
      simulacao_ssd: s,
      cenario_demanda: cd,
      cenario_consumo: cc,
      cenario_perdas: cp,
      cenario_simulacao: cs,
      acoes_fonte: af,
    })
  }

  useEffect(() => {
    load()
  }, [])

  return { ...data, reload: load }
}
