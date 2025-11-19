'use server'

import { createClient } from '@supabase/supabase-js'

// Usar service role para bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function atualizarCapitulo(id: number, texto: string) {
  const { data, error } = await supabaseAdmin
    .from('capitulos_biblia')
    .update({ texto })
    .eq('id', id)
    .select()
  
  return { data, error }
}

export async function buscarCapitulosVazios() {
  let allCapitulos: any[] = []
  let from = 0
  const batchSize = 1000
  let hasMore = true
  
  while (hasMore) {
    const { data, error } = await supabaseAdmin
      .from('capitulos_biblia')
      .select('id, livro_id, numero_capitulo, texto, livros_biblia(abreviacao, nome)')
      .order('livro_id')
      .order('numero_capitulo')
      .range(from, from + batchSize - 1)
    
    if (error) {
      throw new Error(error.message)
    }
    
    if (data && data.length > 0) {
      allCapitulos = [...allCapitulos, ...data]
      from += batchSize
      
      if (data.length < batchSize) {
        hasMore = false
      }
    } else {
      hasMore = false
    }
  }
  
  const capitulos = allCapitulos.filter(cap => 
    cap.texto === null || cap.texto === 'EMPTY' || cap.texto?.trim() === ''
  )
  
  return capitulos
}

export async function diagnosticarCapitulos() {
  let allCapitulos: any[] = []
  let from = 0
  const batchSize = 1000
  let hasMore = true
  
  while (hasMore) {
    const { data, error } = await supabaseAdmin
      .from('capitulos_biblia')
      .select('texto')
      .range(from, from + batchSize - 1)
    
    if (error) {
      throw new Error(error.message)
    }
    
    if (data && data.length > 0) {
      allCapitulos = [...allCapitulos, ...data]
      from += batchSize
      
      if (data.length < batchSize) {
        hasMore = false
      }
    } else {
      hasMore = false
    }
  }
  
  const totalCapitulos = allCapitulos.length
  const capitulosVazios = allCapitulos.filter(cap => 
    cap.texto === null || cap.texto === 'EMPTY' || cap.texto?.trim() === ''
  ).length
  
  const capitulosPreenchidos = totalCapitulos - capitulosVazios
  
  return {
    totalCapitulos,
    capitulosVazios,
    capitulosPreenchidos
  }
}
