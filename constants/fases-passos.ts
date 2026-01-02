import { PASSOS_CONTEUDO as PASSOS_EVANGELHO } from "./passos-evangelho"
import { PASSOS_BATISMO } from "./passos-batismo"

export const FASES_INFO = {
  1: {
    nome: "O Evangelho",
    descricao: "Fundamentos da fé cristã e preparação para o batismo",
    cor: "#3B82F6",
    passos: 10,
  },
  2: {
    nome: "Armadura de Deus",
    descricao: "Guerra espiritual e proteção",
    cor: "#8B5CF6",
    passos: 10,
  },
  3: {
    nome: "Vida em Comunidade",
    descricao: "Relacionamentos e igreja",
    cor: "#10B981",
    passos: 10,
  },
  4: {
    nome: "Sermão da Montanha",
    descricao: "Treinamento para discipuladores",
    cor: "#F59E0B",
    passos: 10,
  },
} as const

export type FaseNumero = keyof typeof FASES_INFO

export function getFaseNome(fase: number): string {
  return FASES_INFO[fase as FaseNumero]?.nome || "Fase Desconhecida"
}

export function getFaseInfo(fase: number) {
  return FASES_INFO[fase as FaseNumero]
}

export function getTotalPassosFase(fase: number, necessitaBatismo = false): number {
  if (fase === 1 && necessitaBatismo) {
    return 22
  }
  return FASES_INFO[fase as FaseNumero]?.passos || 10
}

export function isPassoBatismo(passo: number): boolean {
  return passo >= 11 && passo <= 22
}

export function getPassoNome(passo: number): string {
  if (isPassoBatismo(passo)) {
    const passoInfo = PASSOS_BATISMO[passo as keyof typeof PASSOS_BATISMO]
    return passoInfo?.titulo || `Passo ${passo}`
  }
  const passoInfo = PASSOS_EVANGELHO[passo as keyof typeof PASSOS_EVANGELHO]
  return passoInfo?.titulo || `Passo ${passo}`
}

export function getPassoNomeBatismo(passo: number): string {
  return getPassoNome(passo)
}

export function getPassoDescricao(passo: number): string {
  if (isPassoBatismo(passo)) {
    const passoInfo = PASSOS_BATISMO[passo as keyof typeof PASSOS_BATISMO]
    return passoInfo?.objetivo || "Descrição do passo"
  }
  const passoInfo = PASSOS_EVANGELHO[passo as keyof typeof PASSOS_EVANGELHO]
  return passoInfo?.objetivo || "Descrição do passo"
}

export function getRecompensaNome(passo: number): string {
  if (isPassoBatismo(passo)) {
    const nomes: Record<number, string> = {
      11: "Estudante do Batismo",
      12: "Defensor da Graça",
      13: "Estudioso da Fé",
      14: "Compreensor dos Símbolos",
      15: "Praticante da Verdade",
      16: "Conhecedor da Trindade",
      17: "Membro Comprometido",
      18: "Testemunha Corajosa",
      19: "Obediente Pronto",
      20: "Pronto para o Batismo",
      21: "Preparado para Testemunhar",
      22: "Aliança nas Águas",
    }
    return nomes[passo] || `Insígnia ${passo}`
  }

  const nomes: Record<number, string> = {
    1: "Criação",
    2: "Amor de Deus",
    3: "Consequência",
    4: "A Provisão Divina",
    5: "Cruz e Ressurreição",
    6: "Morte e Ressurreição",
    7: "Graça e Fé",
    8: "Arrependimento",
    9: "Cristo é Meu Senhor",
    10: "Novo Nascimento",
  }
  return nomes[passo] || `Insígnia ${passo}`
}

export const INSIGNIAS_BATISMO = {
  11: "Book", // Livro - Estudo bíblico
  12: "Shield", // Escudo - Defesa da graça
  13: "Users", // Pessoas - Quem pode ser batizado
  14: "RefreshCw", // Ciclo - Morte e ressurreição
  15: "Droplets", // Gotas - Imersão nas águas
  16: "Flame", // Chama - Trindade (3 pessoas)
  17: "Church", // Igreja - Comunidade
  18: "Megaphone", // Megafone - Testemunho público
  19: "Zap", // Raio - Urgência
  20: "Target", // Alvo - Preparação
  21: "PenTool", // Caneta - Testemunho escrito
  22: "Medal", // Medalha - Compromisso final
} as const

export function getIconeBatismo(passo: number): string {
  return INSIGNIAS_BATISMO[passo as keyof typeof INSIGNIAS_BATISMO] || "Sparkles"
}

export { PASSOS_EVANGELHO as PASSOS_CONTEUDO }
