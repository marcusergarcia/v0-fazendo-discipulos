import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const bookMap: Record<string, string> = {
  'gênesis': 'gn',
  'êxodo': 'ex',
  'levítico': 'lv',
  'números': 'nm',
  'deuteronômio': 'dt',
  'josué': 'js',
  'juízes': 'jz',
  'rute': 'rt',
  '1 samuel': '1sm',
  '2 samuel': '2sm',
  '1 reis': '1rs',
  '2 reis': '2rs',
  '1 crônicas': '1cr',
  '2 crônicas': '2cr',
  'esdras': 'ed',
  'neemias': 'ne',
  'ester': 'et',
  'jó': 'jó',
  'salmos': 'sl',
  'provérbios': 'pv',
  'eclesiastes': 'ec',
  'cântico dos cânticos': 'ct',
  'isaías': 'is',
  'jeremias': 'jr',
  'lamentações': 'lm',
  'ezequiel': 'ez',
  'daniel': 'dn',
  'oséias': 'os',
  'joel': 'jl',
  'amós': 'am',
  'obadias': 'ob',
  'jonas': 'jn',
  'miquéias': 'mq',
  'naum': 'na',
  'habacuque': 'hc',
  'sofonias': 'sf',
  'ageu': 'ag',
  'zacarias': 'zc',
  'malaquias': 'ml',
  'mateus': 'mt',
  'marcos': 'mc',
  'lucas': 'lc',
  'joão': 'jo',
  'atos': 'at',
  'romanos': 'rm',
  '1 coríntios': '1co',
  '2 coríntios': '2co',
  'gálatas': 'gl',
  'efésios': 'ef',
  'filipenses': 'fp',
  'colossenses': 'cl',
  '1 tessalonicenses': '1ts',
  '2 tessalonicenses': '2ts',
  '1 timóteo': '1tm',
  '2 timóteo': '2tm',
  'tito': 'tt',
  'filemom': 'fm',
  'hebreus': 'hb',
  'tiago': 'tg',
  '1 pedro': '1pe',
  '2 pedro': '2pe',
  '1 joão': '1jo',
  '2 joão': '2jo',
  '3 joão': '3jo',
  'judas': 'jd',
  'apocalipse': 'ap'
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const bookName = searchParams.get('book')
    const chapter = searchParams.get('chapter')

    if (!bookName || !chapter) {
      return NextResponse.json(
        { error: 'Parâmetros book e chapter são obrigatórios' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const bookKey = bookName.toLowerCase().trim()
    const abreviacao = bookMap[bookKey]

    if (!abreviacao) {
      return NextResponse.json(
        { error: `Livro não encontrado: ${bookName}` },
        { status: 404 }
      )
    }

    const { data: livro, error: livroError } = await supabase
      .from('livros_biblia')
      .select('id, nome')
      .eq('abreviacao', abreviacao)
      .single()

    if (livroError || !livro) {
      return NextResponse.json(
        { error: 'Livro não encontrado no banco de dados' },
        { status: 404 }
      )
    }

    const { data: capitulo, error: capituloError } = await supabase
      .from('capitulos_biblia')
      .select('texto')
      .eq('livro_id', livro.id)
      .eq('numero_capitulo', parseInt(chapter))
      .single()

    if (capituloError || !capitulo) {
      return NextResponse.json(
        { error: 'Capítulo não encontrado no banco de dados' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      book: livro.nome,
      chapter: parseInt(chapter),
      text: capitulo.texto
    })
  } catch (error) {
    console.error('[v0] Erro na API de Bíblia:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
