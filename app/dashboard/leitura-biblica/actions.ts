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
      // Não retorna erro aqui porque a leitura já foi salva
    }

    return { success: true }
  } catch (error) {
    console.error('[v0] Erro ao confirmar leitura:', error)
    return { success: false, error: 'Erro desconhecido' }
  }
}
