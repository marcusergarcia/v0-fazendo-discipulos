"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  ArrowLeft,
  BookOpen,
  Sparkles,
  Award,
  Target,
  Send,
  MessageCircle,
  Clock,
  Play,
  ExternalLink,
  RotateCcw,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Home,
} from "lucide-react"
import Link from "next/link"
// import { supabase } from "@/lib/supabase"
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
  enviarPerguntasReflexivas, // Importar a nova server action
} from "./actions"
import { useState, useEffect, useCallback, useMemo } from "react"
import { TextWithBibleLinks } from "@/components/text-with-bible-links"
import { RESUMOS_CONTEUDO } from "@/constants/resumos-conteudo"
import { getPerguntasPasso } from "@/constants/perguntas-passos"
import { RESUMOS_GERAIS_PASSOS } from "@/constants/resumos-gerais-passos"
import { ModalCelebracaoPasso } from "@/components/modal-celebracao-passo"

// Removed: let supabaseInstance: ReturnType<typeof createClient> | null = null
// Removed: const getSupabaseClient = () => {
// Removed:   if (!supabaseInstance) {
// Removed:     supabaseInstance = createClient()
// Removed:   }
// Removed:   return supabaseInstance
// Removed: }

type PassoClientProps = {
  numero: number
  passo: any
  discipulo: any
  progresso: any
  passosCompletados: number
  videosAssistidos: string[]
  artigosLidos: string[]
  status: "pendente" | "aguardando" | "validado"
  discipuladorId: string | null // Adicionar discipuladorId
  statusLeituraSemana?: "nao_iniciada" | "pendente" | "concluida"
  temaSemana?: string
  descricaoSemana?: string
  respostaPerguntaHistorico?: any
  respostaMissaoHistorico?: any
  perguntasReflexivas?: any
  leiturasSemana?: any // Adicionar leiturasSemana
  capitulosLidos?: string[] // Adicionar capitulosLidos
  discipuloId: string // Added discipuloId prop
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
  perguntasReflexivas = null, // Inicializar com null para evitar erro se não for passado
  leiturasSemana = [], // Inicializar com array vazio
  capitulosLidos = [], // Inicializar com array vazio
  discipuloId, // Destructure discipuloId
}: PassoClientProps) {
  const supabase = createClient()

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
  const [perguntasReflexivasParaExcluir, setPerguntasReflexivasParaExcluir] = useState<any[]>([]) // Adicionar estado para perguntas reflexivas
  const [carregandoReflexoes, setCarregandoReflexoes] = useState(false)
  const [processandoRecompensas, setProcessandoRecompensas] = useState(false)

  const [resumoAtual, setResumoAtual] = useState<string>("")
  const [respostasPerguntasReflexivas, setRespostasPerguntasReflexivas] = useState<string[]>([])
  const perguntasReflexivasList = getPerguntasPasso(numero)

  // State for submissaoPerguntasReflexivas
  const [submissaoPerguntasReflexivas, setSubmissaoPerguntasReflexivas] = useState<any>(null) // Initialize with null
  const [enviandoPerguntasReflexivas, setEnviandoPerguntasReflexivas] = useState(false) // Initialize with false

  // Store the fetched reflexoes in state
  const [reflexoes, setReflexoes] = useState<any[]>([])

  useEffect(() => {
    const carregarReflexoes = async () => {
      const { data } = await supabase
        .from("reflexoes_passo")
        .select("*")
        .eq("discipulo_id", discipulo.id)
        .eq("passo_numero", numero)

      if (data) {
        setReflexoes(data)
      }
    }

    carregarReflexoes()
  }, [discipulo.id, numero, supabase])

  useEffect(() => {
    const buscarSubmissaoPerguntasReflexivas = async () => {
      if (perguntasReflexivasList.length === 0) {
        return
      }

      try {
        const supabase = createClient()

        const { data, error } = await supabase
          .from("perguntas_reflexivas")
          .select("respostas, situacao, xp_ganho") // Adicionar xp_ganho
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

      // Verifica se o passo atual foi validado e celebração ainda não foi vista
      if (status === "validado") {
        const { data: progressoData, error } = await supabase
          .from("progresso_fases")
          .select("pontuacao_passo_atual, celebracao_vista, passo_atual")
          .eq("discipulo_id", discipuloId)
          .eq("passo_atual", numero)
          .single()

        console.log("[v0] Dados do progresso:", progressoData)
        console.log("[v0] Erro ao buscar progresso:", error)

        // Se a celebração ainda não foi vista, mostra o modal
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

    // Atualiza a flag no banco de dados
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

      // Recarregar página para atualizar status
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
    if (isPrMarcus) return false // Pr. Marcus has a different flow
    if (jaAvancou) return false // If already advanced, cannot receive rewards again

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

  const handleResetarProgresso = async () => {
    setCarregandoReflexoes(true)
    setErroSenha(null)

    try {
      const resultado = await buscarReflexoesParaReset(numero, discipulo.id)
      setReflexoesParaExcluir(resultado.reflexoes)
      const perguntasExpandidas = resultado.perguntasReflexivas.flatMap((pr) => {
        if (Array.isArray(pr.respostas)) {
          return pr.respostas.map((resposta, index) => ({
            ...pr,
            id: pr.id,
            perguntaIndex: index + 1,
            respostaIndividual: resposta,
            situacaoIndividual: resposta.situacao || "pendente",
          }))
        }
        return [pr]
      })
      setPerguntasReflexivasParaExcluir(perguntasExpandidas)
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

      const resultado = await resetarProgresso(numero, reflexoesIds, perguntasIdsUnicos, discipulo.id)
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

  const temProgressoParaResetar = () => {
    const temVideos = videosAssistidos.length > 0
    const temArtigos = artigosLidos.length > 0
    const temResposta = progresso?.rascunho_resposta // Check for draft, not necessarily submitted answer
    return temVideos || temArtigos || temResposta
  }

  const handleReceberRecompensas = async () => {
    if (!confirm("Deseja receber suas recompensas e avançar para o próximo passo?")) {
      return
    }

    setProcessandoRecompensas(true)

    try {
      // Se for Pr. Marcus, aprovar automaticamente primeiro
      if (isPrMarcus) {
        const { error: aprovacaoError } = await supabase.rpc("aprovar_tarefas_pr_marcus", {
          p_fase_numero: 1,
          p_passo_numero: numero,
        })

        if (aprovacaoError) {
          console.error("Erro ao aprovar tarefas:", aprovacaoError)
          toast({
            title: "Erro ao processar aprovações",
            description: "Tente novamente ou contate o suporte.",
            variant: "destructive",
          })
          setProcessandoRecompensas(false)
          return
        }
      }

      // Chamar a função de receber recompensas (atualiza XP e avança)
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

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="flex-1">
                <h1 className="text-lg sm:text-xl font-bold">{passo.fase}</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Passo {numero} de 10 • Nível: {discipulo.nivel_atual}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge className="bg-accent/10 text-accent border-accent/20 self-start sm:self-auto">
                <Award className="w-3 h-3 mr-1" />
                {progresso?.pontuacao_passo_atual || 0} XP ganhos
              </Badge>
              <Badge className="bg-primary/10 text-primary border-primary/20 self-start sm:self-auto">
                <Target className="w-3 h-3 mr-1" />+{passo.xp} XP disponível
              </Badge>
            </div>
          </div>
          <Progress value={(passosCompletados / 10) * 100} className="h-1 mt-3" />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 text-center">
          <div className="text-6xl mb-4">{passo.icone}</div>
          <h2 className="text-4xl font-bold mb-2">
            PASSO {numero} – {passo.titulo}
          </h2>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl font-bold">
              <BookOpen className="h-6 w-6 text-primary" />
              Objetivo do Passo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium mb-4">{passo.objetivo}</p>
            <div className="space-y-3">
              {passo.conteudo.map((linha: string, i: number) => (
                <p key={i} className="leading-relaxed text-base">
                  <TextWithBibleLinks text={linha} />
                </p>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Versículo Destaque */}
        <Card className="mb-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Versículo Destaque
            </CardTitle>
          </CardHeader>
          <CardContent>
            {passo.versiculos.map((v: any, i: number) => (
              <div key={i} className="space-y-2">
                <p className="text-xl italic leading-relaxed font-medium">"{v.texto}"</p>
                <p className="text-sm font-semibold text-primary">
                  — <TextWithBibleLinks text={v.referencia} />
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Leitura Bíblica Semanal */}
        {(numero === 1 || numero === 2 || numero === 3 || numero === 4 || numero === 5 || numero === 6) && (
          <Card className="mb-6 border-2 border-primary/20">
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <CardTitle className="flex-1 text-xl">
                  📖 Leitura Bíblica Semanal <Badge className="ml-2">Semana {numero}</Badge>
                </CardTitle>
                <CardDescription>Parte do plano de leitura em 1 ano — complete para avançar!</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {numero === 1 && (
                  <>
                    <div className="rounded-lg bg-card border p-4">
                      <h4 className="font-semibold text-lg mb-2">{temaSemana || "O Verbo que se fez carne"}</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        {descricaoSemana ||
                          "Comece conhecendo Jesus através do Evangelho de João. Descubra quem Ele é e por que Ele veio ao mundo."}
                      </p>
                      <div className="flex items-center gap-2 text-sm">
                        <Badge variant="outline" className="font-mono">
                          João 1-7
                        </Badge>
                        <span className="text-muted-foreground">7 capítulos</span>
                      </div>
                    </div>
                    {statusLeituraSemana === "concluida" ? (
                      <div className="rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 p-4">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-semibold text-green-900 dark:text-green-100 mb-1">
                              Parabéns! Leitura concluída 🎉
                            </p>
                            <p className="text-sm text-green-700 dark:text-green-300">
                              Continue se alimentando da Palavra de Deus diariamente. Sua jornada está apenas começando!
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Link href="/dashboard/leitura-biblica?semana=1">
                        <Button className="w-full" variant="default">
                          <BookOpen className="w-4 h-4 mr-2" />
                          {statusLeituraSemana === "pendente"
                            ? "Continuar Leitura da Semana 1"
                            : "Iniciar Leitura da Semana 1"}
                        </Button>
                      </Link>
                    )}
                  </>
                )}
                {numero === 2 && (
                  <>
                    <div className="rounded-lg bg-card border p-4">
                      <h4 className="font-semibold text-lg mb-2">{temaSemana || "Sinais e ensinamentos de Jesus"}</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        {descricaoSemana ||
                          "Continue em João e veja os milagres e ensinamentos que revelam o amor de Deus por nós."}
                      </p>
                      <div className="flex items-center gap-2 text-sm">
                        <Badge variant="outline" className="font-mono">
                          João 8-14
                        </Badge>
                        <span className="text-muted-foreground">7 capítulos</span>
                      </div>
                    </div>
                    {statusLeituraSemana === "concluida" ? (
                      <div className="rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 p-4">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-semibold text-green-900 dark:text-green-100 mb-1">
                              Maravilhoso! Mais uma semana concluída 🎉
                            </p>
                            <p className="text-sm text-green-700 dark:text-green-300">
                              Você está se aprofundando na Palavra! Que Deus continue iluminando sua mente e coração.
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Link href="/dashboard/leitura-biblica?semana=2">
                        <Button className="w-full" variant="default">
                          <BookOpen className="w-4 h-4 mr-2" />
                          {statusLeituraSemana === "pendente"
                            ? "Continuar Leitura da Semana 2"
                            : "Iniciar Leitura da Semana 2"}
                        </Button>
                      </Link>
                    )}
                  </>
                )}
                {numero === 3 && (
                  <>
                    <div className="rounded-lg bg-card border p-4">
                      <h4 className="font-semibold text-lg mb-2">{temaSemana || "Promessas e despedida de Jesus"}</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        {descricaoSemana ||
                          "Conheça as últimas palavras de Jesus aos discípulos, Sua ressurreição e promessa do Espírito Santo."}
                      </p>
                      <div className="flex items-center gap-2 text-sm">
                        <Badge variant="outline" className="font-mono">
                          João 15-21
                        </Badge>
                        <span className="text-muted-foreground">7 capítulos</span>
                      </div>
                    </div>
                    {statusLeituraSemana === "concluida" ? (
                      <div className="rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 p-4">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-semibold text-green-900 dark:text-green-100 mb-1">
                              Maravilhoso! Você completou o Evangelho de João! 🎉
                            </p>
                            <p className="text-sm text-green-700 dark:text-green-300">
                              Agora você conhece a história completa de Jesus em João. Continue crescendo na fé!
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Link href="/dashboard/leitura-biblica?semana=3">
                        <Button className="w-full" variant="default">
                          <BookOpen className="w-4 h-4 mr-2" />
                          {statusLeituraSemana === "pendente"
                            ? "Continuar Leitura da Semana 3"
                            : "Iniciar Leitura da Semana 3"}
                        </Button>
                      </Link>
                    )}
                  </>
                )}
                {numero === 4 && (
                  <>
                    <div className="rounded-lg bg-card border p-4">
                      <h4 className="font-semibold text-lg mb-2">{temaSemana || "Jesus em ação"}</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        {descricaoSemana ||
                          "Comece a ler o Evangelho de Marcos e veja Jesus demonstrando Seu poder e autoridade através de milagres e ensinamentos."}
                      </p>
                      <div className="flex items-center gap-2 text-sm">
                        <Badge variant="outline" className="font-mono">
                          Marcos 1-8
                        </Badge>
                        <span className="text-muted-foreground">8 capítulos</span>
                      </div>
                    </div>
                    {statusLeituraSemana === "concluida" ? (
                      <div className="rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 p-4">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-semibold text-green-900 dark:text-green-100 mb-1">
                              Incrível! Você completou a leitura da semana 4! 🎉
                            </p>
                            <p className="text-sm text-green-700 dark:text-green-300">
                              Você viu Jesus em ação! Continue descobrindo mais sobre Seu ministério e poder.
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Link href="/dashboard/leitura-biblica?semana=4">
                        <Button className="w-full" variant="default">
                          <BookOpen className="w-4 h-4 mr-2" />
                          {statusLeituraSemana === "pendente"
                            ? "Continuar Leitura da Semana 4"
                            : "Iniciar Leitura da Semana 4"}
                        </Button>
                      </Link>
                    )}
                  </>
                )}
                {numero === 5 && (
                  <>
                    <div className="rounded-lg bg-card border p-4">
                      <h4 className="font-semibold text-lg mb-2">{temaSemana || "Jesus em ação - Parte 2"}</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        {descricaoSemana ||
                          "Acompanhe a jornada de Jesus até a cruz, Sua morte, ressurreição e a comissão final aos discípulos."}
                      </p>
                      <div className="flex items-center gap-2 text-sm">
                        <Badge variant="outline" className="font-mono">
                          Marcos 9-16
                        </Badge>
                        <span className="text-muted-foreground">8 capítulos</span>
                      </div>
                    </div>
                    {statusLeituraSemana === "concluida" ? (
                      <div className="rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 p-4">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-semibold text-green-900 dark:text-green-100 mb-1">
                              Parabéns! Você completou o Evangelho de Marcos! 🎉
                            </p>
                            <p className="text-sm text-green-700 dark:text-green-300">
                              Você testemunhou a cruz, a ressurreição e o poder transformador de Cristo! Continue firme
                              na jornada.
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Link href="/dashboard/leitura-biblica?semana=5">
                        <Button className="w-full" variant="default">
                          <BookOpen className="w-4 h-4 mr-2" />
                          {statusLeituraSemana === "pendente"
                            ? "Continuar Leitura da Semana 5"
                            : "Iniciar Leitura da Semana 5"}
                        </Button>
                      </Link>
                    )}
                  </>
                )}
                {/* Step 6 weekly reading section */}
                {numero === 6 && (
                  <>
                    <div className="rounded-lg bg-card border p-4">
                      <h4 className="font-semibold text-lg mb-2">
                        {temaSemana || "Jesus, o Messias prometido - Parte 1"}
                      </h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        {descricaoSemana || "Jesus cumpre as profecias e ensina com autoridade"}
                      </p>
                      <div className="flex items-center gap-2 text-sm">
                        <Badge variant="outline" className="font-mono">
                          Mateus 1-14
                        </Badge>
                        <span className="text-muted-foreground">14 capítulos</span>
                      </div>
                    </div>
                    {statusLeituraSemana === "concluida" ? (
                      <div className="rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 p-4">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-semibold text-green-900 dark:text-green-100 mb-1">
                              Excelente! Você começou a conhecer o Evangelho de Mateus! 🎉
                            </p>
                            <p className="text-sm text-green-700 dark:text-green-300">
                              Continue descobrindo Jesus como o Messias prometido que cumpre as profecias e ensina com
                              autoridade.
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Link href="/dashboard/leitura-biblica?semana=6">
                        <Button className="w-full" variant="default">
                          <BookOpen className="w-4 h-4 mr-2" />
                          {statusLeituraSemana === "pendente"
                            ? "Continuar Leitura da Semana 6"
                            : "Iniciar Leitura da Semana 6"}
                        </Button>
                      </Link>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Vídeos Educacionais */}
        {passo.videos && passo.videos.length > 0 && (
          <Card className="mb-6 border-accent/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Play className="w-5 h-5 text-accent" />
                    Assista e Aprenda
                  </CardTitle>
                  <CardDescription>Vídeos selecionados para sua jornada espiritual</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {(passo.videos || []).map((video: any) => {
                const assistido = videosAssistidos.includes(video.id)
                const temReflexao = video.reflexao_situacao !== null && video.reflexao_situacao !== undefined
                const reflexaoAprovada = video.reflexao_situacao === "aprovado"
                const reflexaoPendente = video.reflexao_situacao === "enviado"

                return (
                  <div
                    key={video.id}
                    className={`flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 p-2 sm:p-4 rounded-lg border transition-all ${
                      assistido ? "bg-accent/10 border-accent" : "bg-muted/50 border-border"
                    }`}
                  >
                    <div className="flex-1 w-full sm:w-auto min-w-0">
                      <h4 className="font-semibold text-sm sm:text-base mb-1 truncate">{video.titulo}</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {video.canal} • {video.duracao}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(video.url, "_blank")}
                        className="w-full sm:w-auto whitespace-nowrap"
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Assistir
                      </Button>
                      {reflexaoAprovada ? (
                        <Badge className="bg-green-600 text-white justify-center sm:justify-start whitespace-nowrap">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Aprovado {video.reflexao_xp}XP
                        </Badge>
                      ) : reflexaoPendente ? (
                        <Badge className="bg-yellow-600 text-white justify-center sm:justify-start whitespace-nowrap">
                          <Clock className="w-3 h-3 mr-1" />
                          Aguardando Aprovação
                        </Badge>
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => abrirModal("video", video.id)}
                          className="bg-primary w-full sm:w-auto whitespace-nowrap"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Realizar Missão
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        )}

        {/* Artigos Educacionais */}
        {passo.artigos && passo.artigos.length > 0 && (
          <Card className="mb-6 border-secondary/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-secondary" />
                    Leia e Entenda
                  </CardTitle>
                  <CardDescription>Artigos e recursos para estudo complementar</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {(passo.artigos || []).map((artigo: any) => {
                const lido = artigosLidos.includes(artigo.id)
                const temReflexao = artigo.reflexao_situacao !== null && artigo.reflexao_situacao !== undefined
                const reflexaoAprovada = artigo.reflexao_situacao === "aprovado"
                const reflexaoPendente = artigo.reflexao_situacao === "enviado"

                return (
                  <div
                    key={artigo.id}
                    className={`flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border transition-all ${
                      lido ? "bg-accent/10 border-accent" : "bg-muted/50 border-border"
                    }`}
                  >
                    <div className="flex-1 w-full sm:w-auto">
                      <h4 className="font-semibold text-sm sm:text-base mb-1">{artigo.titulo}</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground">{artigo.fonte}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(artigo.url, "_blank")}
                        className="w-full sm:w-auto"
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Ler
                      </Button>
                      {reflexaoAprovada ? (
                        <Badge className="bg-green-600 text-white justify-center sm:justify-start">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Aprovado {artigo.reflexao_xp}XP
                        </Badge>
                      ) : reflexaoPendente ? (
                        <Badge className="bg-yellow-600 text-white justify-center sm:justify-start">
                          <Clock className="w-3 h-3 mr-1" />
                          Aguardando Aprovação
                        </Badge>
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => abrirModal("artigo", artigo.id)}
                          className="bg-primary w-full sm:w-auto"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Realizar Missão
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        )}

        {todasReflexoesCompletadas() && (
          <>
            {RESUMOS_GERAIS_PASSOS[numero as keyof typeof RESUMOS_GERAIS_PASSOS] && (
              <Card className="mb-6 border-primary/50 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-primary" />
                    {RESUMOS_GERAIS_PASSOS[numero as keyof typeof RESUMOS_GERAIS_PASSOS].titulo}
                  </CardTitle>
                  <CardDescription>
                    Parabéns! Você completou todas as reflexões. Aqui está um resumo do que aprendemos:
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {RESUMOS_GERAIS_PASSOS[numero as keyof typeof RESUMOS_GERAIS_PASSOS].topicos.map(
                      (topico, index) => (
                        <div key={index} className="p-4 rounded-lg bg-background border border-primary/20">
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-primary" />
                            {topico.titulo}
                          </h4>
                          <p className="text-sm text-muted-foreground">{topico.descricao}</p>
                        </div>
                      ),
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Perguntas Reflexivas */}
            {perguntasReflexivasList.length > 0 && (
              <Card className="mb-6 border-amber-200 bg-amber-50/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-900">
                    <MessageCircle className="h-5 w-5" />
                    Perguntas Reflexivas
                  </CardTitle>
                  <CardDescription className="text-amber-700">
                    {submissaoPerguntasReflexivas?.situacao === "enviado"
                      ? "Suas respostas foram enviadas e estão aguardando aprovação do discipulador"
                      : submissaoPerguntasReflexivas?.situacao === "aprovado"
                        ? "Suas respostas foram aprovadas! Parabéns!"
                        : "Reflita profundamente sobre o que você aprendeu e responda às perguntas abaixo"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {submissaoPerguntasReflexivas ? (
                    <div className="space-y-4">
                      {submissaoPerguntasReflexivas.situacao === "enviado" && (
                        <div className="bg-amber-100 border border-amber-300 rounded-lg p-4 flex items-center gap-3">
                          <Clock className="h-5 w-5 text-amber-600" />
                          <div>
                            <p className="font-medium text-amber-900">Aguardando Aprovação</p>
                            <p className="text-sm text-amber-700">
                              Suas respostas foram enviadas e estão sendo analisadas pelo discipulador.
                            </p>
                          </div>
                        </div>
                      )}

                      {submissaoPerguntasReflexivas.situacao === "aprovado" && (
                        <div className="bg-green-100 border border-green-300 rounded-lg p-4 flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="font-medium text-green-900">
                              Respostas Aprovadas! +{submissaoPerguntasReflexivas.xp_ganho} XP
                            </p>
                            <p className="text-sm text-green-700">
                              Suas respostas foram aprovadas pelo discipulador. Continue para o próximo desafio!
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="space-y-4">
                        <p className="text-sm font-medium text-amber-900">Suas respostas:</p>
                        {perguntasReflexivasList.map((pergunta, index) => {
                          const respostas = Array.isArray(submissaoPerguntasReflexivas?.respostas)
                            ? submissaoPerguntasReflexivas.respostas
                            : []
                          const respostaSalva = respostas.find(
                            (r: { resposta: string; pergunta_id: number }) => r.pergunta_id === index + 1,
                          )

                          return (
                            <div key={index} className="bg-white rounded-lg p-4 border border-amber-200">
                              <p className="text-xs font-medium text-amber-700 mb-2">
                                Pergunta {index + 1}: {pergunta}
                              </p>
                              {respostaSalva ? (
                                <p className="text-sm text-gray-700">{respostaSalva.resposta}</p>
                              ) : (
                                <p className="text-sm text-gray-400 italic">Resposta não enviada</p>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ) : (
                    <>
                      {perguntasReflexivasList.map((pergunta, index) => (
                        <div key={index} className="space-y-3">
                          <label className="text-sm font-medium text-amber-900 block">
                            {index + 1}. {pergunta}
                          </label>
                          <Textarea
                            placeholder="Digite sua resposta aqui..."
                            value={respostasPerguntasReflexivas[index] || ""}
                            onChange={(e) => {
                              const novasRespostas = [...respostasPerguntasReflexivas]
                              novasRespostas[index] = e.target.value
                              setRespostasPerguntasReflexivas(novasRespostas)
                            }}
                            className="min-h-[120px] bg-white border-amber-200 focus:border-amber-400"
                          />
                        </div>
                      ))}

                      <Button
                        className="w-full bg-amber-600 hover:bg-amber-700"
                        disabled={
                          enviandoPerguntasReflexivas ||
                          respostasPerguntasReflexivas.some((r, i) => i < perguntasReflexivasList.length && !r?.trim())
                        }
                        onClick={handleEnviarPerguntasReflexivas}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        {enviandoPerguntasReflexivas ? "Enviando..." : "Enviar Respostas Reflexivas"}
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        )}

        {todasReflexoesCompletadas() &&
          ((passo.videos && passo.videos.length > 0) || (passo.artigos && passo.artigos.length > 0)) &&
          temProgressoParaResetar() &&
          !todasReflexoesAprovadas() && (
            <div className="mb-6 flex justify-end">
              <Button type="button" variant="outline" onClick={handleResetarProgresso} disabled={carregandoReflexoes}>
                <RotateCcw className="w-4 h-4 mr-2" />
                {carregandoReflexoes ? "Carregando..." : "Resetar Progresso do Passo"}
              </Button>
            </div>
          )}

        {/* Seção removida: Card "Suas Respostas" com pergunta única e missão */}

        {/* O sistema agora avança automaticamente quando o discipulador aprovar todas as tarefas */}

        {discipuladorId ? (
          <Link href={`/dashboard/chat/com/${discipuladorId}`}>
            <Button type="button" variant="outline" size="lg" className="w-full bg-transparent">
              <MessageCircle className="w-4 h-4 mr-2" />
              Conversar com meu discipulador
            </Button>
          </Link>
        ) : (
          <Link href={`/dashboard/chat`}>
            <Button type="button" variant="outline" size="lg" className="w-full bg-transparent">
              <MessageCircle className="w-4 h-4 mr-2" />
              Conversar com meu discipulador
            </Button>
          </Link>
        )}
      </div>

      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Missão Cumprida! 🎯</DialogTitle>
            <DialogDescription>
              Compartilhe sua reflexão sobre o {tipoConteudo === "video" ? "vídeo" : "artigo"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {resumoAtual && (
              <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-sm mb-2 text-primary">Resumo do Conteúdo:</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{resumoAtual}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="reflexao">Sua Reflexão</Label>
              <Textarea
                id="reflexao"
                placeholder="O que você aprendeu? Como isso impacta sua vida?"
                className="min-h-32"
                value={reflexao}
                onChange={(e) => setReflexao(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">Mínimo de 20 caracteres • {reflexao.length}/20</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalAberto(false)} disabled={enviandoReflexao}>
              Cancelar
            </Button>
            <Button onClick={() => enviarReflexao(reflexao)} disabled={enviandoReflexao || reflexao.trim().length < 20}>
              {enviandoReflexao ? "Enviando..." : "Enviar Reflexão"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={modalResetAberto} onOpenChange={setModalResetAberto}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <RotateCcw className="w-6 h-6" />
              Resetar Progresso do Passo
            </DialogTitle>
            <DialogDescription className="text-base">
              Tem certeza que deseja resetar o progresso deste passo?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-muted rounded-lg p-4 border">
              <p className="text-sm font-semibold mb-2">Informações do Discípulo:</p>
              <div className="text-sm space-y-1">
                <p>
                  <span className="font-medium">Nome:</span> {discipulo.nome_completo || "Não informado"}
                </p>
                <p>
                  <span className="font-medium">ID:</span> {discipulo.id}
                </p>
                <p>
                  <span className="font-medium">Passo:</span> {numero}
                </p>
              </div>
            </div>

            {reflexoesParaExcluir.length > 0 && (
              <div className="bg-destructive/10 rounded-lg p-4 border border-destructive/30">
                <p className="font-semibold text-destructive mb-3">
                  Reflexões que serão excluídas ({reflexoesParaExcluir.length}):
                </p>
                <div className="space-y-2">
                  {reflexoesParaExcluir.map((reflexao, idx) => (
                    <div
                      key={`${reflexao.id}-${reflexao.conteudo_id || idx}`}
                      className="bg-background/50 rounded p-3 text-sm"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {reflexao.tipo === "video" ? "🎥 Vídeo" : "📄 Artigo"}
                        </Badge>
                        <span className="font-medium">{reflexao.conteudo_id || reflexao.titulo}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        ID: {reflexao.id.slice(0, 8)}... • Notificação:{" "}
                        {reflexao.notificacao_id ? reflexao.notificacao_id.slice(0, 8) + "..." : "Nenhuma"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {perguntasReflexivasParaExcluir.length > 0 && (
              <div className="bg-destructive/10 rounded-lg p-4 border border-destructive/30">
                <p className="font-semibold text-destructive mb-3">
                  Perguntas Reflexivas que serão excluídas ({perguntasReflexivasParaExcluir.length}):
                </p>
                <div className="space-y-2">
                  {perguntasReflexivasParaExcluir.map((pergunta, idx) => (
                    <div key={`${pergunta.id}-${idx}`} className="bg-background/50 rounded p-3 text-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          💭 Pergunta Reflexiva
                        </Badge>
                        <span className="font-medium">
                          Pergunta {pergunta.perguntaIndex || idx + 1} • Status:{" "}
                          {pergunta.situacaoIndividual || pergunta.situacao}
                        </span>
                      </div>
                      {pergunta.respostaIndividual?.resposta && (
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                          Resposta: {pergunta.respostaIndividual.resposta}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        XP: {pergunta.respostaIndividual?.xp || pergunta.xp_ganho || 0}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {reflexoesParaExcluir.length === 0 && perguntasReflexivasParaExcluir.length === 0 && (
              <div className="bg-muted rounded-lg p-4 border">
                <p className="text-sm text-muted-foreground text-center">
                  Nenhuma reflexão ou pergunta reflexiva encontrada para este passo. O reset apenas limpará o histórico.
                </p>
              </div>
            )}

            <div className="bg-destructive/10 rounded-lg p-4 border border-destructive/30">
              <p className="font-semibold text-destructive mb-3">
                As seguintes informações serão PERMANENTEMENTE excluídas:
              </p>
              <ul className="text-sm space-y-2 list-disc list-inside text-destructive/90">
                <li>Todas as reflexões de vídeos deste passo</li>
                <li>Todas as reflexões de artigos deste passo</li>
                <li>Todas as respostas das perguntas reflexivas deste passo</li>
                <li>Todas as notificações relacionadas a este passo</li>
                <li>Histórico de vídeos assistidos</li>
                <li>Histórico de artigos lidos</li>
              </ul>
            </div>

            <div className="bg-muted rounded-lg p-4 border">
              <p className="text-sm font-medium mb-2">O que NÃO será excluído:</p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Seu XP e nível conquistados</li>
                <li>Progressos de outros passos</li>
                <li>Mensagens do chat com seu discipulador</li>
              </ul>
            </div>

            {erroSenha && (
              <div className="bg-destructive/10 rounded-lg p-3 border border-destructive/30">
                <p className="text-sm text-destructive font-medium">{erroSenha}</p>
              </div>
            )}

            <p className="text-sm text-center font-medium text-muted-foreground">
              Você poderá refazer os vídeos, artigos e perguntas reflexivas após o reset.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setModalResetAberto(false)
                setReflexoesParaExcluir([])
                setPerguntasReflexivasParaExcluir([]) // Limpar também as perguntas reflexivas ao cancelar
              }}
              disabled={resetando}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmarReset}
              disabled={resetando}
              className="flex-1"
            >
              {resetando ? (
                <>Resetando...</>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Confirmar Reset
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Celebração */}
      {mostrarCelebracao && (
        <ModalCelebracaoPasso
          open={mostrarCelebracao}
          onClose={handleFecharCelebracao}
          passoCompletado={numero}
          xpGanho={xpGanhoTotal}
        />
      )}

      <div className="border-t bg-card mt-8">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between gap-4">
            {/* Botão Voltar */}
            {numero === 1 ? (
              <Link href="/dashboard">
                <Button variant="outline" className="gap-2 bg-transparent">
                  <Home className="w-4 h-4" />
                  Voltar para Página Inicial
                </Button>
              </Link>
            ) : (
              <Link href={`/dashboard/passo/${numero - 1}`}>
                <Button variant="outline" className="gap-2 bg-transparent">
                  <ChevronLeft className="w-4 h-4" />
                  Voltar ao Passo {numero - 1}
                </Button>
              </Link>
            )}

            {/* Indicador do passo atual */}
            <div className="text-center hidden sm:block">
              <p className="text-sm font-medium">Passo {numero} de 10</p>
              <p className="text-xs text-muted-foreground">{passo.fase}</p>
            </div>

            {/* Botão Avançar - só mostra se o próximo passo estiver liberado */}
            {discipulo.passo_atual > numero && numero < 10 ? (
              <Link href={`/dashboard/passo/${numero + 1}`}>
                <Button variant="default" className="gap-2">
                  Ir para Passo {numero + 1}
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            ) : (
              <div className="w-[180px]" /> // Espaço vazio para manter o layout centralizado
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
