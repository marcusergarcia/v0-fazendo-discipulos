"use client"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"
import {
  salvarRascunho,
  enviarParaValidacao,
  concluirVideoComReflexao,
  concluirArtigoComReflexao,
  resetarProgresso,
  buscarReflexoesParaReset,
  receberRecompensasEAvancar,
  enviarPerguntasReflexivas,
} from "./actions"
import { useState, useEffect, useCallback, useMemo } from "react"
import { RESUMOS_CONTEUDO } from "@/constants/resumos-conteudo"
import { getPerguntasPasso } from "@/constants/perguntas-passos"

type PassoClientProps = {
  numero: number
  passo: any
  discipulo: any
  progresso: any
  passosCompletados: number
  videosAssistidos: string[]
  artigosLidos: string[]
  status: "pendente" | "aguardando" | "validado"
  discipuladorId: string | null
  statusLeituraSemana?: "nao_iniciada" | "pendente" | "concluida"
  temaSemana?: string
  descricaoSemana?: string
  respostaPerguntaHistorico?: any
  respostaMissaoHistorico?: any
  perguntasReflexivas?: any
  leiturasSemana?: any
  capitulosLidos?: string[]
  discipuloId: string
}

export default function PassoClient({
  numero,
  passo,
  discipulo,
  progresso,
  passosCompletados,
  videosAssistidos,
  artigosLidos,
  status,
  discipuladorId,
  statusLeituraSemana = "nao_iniciada",
  temaSemana = "",
  descricaoSemana = "",
  respostaPerguntaHistorico,
  respostaMissaoHistorico,
  perguntasReflexivas = null,
  leiturasSemana = [],
  capitulosLidos = [],
  discipuloId,
}: PassoClientProps) {
  const [mostrarCelebracao, setMostrarCelebracao] = useState(false)
  const [xpGanhoTotal, setXpGanhoTotal] = useState(0)

  const getRascunho = () => {
    if (!progresso?.rascunho_resposta) return { pergunta: "", missao: "" }
    try {
      return JSON.parse(progresso.rascunho_resposta)
    } catch {
      return { pergunta: "", missao: "" }
    }
  }

  const rascunho = getRascunho()

  const [respostaPergunta, setRespostaPergunta] = useState(
    respostaPerguntaHistorico?.situacao === "aprovado" ? respostaPerguntaHistorico.resposta : rascunho.pergunta || "",
  )
  const [respostaMissao, setRespostaMissao] = useState(
    respostaMissaoHistorico?.situacao === "aprovado" ? respostaMissaoHistorico.resposta : rascunho.missao || "",
  )

  const [modalAberto, setModalAberto] = useState(false)
  const [tipoConteudo, setTipoConteudo] = useState<"video" | "artigo">("video")
  const [conteudoId, setConteudoId] = useState<string>("")
  const [reflexao, setReflexao] = useState("")
  const [enviandoReflexao, setEnviandoReflexao] = useState(false)

  const [modalResetAberto, setModalResetAberto] = useState(false)
  const [resetando, setResetando] = useState(false)
  const [erroSenha, setErroSenha] = useState<string | null>(null)
  const [reflexoesParaExcluir, setReflexoesParaExcluir] = useState<any[]>([])
  const [perguntasReflexivasParaExcluir, setPerguntasReflexivasParaExcluir] = useState<any[]>([])
  const [carregandoReflexoes, setCarregandoReflexoes] = useState(false)
  const [processandoRecompensas, setProcessandoRecompensas] = useState(false)

  const [resumoAtual, setResumoAtual] = useState<string>("")
  const [respostasPerguntasReflexivas, setRespostasPerguntasReflexivas] = useState<string[]>([])
  const perguntasReflexivasList = getPerguntasPasso(numero)

  const [submissaoPerguntasReflexivas, setSubmissaoPerguntasReflexivas] = useState<any>(null)
  const [enviandoPerguntasReflexivas, setEnviandoPerguntasReflexivas] = useState(false)

  const [reflexoes, setReflexoes] = useState<any[]>([])

  useEffect(() => {
    const buscarSubmissaoPerguntasReflexivas = async () => {
      if (perguntasReflexivasList.length === 0) {
        return
      }

      try {
        const supabase = createClient()

        const { data, error } = await supabase
          .from("perguntas_reflexivas")
          .select("respostas, situacao, xp_ganho")
          .eq("discipulo_id", discipuloId)
          .eq("passo_numero", numero)
          .maybeSingle()

        if (error && error.code !== "PGRST116") {
          console.error("Erro ao buscar submissão:", error)
          return
        }

        if (data) {
          setSubmissaoPerguntasReflexivas(data)
          setRespostasPerguntasReflexivas(
            perguntasReflexivasList.map((_, i) => data.respostas?.[`pergunta${i + 1}`] || ""),
          )
        }
      } catch (error) {
        console.error("Erro ao buscar submissão:", error)
      }
    }

    buscarSubmissaoPerguntasReflexivas()
  }, [perguntasReflexivasList, discipuloId, numero])

  useEffect(() => {
    const verificarCelebracao = async () => {
      const supabase = createClient()

      console.log("[v0] Verificando celebração - status:", status, "discipuloId:", discipuloId, "numero:", numero)

      if (status === "validado") {
        const { data: progressoData, error } = await supabase
          .from("progresso_fases")
          .select("pontuacao_passo_atual, celebracao_vista, passo_atual")
          .eq("discipulo_id", discipuloId)
          .eq("passo_atual", numero)
          .single()

        console.log("[v0] Dados do progresso:", progressoData)
        console.log("[v0] Erro ao buscar progresso:", error)

        if (progressoData && !progressoData.celebracao_vista) {
          const xp = progressoData.pontuacao_passo_atual || 0
          console.log("[v0] Mostrando celebração! XP:", xp)
          setXpGanhoTotal(xp)
          setMostrarCelebracao(true)
        } else {
          console.log("[v0] Celebração já foi vista ou dados não encontrados")
        }
      } else {
        console.log("[v0] Status não é 'validado', é:", status)
      }
    }

    verificarCelebracao()
  }, [status, discipuloId, numero])

  const handleFecharCelebracao = async () => {
    const supabase = createClient()

    await supabase
      .from("progresso_fases")
      .update({ celebracao_vista: true })
      .eq("discipulo_id", discipuloId)
      .eq("passo_atual", numero)

    setMostrarCelebracao(false)
  }

  const handleEnviarPerguntasReflexivas = async () => {
    if (respostasPerguntasReflexivas.some((r, i) => i < perguntasReflexivasList.length && !r?.trim())) {
      toast({
        title: "Atenção",
        description: "Por favor, responda todas as perguntas reflexivas",
        variant: "destructive",
      })
      return
    }

    setEnviandoPerguntasReflexivas(true)

    try {
      const respostasObj: Record<string, string> = {}
      perguntasReflexivasList.forEach((_, index) => {
        respostasObj[`pergunta${index + 1}`] = respostasPerguntasReflexivas[index] || ""
      })

      const resultado = await enviarPerguntasReflexivas(numero, respostasObj, discipuloId)

      if (resultado.error) {
        throw new Error(resultado.error)
      }

      toast({
        title: "Sucesso!",
        description: "Respostas enviadas com sucesso! Aguardando aprovação do discipulador",
      })
      setRespostasPerguntasReflexivas([])

      setTimeout(() => window.location.reload(), 1500)
    } catch (error) {
      console.error("[v0] Erro ao enviar perguntas reflexivas:", error)
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao enviar respostas. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setEnviandoPerguntasReflexivas(false)
    }
  }

  const isPrMarcus = discipulo?.user_id === "f7ff6309-32a3-45c8-96a6-b76a687f2e7a"

  const todasReflexoesAprovadas = useCallback(() => {
    const todosConteudos = [...(passo.videos || []), ...(passo.artigos || [])]

    const todasAprovadas = todosConteudos.every((conteudo) => {
      return conteudo.reflexao_situacao === "aprovado"
    })

    const totalEsperado = (passo.videos?.length || 0) + (passo.artigos?.length || 0)

    return todasAprovadas && todosConteudos.length === totalEsperado
  }, [passo.videos, passo.artigos])

  const perguntasReflexivasEnviadas = perguntasReflexivas?.situacao === "enviado"
  const perguntasReflexivasAprovadas = perguntasReflexivas?.situacao === "aprovado"

  const todasTarefasAprovadas = todasReflexoesAprovadas() && perguntasReflexivasAprovadas

  const leituraBiblicaConcluida = useMemo(() => {
    if (!leiturasSemana || leiturasSemana.length === 0) return false

    const capitulosLidosIds = capitulosLidos || []
    const todosCapitulosLidos = leiturasSemana.every((capitulo) => capitulosLidosIds.includes(capitulo.id))

    return todosCapitulosLidos
  }, [leiturasSemana, capitulosLidos])

  const jaAvancou = discipulo.passo_atual > numero

  console.log("[v0] ===== PODE RECEBER RECOMPENSAS? =====")
  console.log("[v0] Passo:", numero)
  console.log("[v0] todasReflexoesAprovadas:", todasReflexoesAprovadas())
  console.log("[v0] perguntasReflexivas:", perguntasReflexivas)
  console.log("[v0] perguntasReflexivasAprovadas:", perguntasReflexivasAprovadas)
  console.log("[v0] todasTarefasAprovadas:", todasTarefasAprovadas)
  console.log("[v0] leituraBiblicaConcluida:", leituraBiblicaConcluida)
  console.log("[v0] status:", status)
  console.log("[v0] jaAvancou:", jaAvancou)
  console.log("[v0] discipulo.passo_atual:", discipulo.passo_atual)
  console.log("[v0] isPrMarcus:", isPrMarcus)

  const podeReceberRecompensas = useMemo(() => {
    if (isPrMarcus) return false
    if (jaAvancou) return false

    return todasTarefasAprovadas && leituraBiblicaConcluida && status !== "validado"
  }, [isPrMarcus, jaAvancou, todasTarefasAprovadas, leituraBiblicaConcluida, perguntasReflexivasAprovadas, status])

  const handleSalvarRascunho = async () => {
    const formData = new FormData()
    formData.append("resposta_pergunta", respostaPergunta)
    formData.append("resposta_missao", respostaMissao)
    await salvarRascunho(numero, formData)
  }

  const handleEnviarValidacao = async () => {
    const formData = new FormData()
    formData.append("resposta_pergunta", respostaPergunta)
    formData.append("resposta_missao", respostaMissao)

    try {
      await enviarParaValidacao(numero, formData)
    } catch (error: any) {
      alert(error.message || "Erro ao enviar respostas")
    }
  }

  const temProgressoParaResetar = () => {
    const temVideos = videosAssistidos.length > 0
    const temArtigos = artigosLidos.length > 0
    const temPerguntas = perguntasReflexivas && perguntasReflexivas.length > 0

    return temVideos || temArtigos || temPerguntas
  }

  const handleResetarProgresso = async () => {
    setCarregandoReflexoes(true)
    setErroSenha(null)

    try {
      const resultado = await buscarReflexoesParaReset(numero, discipulo.id)

      console.log("[v0] Resultado da busca:", resultado)
      console.log("[v0] Grupos resetáveis:", resultado.gruposResetaveis)

      setReflexoesParaExcluir(resultado.reflexoes)
      setPerguntasReflexivasParaExcluir(resultado.perguntasReflexivas)

      const { videos, artigos, perguntas } = resultado.gruposResetaveis
      const temAlgoParaResetar = videos || artigos || perguntas

      if (!temAlgoParaResetar) {
        setErroSenha("Não há progresso para resetar. Todos os grupos já foram aprovados ou estão vazios.")
      }

      setModalResetAberto(true)
    } catch (error: any) {
      console.error("ERRO ao buscar reflexões:", error)
      console.error("Stack:", error.stack)
      setErroSenha(`Erro ao carregar reflexões: ${error.message}`)
      setModalResetAberto(true)
    } finally {
      setCarregandoReflexoes(false)
    }
  }

  const confirmarReset = async () => {
    setResetando(true)
    setErroSenha(null)

    try {
      const reflexoesIds = reflexoesParaExcluir.map((r) => r.id)
      const perguntasIdsUnicos = [
        ...new Set(perguntasReflexivasParaExcluir.map((p) => p.id).filter((id) => id !== undefined)),
      ]

      const resultado = await resetarProgresso(numero, reflexoesIds, perguntasIdsUnicos, discipuloId)
      if (resultado.success) {
        setModalResetAberto(false)
        window.location.href = `/dashboard/passo/${numero}?reset=true`
      } else {
        setErroSenha("Erro ao resetar progresso")
        setResetando(false)
      }
    } catch (error) {
      console.error("ERRO:", error)
      setErroSenha(error.message || "Erro ao resetar progresso")
      setResetando(false)
    }
  }

  const abrirModal = useCallback(
    (tipo: "video" | "artigo", id: string) => {
      setTipoConteudo(tipo)
      setConteudoId(id)
      setModalAberto(true)

      const chave = `passo${numero}-${tipo}-${id}`
      const resumo = RESUMOS_CONTEUDO[chave]

      if (resumo) {
        setResumoAtual(resumo)
      } else {
        setResumoAtual("")
      }
    },
    [numero],
  )

  const enviarReflexao = async (reflexaoText: string) => {
    if (!reflexaoText.trim() || reflexaoText.trim().length < 20) {
      toast({
        title: "Atenção",
        description: "Por favor, escreva uma reflexão de pelo menos 20 caracteres",
        variant: "destructive",
      })
      return
    }

    if (enviandoReflexao) return

    setEnviandoReflexao(true)
    try {
      let result
      if (tipoConteudo === "video") {
        const video = passo.videos.find((v) => v.id === conteudoId)
        result = await concluirVideoComReflexao(numero, conteudoId, video?.titulo || "Vídeo", reflexaoText, discipuloId)
      } else {
        const artigo = passo.artigos.find((a) => a.id === conteudoId)
        result = await concluirArtigoComReflexao(
          numero,
          conteudoId,
          artigo?.titulo || "Artigo",
          reflexaoText,
          discipuloId,
        )
      }

      toast({ title: "Sucesso!", description: "Sua reflexão foi enviada com sucesso!" })
      setModalAberto(false)
      setReflexao("")

      window.location.reload()
    } catch (error) {
      console.error("Erro ao enviar reflexão:", error)
      toast({ title: "Erro", description: "Erro ao enviar reflexão. Tente novamente.", variant: "destructive" })
    } finally {
      setEnviandoReflexao(false)
    }
  }

  const handleReceberRecompensas = async () => {
    if (!confirm("Deseja receber suas recompensas e avançar para o próximo passo?")) {
      return
    }

    setProcessandoRecompensas(true)

    try {
      const resultado = await receberRecompensasEAvancar(numero, discipuloId)

      if (resultado.success) {
        toast({
          title: "Recompensas recebidas!",
          description: resultado.message || "Você avançou para o próximo passo!",
        })

        setTimeout(() => {
          const proximoPasso = numero === 10 ? 1 : numero + 1
          window.location.href = `/dashboard/passo/${proximoPasso}`
        }, 500)
      } else {
        toast({
          title: "Erro ao receber recompensas",
          description: resultado.error || "Tente novamente.",
          variant: "destructive",
        })
        setProcessandoRecompensas(false)
      }
    } catch (error) {
      console.error("Erro ao receber recompensas:", error)
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao processar. Tente novamente.",
        variant: "destructive",
      })
      setProcessandoRecompensas(false)
    }
  }

  const todasReflexoesCompletadas = useCallback(() => {
    const todosConteudos = [...(passo.videos || []), ...(passo.artigos || [])]

    if (todosConteudos.length === 0) return false

    const todasCompletadas = todosConteudos.every(
      (conteudo) => conteudo.reflexao_situacao !== null && conteudo.reflexao_situacao !== undefined,
    )

    const totalEsperado = (passo.videos?.length || 0) + (passo.artigos?.length || 0)
    return todasCompletadas && todosConteudos.length === totalEsperado
  }, [passo.videos, passo.artigos])

  return <div className="min-h-screen bg-background"></div>
}
