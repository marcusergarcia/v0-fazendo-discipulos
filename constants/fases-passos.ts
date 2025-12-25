import { PASSOS_CONTEUDO } from "./passos-conteudo"
import { PASSOS_BATISMO } from "./passos-batismo"

export const FASES_INFO = {
  1: {
    nome: "O Evangelho",
    descricao: "Fundamentos da fé cristã",
    cor: "#3B82F6",
    passos: 10,
  },
  2: {
    nome: "Batismo Cristão",
    descricao: "Preparação para o batismo bíblico",
    cor: "#06B6D4",
    passos: 12, // Changed from 10 to 12
    intermediaria: true,
  },
  3: {
    nome: "Armadura de Deus",
    descricao: "Guerra espiritual e proteção",
    cor: "#8B5CF6",
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

export function isFaseIntermediaria(fase: number): boolean {
  return FASES_INFO[fase as FaseNumero]?.intermediaria || false
}

export function getPassoNome(passo: number): string {
  const passoInfo = PASSOS_CONTEUDO[passo as keyof typeof PASSOS_CONTEUDO]
  return passoInfo?.titulo || `Passo ${passo}`
}

export function getPassoBatismoNome(passo: number): string {
  const passoInfo = PASSOS_BATISMO[passo as keyof typeof PASSOS_BATISMO]
  return passoInfo?.titulo || `Passo ${passo}`
}

export function getPassoBatismoDescricao(passo: number): string {
  const passoInfo = PASSOS_BATISMO[passo as keyof typeof PASSOS_BATISMO]
  return passoInfo?.objetivo || "Descrição do passo"
}

export function getPassoDescricao(passo: number): string {
  const passoInfo = PASSOS_CONTEUDO[passo as keyof typeof PASSOS_CONTEUDO]
  return passoInfo?.objetivo || "Descrição do passo"
}

export function getRecompensaNome(passo: number): string {
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
