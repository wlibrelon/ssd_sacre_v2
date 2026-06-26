import React, { useMemo } from 'react'

type StatusSeg = 'seguro' | 'alerta' | 'crise' | 'colapso'

interface MatrizEficaciaProps {
  data: any[]
  limiarAlerta: number
  limiarCrise: number
  limiarColapso: number
}

function getStatus(
  indice: number,
  limiarAlerta: number,
  limiarCrise: number,
  limiarColapso: number,
): StatusSeg {
  if (indice >= limiarAlerta) return 'seguro'
  if (indice >= limiarCrise) return 'alerta'
  if (indice >= limiarColapso) return 'crise'
  return 'colapso'
}

const STATUS_COLORS: Record<StatusSeg, { bg: string; text: string; border: string }> = {
  seguro: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  alerta: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  crise: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  colapso: { bg: 'bg-rose-100', text: 'text-rose-900', border: 'border-rose-400' },
}

export function MatrizEficacia({
  data,
  limiarAlerta,
  limiarCrise,
  limiarColapso,
}: MatrizEficaciaProps) {
  const { cenarios, estrategias, matrix } = useMemo(() => {
    const groups: Record<string, Record<string, any[]>> = {}
    const cenariosSet = new Set<string>()
    const estrategiasSet = new Set<string>()

    data.forEach((row) => {
      let cArr = []
      if (Array.isArray(row.cenarios)) cArr = row.cenarios
      else if (typeof row.cenarios === 'string') {
        try {
          cArr = JSON.parse(row.cenarios)
        } catch {
          cArr = [row.cenarios]
        }
      }

      let eArr = []
      if (Array.isArray(row.estrategias)) eArr = row.estrategias
      else if (typeof row.estrategias === 'string') {
        try {
          eArr = JSON.parse(row.estrategias)
        } catch {
          eArr = [row.estrategias]
        }
      }

      const cKey = cArr.length > 0 ? [...cArr].sort().join(' + ') : 'Cenário Base'
      const eKey = eArr.length > 0 ? [...eArr].sort().join(' + ') : 'Estratégia Base'

      cenariosSet.add(cKey)
      estrategiasSet.add(eKey)

      if (!groups[cKey]) groups[cKey] = {}
      if (!groups[cKey][eKey]) groups[cKey][eKey] = []
      groups[cKey][eKey].push(row)
    })

    const cList = Array.from(cenariosSet).sort()
    const eList = Array.from(estrategiasSet).sort()

    const matrixData: Record<
      string,
      Record<string, { indice: number; status: StatusSeg; isValid: boolean }>
    > = {}

    cList.forEach((c) => {
      matrixData[c] = {}
      eList.forEach((e) => {
        const rows = groups[c]?.[e] || []
        if (rows.length === 0) {
          matrixData[c][e] = { indice: 0, status: 'colapso', isValid: false }
          return
        }

        const porTempo: Record<string, { volTotal: number; demTotal: number; demCount: number }> =
          {}
        rows.forEach((r: any) => {
          const t = r.tempo
          if (!porTempo[t]) porTempo[t] = { volTotal: 0, demTotal: 0, demCount: 0 }
          porTempo[t].volTotal += r.volume_distribuido || 0
          porTempo[t].demTotal += r.demanda || 0
          porTempo[t].demCount += 1
        })

        const tempos = Object.values(porTempo)
        let sumIndices = 0
        tempos.forEach((t) => {
          const demRegional = t.demCount > 0 ? t.demTotal / t.demCount : 0
          const ind = demRegional > 0 ? Math.min(1, t.volTotal / demRegional) : 1
          sumIndices += ind
        })

        const indiceMedio = tempos.length > 0 ? sumIndices / tempos.length : 0
        const status = getStatus(indiceMedio, limiarAlerta, limiarCrise, limiarColapso)

        matrixData[c][e] = { indice: indiceMedio, status, isValid: true }
      })
    })

    return { cenarios: cList, estrategias: eList, matrix: matrixData }
  }, [data, limiarAlerta, limiarCrise, limiarColapso])

  if (cenarios.length === 0 || estrategias.length === 0) return null

  return (
    <div className="bg-white p-5 shadow-sm rounded-xl border border-slate-200 mt-6">
      <div className="border-b pb-3 mb-4">
        <h3 className="font-semibold text-primary text-sm uppercase tracking-wider">
          Matriz de Eficácia
        </h3>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Índice médio de segurança hídrica por combinação de cenário e estratégia.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="border-collapse text-sm w-full">
          <thead>
            <tr>
              <th className="bg-slate-100 px-3 py-2.5 text-left font-semibold text-slate-600 border border-slate-200 min-w-[150px]">
                Cenários \ Estratégias
              </th>
              {estrategias.map((e) => (
                <th
                  key={e}
                  className="bg-slate-100 px-3 py-2.5 text-center font-semibold text-slate-600 border border-slate-200 min-w-[120px]"
                >
                  {e}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cenarios.map((c) => (
              <tr key={c} className="group">
                <td className="bg-slate-50 px-3 py-2 font-medium text-slate-700 border border-slate-200">
                  {c}
                </td>
                {estrategias.map((e) => {
                  const cell = matrix[c][e]
                  if (!cell.isValid) {
                    return (
                      <td
                        key={e}
                        className="border border-slate-200 px-3 py-2 text-center text-slate-300 bg-slate-50/50"
                      >
                        -
                      </td>
                    )
                  }

                  const colors = STATUS_COLORS[cell.status]
                  return (
                    <td
                      key={e}
                      className={`border border-slate-200 px-3 py-2 text-center transition-colors ${colors.bg}`}
                    >
                      <div className={`font-bold ${colors.text} text-lg`}>
                        {(cell.indice * 100).toFixed(1)}%
                      </div>
                      <div
                        className={`text-[10px] uppercase font-semibold mt-0.5 ${colors.text} opacity-80`}
                      >
                        {cell.status}
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-4 text-xs mt-4">
        {(['seguro', 'alerta', 'crise', 'colapso'] as StatusSeg[]).map((s) => (
          <div key={s} className="flex items-center gap-1.5">
            <span
              className={`w-3.5 h-3.5 rounded-sm inline-block border ${STATUS_COLORS[s].bg} ${STATUS_COLORS[s].border}`}
            />
            <span className="text-slate-600 capitalize">{s}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
