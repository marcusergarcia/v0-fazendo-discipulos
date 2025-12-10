"use client"

import { useEffect, useState, useCallback } from "react"
import { PASSOS_CONTEUDO } from "@/constants/passos-conteudo"
import { RESUMOS_GERAIS_PASSOS } from "@/constants/resumos-gerais-passos"
import { getPerguntasPasso } from "@/constants/perguntas-passos"
import { createClient } from "@/lib/supabase/client"

interface PassoClientProps {
  numero: number
  passo: any
  discipulo: any
  progresso: any
  passosCompletados: number
  videosAssistidos: string[]
  artigosLidos: string[]
  status: string
  discipuladorId: string | null
  statusLeituraSemana?: "nao_iniciada" | "pendente" | "concluida"
  temaSemana?: string
  descricaoSemana?: string
  perguntasReflexivas?: any
  leiturasSemana?: Array<{ id: number }>
  capitulosLidos?: number[]
}

const PassoClient = ({
  numero,
  passo,
  discipulo,
  progresso,
  passosCompletados,
  videosAssistidos,
  artigosLidos,
  status,
  discipuladorId,
  statusLeituraSemana,
  temaSemana,
  descricaoSemana,
  perguntasReflexivas,
  leiturasSemana,
  capitulosLidos,
}: PassoClientProps) => {
  const [reflexoes, setReflexoes] = useState<any[]>([])
  const [modalAberto, setModalAberto] = useState(false)
  const [conteudoSelecionado, setConteudoSelecionado] = useState<any>(null)
  const [tipoConteudo, setTipoConteudo] = useState<"video" | "artigo">("video")
  const [resetando, setResetando] = useState(false)
  const [modalPerguntasAberto, setModalPerguntasAberto] = useState(false)

  const passoConteudo = PASSOS_CONTEUDO[numero]
  const resumoGeral = RESUMOS_GERAIS_PASSOS[numero]
  const perguntasReflexivasList = getPerguntasPasso(numero)

  useEffect(() => {
    async function carregarReflexoes() {
      const supabase = createClient()
      const { data } = await supabase
        .from("reflexoes_conteudo")
        .select("*")
        .eq("discipulo_id", discipulo.id)
        .eq("passo_numero", numero)

      if (data) {
        setReflexoes(data)
      }
    }

    carregarReflexoes()
  }, [discipulo.id, numero])

  const leituraBiblicaConcluida =
    statusLeituraSemana === "concluida" ||
    (numero === 1 || numero === 2 || numero === 3 || numero === 4 || numero === 5 || numero === 6
      ? statusLeituraSemana === "concluida"
      : true)

  const perguntasReflexivasAprovadas = perguntasReflexivas && perguntasReflexivas.situacao === "aprovada"

  const todasReflexoesAprovadas = useCallback(() => {
    const todosConteudos = [...(passo.videos || []), ...(passo.artigos || [])]

    const todasAprovadas = todosConteudos.every((conteudo) => {
      const reflexao = reflexoes.find((r) => r.conteudo_id === conteudo.id)
      return reflexao?.situacao === "aprovada"
    })

    const totalEsperado = (passo.videos?.length || 0) + (passo.artigos?.length || 0)

    return todasAprovadas && todosConteudos.length === totalEsperado
  }, [passo.videos, passo.artigos, reflexoes])

  const todasTarefasAprovadas = todasReflexoesAprovadas() && perguntasReflexivasAprovadas

  const podeReceberRecompensas =
    todasTarefasAprovadas && leituraBiblicaConcluida && status !== "concluida" && !perguntasReflexivas

  async function handleResetar() {}

  function abrirModalVideo(video: any) {}

  function abrirModalArtigo(artigo: any) {}

  async function handleSalvarReflexao(reflexao: string) {}

  function abrirModalPerguntas() {
    setModalPerguntasAberto(true)
  }

  return <div className="container mx-auto p-4 space-y-6">{/* ... existing JSX code ... */}</div>
}

export default PassoClient
