import { PASSOS_CONTEUDO } from "./passos-conteudo"
import { PASSOS_BATISMO } from "./passos-batismo"

export const FASES_INFO = {
  1: {
    nome: "O Evangelho",
    descricao: "Fundamentos da fé cristã e preparação para o batismo",
    cor: "#3B82F6",
    passos: 10, // Passos básicos, pode estender para 22 se necessita batismo
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
    return 22 // 10 passos do Evangelho + 12 passos de Batismo
  }
  return FASES_INFO[fase as FaseNumero]?.passos || 10
}

export function isPassoBatismo(passo: number): boolean {
  return passo >= 11 && passo <= 22
}

export function getPassoBatismoIndex(passo: number): number {
  return passo - 10 // passo 11 = chave 1, passo 12 = chave 2, etc.
}

export function getPassoNome(passo: number): string {
  if (isPassoBatismo(passo)) {
    const index = getPassoBatismoIndex(passo)
    const passoInfo = PASSOS_BATISMO[index as keyof typeof PASSOS_BATISMO]
    return passoInfo?.titulo || `Passo ${passo}`
  }
  const passoInfo = PASSOS_CONTEUDO[passo as keyof typeof PASSOS_CONTEUDO]
  return passoInfo?.titulo || `Passo ${passo}`
}

export function getPassoDescricao(passo: number): string {
  if (isPassoBatismo(passo)) {
    const index = getPassoBatismoIndex(passo)
    const passoInfo = PASSOS_BATISMO[index as keyof typeof PASSOS_BATISMO]
    return passoInfo?.objetivo || "Descrição do passo"
  }
  const passoInfo = PASSOS_CONTEUDO[passo as keyof typeof PASSOS_CONTEUDO]
  return passoInfo?.objetivo || "Descrição do passo"
}

export function getPassoNomeBatismo(index: number): string {
  const passoInfo = PASSOS_BATISMO[index as keyof typeof PASSOS_BATISMO]
  return passoInfo?.titulo || `Passo ${index}`
}

export function getRecompensaNome(passo: number): string {
  if (isPassoBatismo(passo)) {
    const index = getPassoBatismoIndex(passo)
    return getRecompensaBatismoNome(index)
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

export function getRecompensaBatismoNome(passo: number): string {
  const nomes: Record<number, string> = {
    1: "Estudante do Batismo",
    2: "Defensor da Graça",
    3: "Estudioso da Fé",
    4: "Compreensor dos Símbolos",
    5: "Praticante da Verdade",
    6: "Conhecedor da Trindade",
    7: "Membro Comprometido",
    8: "Testemunha Corajosa",
    9: "Obediente Pronto",
    10: "Pronto para o Batismo",
    11: "Preparado para Testemunhar",
    12: "Aliança nas Águas",
  }
  return nomes[passo] || `Insígnia ${passo}`
}
