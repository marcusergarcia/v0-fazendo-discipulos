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
    passos: 10,
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
