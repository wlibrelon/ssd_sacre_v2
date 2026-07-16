// Edge Function: proxy para a API HidroWebService da ANA.
// Evita o bloqueio de CORS que ocorre ao chamar a API diretamente do navegador,
// já que a chamada real para www.ana.gov.br acontece aqui no servidor (Deno).
//
// Deploy: supabase functions deploy hidro-proxy
//
// Body esperado (POST, JSON):
//   { "action": "auth", "identificador": "...", "senha": "..." }
//   { "action": "query", "token": "...", "path": "/HidroinfoanaSerieTelemetricaAdotada/v1", "params": { "CodigoDaEstacao": "15400000", ... } }
//
// IMPORTANTE: esta function SEMPRE responde com HTTP 200 para o navegador
// (mesmo quando a ANA retorna erro), colocando o status real da ANA dentro do
// campo "upstreamStatus". Isso evita que o cliente supabase-js trate respostas
// de erro da ANA (400/401/500) como falha de transporte da Edge Function
// (o que esconderia a mensagem de erro real vinda da ANA).

import { serve } from 'https://deno.land/std@0.190.0/http/server.ts'

const HIDRO_BASE_URL = 'https://www.ana.gov.br/hidrowebservice/EstacoesTelemetricas'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Responde sempre com 200 (transporte) — o status real da chamada fica em upstreamStatus.
function ok(upstreamStatus: number, data: unknown) {
  return new Response(JSON.stringify({ upstreamStatus, data }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

// Erro da própria function (requisição malformada, exceção interna) — também
// devolvido com upstreamStatus preenchido, mas sem status HTTP 200 "fake" de
// upstream inexistente (usamos 0 para indicar que a ANA nem chegou a ser chamada).
function selfError(message: string, httpStatus = 400) {
  return new Response(JSON.stringify({ upstreamStatus: 0, data: { error: message } }), {
    status: httpStatus,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return selfError('Método não suportado. Use POST.', 405)
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return selfError('Corpo da requisição inválido (JSON esperado).', 400)
  }

  const action = body.action

  try {
    if (action === 'auth') {
      const identificador = body.identificador as string | undefined
      const senha = body.senha as string | undefined
      if (!identificador || !senha) {
        return selfError('Informe identificador e senha.', 400)
      }

      const res = await fetch(`${HIDRO_BASE_URL}/OAUth/v1`, {
        method: 'GET',
        headers: {
          Identificador: identificador,
          Senha: senha,
        },
      })
      const text = await res.text()
      const data = safeJson(text)
      return ok(res.status, data)
    }

    if (action === 'query') {
      const token = body.token as string | undefined
      const path = body.path as string | undefined
      const params = (body.params as Record<string, string>) || {}
      if (!token || !path) {
        return selfError('Informe token e path.', 400)
      }

      const filtered = Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== '' && v != null),
      )
      const qs = new URLSearchParams(filtered).toString()
      const url = `${HIDRO_BASE_URL}${path}${qs ? `?${qs}` : ''}`

      const res = await fetch(url, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      })
      const text = await res.text()
      const data = safeJson(text)
      return ok(res.status, data)
    }

    return selfError(`Ação desconhecida: ${String(action)}`, 400)
  } catch (err) {
    return selfError(`Erro ao chamar a API da ANA: ${String(err)}`, 502)
  }
})

function safeJson(text: string) {
  try {
    return JSON.parse(text)
  } catch {
    // A ANA às vezes responde com corpo vazio ou HTML (ex: erro 5xx de infra) —
    // devolvemos o texto bruto para não perder a informação de diagnóstico.
    return { raw: text }
  }
}
