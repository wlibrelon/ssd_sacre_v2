import { useState, useEffect } from 'react'
import { getTable } from '@/services/ssd'

export function useSsdData() {
  const [data, setData] = useState<any>({
    fonte_agua: [],
    tipos_cenarios: [],
    cenarios: [],
    estrategias: [],
    simulacao_ssd: [],
    cenario_demanda: [],
    cenario_consumo: [],
    cenario_perdas: [],
  })

  const load = async () => {
    const [f, tc, c, e, s, cd, cc, cp] = await Promise.all([
      getTable('fonte_agua'),
      getTable('tipos_cenarios'),
      getTable('cenarios'),
      getTable('estrategias'),
      getTable('simulacao_ssd'),
      getTable('cenario_demanda'),
      getTable('cenario_consumo'),
      getTable('cenario_perdas'),
    ])
    setData({
      fonte_agua: f,
      tipos_cenarios: tc,
      cenarios: c,
      estrategias: e,
      simulacao_ssd: s,
      cenario_demanda: cd,
      cenario_consumo: cc,
      cenario_perdas: cp,
    })
  }

  useEffect(() => {
    load()
  }, [])

  return { ...data, reload: load }
}
