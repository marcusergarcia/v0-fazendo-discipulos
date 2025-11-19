'use server'

import { createClient } from '@/lib/supabase/server'

export async function confirmarLeituraAction({
  discipuloId,
  semanaNumero,
  livro,
  capituloInicio,
  capituloFim
}: {
  discipuloId: string
  semanaNumero: number
  livro: string
  capituloInicio: number
  capituloFim: number
}) {
  const supabase = await createClient()

  try {
    // Inserir ou atualizar leitura
    const { error: leituraError } = await supabase
      .from('leituras_biblicas')
      .upsert({
        discipulo_id: discipuloId,
        semana_numero: semanaNumero,
        livro,
        capitulo_inicio: capituloInicio,
        capitulo_fim: capituloFim,
        confirmada: true,
        data_leitura: new Date().toISOString(),
        xp_ganho: 10
      })

    if (leituraError) {
      console.error('[v0] Erro ao salvar leitura:', leituraError)
      return { success: false, error: leituraError.message }
    }

    // Atualizar XP do discípulo
    const { error: xpError } = await supabase.rpc('incrementar_xp', {
      discipulo_id_param: discipuloId,
      xp_param: 10
    })

    if (xpError) {
      console.error('[v0] Erro ao incrementar XP:', xpError)
    }

    return { success: true }
  } catch (error) {
    console.error('[v0] Erro ao confirmar leitura:', error)
    return { success: false, error: 'Erro desconhecido' }
  }
}

export async function marcarCapituloLido(
  livroId: number,
  numeroCapitulo: number,
  tempoLeitura: number
) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Não autenticado' }
  }

  const { error } = await supabase.from('leituras_capitulos').upsert(
    {
      usuario_id: user.id,
      livro_id: livroId,
      numero_capitulo: numeroCapitulo,
      lido: true,
      tempo_leitura: tempoLeitura,
      data_leitura: new Date().toISOString(),
    },
    {
      onConflict: 'usuario_id,livro_id,numero_capitulo',
    }
  )

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function desmarcarCapituloLido(
  livroId: number,
  numeroCapitulo: number
) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Não autenticado' }
  }

  const { error } = await supabase.from('leituras_capitulos').upsert(
    {
      usuario_id: user.id,
      livro_id: livroId,
      numero_capitulo: numeroCapitulo,
      lido: false,
    },
    {
      onConflict: 'usuario_id,livro_id,numero_capitulo',
    }
  )

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
    return { leituras: [] }
  }

  const { data, error } = await supabase
    .from('leituras_capitulos')
    .select('numero_capitulo, lido')
    .eq('usuario_id', user.id)
    .eq('livro_id', livroId)
    .in('numero_capitulo', capitulos)

  if (error) {
    console.error('Erro ao buscar capítulos lidos:', error)
    return { leituras: [] }
  }

  return { leituras: data || [] }
}
