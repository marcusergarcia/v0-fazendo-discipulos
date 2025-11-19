import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

// Mapeamento de abreviações para IDs dos livros
const livrosMap: Record<string, number> = {
  'gn': 1, 'ex': 2, 'lv': 3, 'nm': 4, 'dt': 5, 'js': 6, 'jz': 7, 'rt': 8,
  '1sm': 9, '2sm': 10, '1rs': 11, '2rs': 12, '1cr': 13, '2cr': 14, 'ed': 15,
  'ne': 16, 'et': 17, 'job': 18, 'sl': 19, 'pv': 20, 'ec': 21, 'ct': 22,
  'is': 23, 'jr': 24, 'lm': 25, 'ez': 26, 'dn': 27, 'os': 28, 'jl': 29,
  'am': 30, 'ob': 31, 'jn': 32, 'mq': 33, 'na': 34, 'hc': 35, 'sf': 36,
  'ag': 37, 'zc': 38, 'ml': 39, 'mt': 40, 'mc': 41, 'lc': 42, 'jo': 43,
  'at': 44, 'rm': 45, '1co': 46, '2co': 47, 'gl': 48, 'ef': 49, 'fp': 50,
  'cl': 51, '1ts': 52, '2ts': 53, '1tm': 54, '2tm': 55, 'tt': 56, 'fm': 57,
  'hb': 58, 'tg': 59, '1pe': 60, '2pe': 61, '1jo': 62, '2jo': 63, '3jo': 64,
  'jd': 65, 'ap': 66
}

async function buscarCapitulo(abreviacao: string, capitulo: number): Promise<string | null> {
  try {
    const url = `https://www.abibliadigital.com.br/api/verses/acf/${abreviacao}/${capitulo}`
    console.log(`[v0] Buscando: ${url}`)
    
    const response = await fetch(url)
    
    if (!response.ok) {
      console.error(`[v0] Erro HTTP ${response.status} para ${abreviacao} ${capitulo}`)
      return null
    }
    
    const data = await response.json()
    
    if (data.verses && Array.isArray(data.verses)) {
      const texto = data.verses.map((v: any) => v.text).join(' ')
      return texto
    }
    
    return null
  } catch (error) {
    console.error(`[v0] Erro ao buscar ${abreviacao} ${capitulo}:`, error)
    return null
  }
}

async function importarBiblia() {
  console.log('[v0] Iniciando importação da Bíblia ACF...')
  
  // Buscar todos os capítulos vazios
  const { data: capitulos, error } = await supabase
    .from('capitulos_biblia')
    .select('id, livro_id, numero_capitulo, livros_biblia(abreviacao)')
    .is('texto', null)
    .order('livro_id')
    .order('numero_capitulo')
  
  if (error) {
    console.error('[v0] Erro ao buscar capítulos:', error)
    return
  }
  
  console.log(`[v0] Encontrados ${capitulos?.length || 0} capítulos para importar`)
  
  let importados = 0
  let erros = 0
  
  for (const cap of capitulos || []) {
    const abreviacao = (cap.livros_biblia as any)?.abreviacao
    
    if (!abreviacao) {
      console.error(`[v0] Abreviação não encontrada para livro_id ${cap.livro_id}`)
      erros++
      continue
    }
    
    const texto = await buscarCapitulo(abreviacao, cap.numero_capitulo)
    
    if (texto) {
      const { error: updateError } = await supabase
        .from('capitulos_biblia')
        .update({ texto })
        .eq('id', cap.id)
      
      if (updateError) {
        console.error(`[v0] Erro ao atualizar capítulo ${cap.id}:`, updateError)
        erros++
      } else {
        importados++
        console.log(`[v0] Importado: ${abreviacao} ${cap.numero_capitulo} (${importados}/${capitulos.length})`)
      }
    } else {
      erros++
    }
    
    // Aguardar 500ms entre requisições para não sobrecarregar a API
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  
  console.log(`[v0] Importação concluída!`)
  console.log(`[v0] Capítulos importados: ${importados}`)
  console.log(`[v0] Erros: ${erros}`)
}

importarBiblia()
