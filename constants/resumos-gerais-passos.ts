import { RESUMOS_GERAIS_EVANGELHO } from "./resumos-gerais-evangelho"

export const RESUMOS_GERAIS_PASSOS = RESUMOS_GERAIS_EVANGELHO

export type ResumoGeralPasso = {
  titulo: string
  topicos: Array<{
    titulo: string
    descricao: string
  }>
}
