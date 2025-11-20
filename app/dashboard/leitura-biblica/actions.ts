"use server"

import { createClient } from "@/lib/supabase/server"

export async function marcarCapituloLido(livroId: number, numeroCapitulo: number, tempoLeitura: number) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Não autenticado" }
  }

  // Buscar ID do capítulo
  const { data: capitulo } = await supabase
    .from("capitulos_biblia")
    .select("id")
    .eq("livro_id", livroId)
    .eq("numero_capitulo", numeroCapitulo)
    .single()

  if (!capitulo) {
    return { success: false, error: "Capítulo não encontrado" }
  }

  const capituloId = capitulo.id

  // Buscar registro de leituras do usuário
  const { data: leitura, error: fetchError } = await supabase
    .from("leituras_capitulos")
    .select("capitulos_lidos, xp_acumulado_leitura")
    .eq("usuario_id", user.id)
    .single()

  if (fetchError && fetchError.code !== "PGRST116") {
    return { success: false, error: fetchError.message }
  }

  const capitulosLidos = leitura?.capitulos_lidos || []
  const jaLido = capitulosLidos.includes(capituloId)

  if (jaLido) {
    return { success: true, xpGanho: 0, jaLido: true }
  }

  // Adicionar capítulo ao array
  const novosCapitulosLidos = [...capitulosLidos, capituloId]
  const novoXpAcumulado = (leitura?.xp_acumulado_leitura || 0) + 5

  const { error } = await supabase.from("leituras_capitulos").upsert(
    {
      usuario_id: user.id,
      capitulos_lidos: novosCapitulosLidos,
      xp_acumulado_leitura: novoXpAcumulado,
    },
    {
      onConflict: "usuario_id",
    },
  )

  if (error) {
    return { success: false, error: error.message }
  }

  // Atualizar XP total do discípulo
  const { data: discipulo } = await supabase.from("discipulos").select("id, xp_total").eq("user_id", user.id).single()

  if (discipulo) {
    const novoXpTotal = (discipulo.xp_total || 0) + 5
    await supabase.from("discipulos").update({ xp_total: novoXpTotal }).eq("id", discipulo.id)
  }

  return { success: true, xpGanho: 5, jaLido: false }
}

export async function desmarcarCapituloLido(livroId: number, numeroCapitulo: number) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Não autenticado" }
  }

  // Buscar ID do capítulo
  const { data: capitulo } = await supabase
    .from("capitulos_biblia")
    .select("id")
    .eq("livro_id", livroId)
    .eq("numero_capitulo", numeroCapitulo)
    .single()

  if (!capitulo) {
    return { success: true }
  }

  const capituloId = capitulo.id

  // Buscar registro de leituras do usuário
  const { data: leitura } = await supabase
    .from("leituras_capitulos")
    .select("capitulos_lidos, xp_acumulado_leitura")
    .eq("usuario_id", user.id)
    .single()

  if (!leitura) {
    return { success: true }
  }

  // Remover capítulo do array
  const novosCapitulosLidos = leitura.capitulos_lidos.filter((id: number) => id !== capituloId)
  const novoXpAcumulado = Math.max(0, (leitura.xp_acumulado_leitura || 0) - 5)

  const { error } = await supabase
    .from("leituras_capitulos")
    .update({
      capitulos_lidos: novosCapitulosLidos,
      xp_acumulado_leitura: novoXpAcumulado,
    })
    .eq("usuario_id", user.id)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function buscarCapitulosLidos(livroId: number, capitulos: number[]) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { leituras: [], ultimoCapituloLido: null }
  }

  // Buscar IDs dos capítulos do livro
  const { data: capitulosBiblia } = await supabase
    .from("capitulos_biblia")
    .select("id, numero_capitulo")
    .eq("livro_id", livroId)
    .in("numero_capitulo", capitulos)

  if (!capitulosBiblia) {
    return { leituras: [], ultimoCapituloLido: null }
  }

  // Buscar capítulos lidos do usuário
  const { data: leitura } = await supabase
    .from("leituras_capitulos")
    .select("capitulos_lidos")
    .eq("usuario_id", user.id)
    .single()

  const capitulosLidosIds = new Set(leitura?.capitulos_lidos || [])

  // Mapear para o formato esperado
  const leituras = capitulosBiblia.map((cap) => ({
    numero_capitulo: cap.numero_capitulo,
    lido: capitulosLidosIds.has(cap.id),
  }))

  // Encontrar o último capítulo lido dentro do intervalo
  const capitulosLidosNaFaixa = capitulosBiblia
    .filter((cap) => capitulosLidosIds.has(cap.id))
    .sort((a, b) => b.numero_capitulo - a.numero_capitulo)

  const ultimoCapituloLido = capitulosLidosNaFaixa.length > 0 ? capitulosLidosNaFaixa[0].numero_capitulo : null

  return { leituras, ultimoCapituloLido }
}

export async function obterXpAcumuladoLeitura() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { xpAcumulado: 0 }
  }

  const { data: leitura } = await supabase
    .from("leituras_capitulos")
    .select("xp_acumulado_leitura")
    .eq("usuario_id", user.id)
    .single()

  return { xpAcumulado: leitura?.xp_acumulado_leitura || 0 }
}
