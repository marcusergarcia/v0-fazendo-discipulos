import { PASSOS_CONTEUDO } from "@/constants/passos-evangelho"
import { PASSOS_BATISMO } from "@/constants/passos-batismo"
import { getPerguntasPasso } from "@/constants/perguntas-evangelho"

const XP_POR_CAPITULO_LEITURA = 5
const XP_POR_VIDEO = 30
const XP_POR_ARTIGO = 30
const XP_POR_PERGUNTA_REFLEXIVA = 30

/**
 * Calcula o XP total de um passo específico baseado em sua estrutura real
 */
export function calcularXpPasso(numeroPasso: number): number {
  let passoData: any

  // Buscar dados do passo
  if (numeroPasso >= 11 && numeroPasso <= 22) {
    passoData = PASSOS_BATISMO[numeroPasso as keyof typeof PASSOS_BATISMO]
  } else {
    passoData = PASSOS_CONTEUDO[numeroPasso as keyof typeof PASSOS_CONTEUDO]
  }

  if (!passoData) {
    console.warn(`[calcularXpPasso] Passo ${numeroPasso} não encontrado, usando valores padrão`)
    return 305 // Valor padrão
  }

  // Calcular XP da leitura bíblica (7 capítulos padrão)
  const xpLeitura = 7 * XP_POR_CAPITULO_LEITURA // 35 XP

  // Calcular XP dos vídeos
  const quantidadeVideos = passoData.videos?.length || 3
  const xpVideos = quantidadeVideos * XP_POR_VIDEO

  // Calcular XP dos artigos
  const quantidadeArtigos = passoData.artigos?.length || 3
  const xpArtigos = quantidadeArtigos * XP_POR_ARTIGO

  const perguntas = getPerguntasPasso(numeroPasso)
  const quantidadePerguntas = perguntas.length || 3
  const xpPerguntas = quantidadePerguntas * XP_POR_PERGUNTA_REFLEXIVA

  const xpTotal = xpLeitura + xpVideos + xpArtigos + xpPerguntas

  console.log(`[calcularXpPasso] Passo ${numeroPasso}:`, {
    xpLeitura,
    xpVideos: `${quantidadeVideos}x${XP_POR_VIDEO}=${xpVideos}`,
    xpArtigos: `${quantidadeArtigos}x${XP_POR_ARTIGO}=${xpArtigos}`,
    xpPerguntas: `${quantidadePerguntas}x${XP_POR_PERGUNTA_REFLEXIVA}=${xpPerguntas}`,
    xpTotal,
  })

  return xpTotal
}

/**
 * Calcula o XP total de uma fase completa
 */
export function calcularXpFaseCompleta(fase: number, incluiBatismo = false): number {
  let xpTotal = 0

  if (fase === 1) {
    // Fase 1: Passos 1-10 do Evangelho
    for (let i = 1; i <= 10; i++) {
      xpTotal += calcularXpPasso(i)
    }

    // Se incluir batismo, adicionar passos 11-22
    if (incluiBatismo) {
      for (let i = 11; i <= 22; i++) {
        xpTotal += calcularXpPasso(i)
      }
    }
  } else {
    // Outras fases (assumir 10 passos com estrutura padrão)
    for (let i = 1; i <= 10; i++) {
      xpTotal += 305 // Valor padrão até termos dados das outras fases
    }
  }

  return xpTotal
}

/**
 * Calcula quanto XP o discípulo já conquistou até o passo atual
 */
export function calcularXpAcumuladoAtePasso(passoAtual: number, incluiBatismo = false): number {
  let xpAcumulado = 0

  if (passoAtual <= 10) {
    // Passos do Evangelho (1-10)
    for (let i = 1; i < passoAtual; i++) {
      xpAcumulado += calcularXpPasso(i)
    }
  } else if (passoAtual <= 22 && incluiBatismo) {
    // Completou Evangelho (1-10) + passos de Batismo até o atual
    for (let i = 1; i <= 10; i++) {
      xpAcumulado += calcularXpPasso(i)
    }
    for (let i = 11; i < passoAtual; i++) {
      xpAcumulado += calcularXpPasso(i)
    }
  }

  return xpAcumulado
}
