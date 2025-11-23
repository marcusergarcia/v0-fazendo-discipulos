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
  Save,
  MessageCircle,
  Clock,
  CheckCheck,
  Play,
  ExternalLink,
  RotateCcw,
  CheckCircle,
} from "lucide-react"
import Link from "next/link"
import {
  salvarRascunho,
  enviarParaValidacao,
  concluirVideoComReflexao,
  concluirArtigoComReflexao,
  resetarProgresso,
  buscarReflexoesParaReset, // Importar nova função
} from "./actions"
import { useState } from "react"
import { TextWithBibleLinks } from "@/components/text-with-bible-links"

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
}: PassoClientProps) {
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
  const [conteudoAtual, setConteudoAtual] = useState<any>(null)
  const [reflexao, setReflexao] = useState("")
  const [enviandoReflexao, setEnviandoReflexao] = useState(false)

  const [modalResetAberto, setModalResetAberto] = useState(false)
  const [resetando, setResetando] = useState(false)
  const [erroSenha, setErroSenha] = useState<string | null>(null)
  const [reflexoesParaExcluir, setReflexoesParaExcluir] = useState<any[]>([])
  const [carregandoReflexoes, setCarregandoReflexoes] = useState(false)

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
    console.log("[v0] CLIENT: handleResetarProgresso iniciado")
    setCarregandoReflexoes(true)
    setErroSenha(null)

    try {
      console.log("[v0] CLIENT: Chamando buscarReflexoesParaReset para passo", numero)
      const reflexoes = await buscarReflexoesParaReset(numero)
      console.log("[v0] CLIENT: Reflexões retornadas:", reflexoes)
      console.log("[v0] CLIENT: Total de reflexões:", reflexoes.length)

      setReflexoesParaExcluir(reflexoes)
      setModalResetAberto(true)

      console.log("[v0] CLIENT: Modal aberto com sucesso")
    } catch (error: any) {
      console.error("[v0] CLIENT: ERRO ao buscar reflexões:", error)
      console.error("[v0] CLIENT: Stack:", error.stack)
      setErroSenha(`Erro ao carregar reflexões: ${error.message}`)
      // Mesmo com erro, abre o modal para permitir reset
      setModalResetAberto(true)
    } finally {
      setCarregandoReflexoes(false)
      console.log("[v0] CLIENT: Carregamento finalizado")
    }
  }

  const confirmarReset = async () => {
    console.log("[v0] CLIENT: confirmarReset iniciado")
    setResetando(true)
    setErroSenha(null)

    try {
      const reflexoesIds = reflexoesParaExcluir.map((r) => r.id)
      console.log("[v0] CLIENT: Chamando resetarProgresso com IDs:", reflexoesIds)

      const resultado = await resetarProgresso(numero, reflexoesIds)
      console.log("[v0] CLIENT: Resultado:", resultado)

      if (resultado.success) {
        console.log("[v0] CLIENT: Reset bem-sucedido!")
        setModalResetAberto(false)
        window.location.href = `/dashboard/passo/${numero}?reset=true`
      } else {
        setErroSenha("Erro ao resetar progresso")
        setResetando(false)
      }
    } catch (error) {
      console.error("[v0] CLIENT: ERRO:", error)
      setErroSenha(error.message || "Erro ao resetar progresso")
      setResetando(false)
    }
  }

  const abrirModalMissaoCumprida = (tipo: "video" | "artigo", conteudo: any) => {
    setTipoConteudo(tipo)
    setConteudoAtual(conteudo)
    setReflexao("")
    setModalAberto(true)
  }

  const enviarReflexao = async () => {
    if (!reflexao.trim() || reflexao.trim().length < 20) {
      alert("Por favor, escreva uma reflexão de pelo menos 20 caracteres")
      return
    }

    if (enviandoReflexao) return

    console.log("[v0] === INICIANDO ENVIO DE REFLEXÃO ===")
    console.log("[v0] Tipo:", tipoConteudo)
    console.log("[v0] Conteúdo ID:", conteudoAtual?.id)
    console.log("[v0] Título:", conteudoAtual?.titulo)
    console.log("[v0] Reflexão:", reflexao.substring(0, 50) + "...")
    console.log("[v0] Passo número:", numero)

    setEnviandoReflexao(true)
    try {
      console.log("[v0] Chamando action...")
      let result
      if (tipoConteudo === "video") {
        console.log("[v0] Concluindo vídeo com reflexão...")
        result = await concluirVideoComReflexao(numero, conteudoAtual.id, conteudoAtual.titulo, reflexao)
      } else {
        console.log("[v0] Concluindo artigo com reflexão...")
        result = await concluirArtigoComReflexao(numero, conteudoAtual.id, conteudoAtual.titulo, reflexao)
      }
      console.log("[v0] Action executada com sucesso! Resultado:", result)

      setModalAberto(false)
      setReflexao("")
      window.location.reload()
    } catch (error) {
      console.error("[v0] ERRO ao enviar reflexão:", error)
      console.error("[v0] Detalhes do erro:", JSON.stringify(error, null, 2))
      alert("Erro ao enviar reflexão. Tente novamente.")
    } finally {
      setEnviandoReflexao(false)
    }
  }

  const temProgressoParaResetar = () => {
    const temVideos = videosAssistidos.length > 0
    const temArtigos = artigosLidos.length > 0
    const temResposta = progresso?.resposta_pergunta || progresso?.resposta_missao
    return temVideos || temArtigos || temResposta
  }

  const todasReflexoesAprovadas = () => {
    const todosConteudos = [...(passo.videos || []), ...(passo.artigos || [])]

    if (todosConteudos.length === 0) return false

    const todasAprovadas = todosConteudos.every((conteudo) => conteudo.reflexao_situacao?.toLowerCase() === "aprovado")

    return todasAprovadas && todosConteudos.length === 6
  }

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
                {progresso?.pontuacao_total || 0} XP ganhos
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
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Objetivo do Passo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium mb-4">
              Entender que a vida não é um acidente: fomos criados por Deus com propósito.
            </p>
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
                <p className="text-sm font-semibold text-primary">— {v.referencia}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {(numero === 1 || numero === 2) && (
          <Card className="mb-6 border-accent/30 bg-gradient-to-br from-accent/5 to-primary/5">
            <CardHeader>
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-accent" />📖 Leitura Bíblica da Semana {numero}
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
                          "Comece conhecendo Jesus através do Evangelho de João. Descubra quem Ele é e por que veio ao mundo."}
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
                              Excelente! Mais uma semana concluída 🎉
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
              </div>
            </CardContent>
          </Card>
        )}

        {/* Vídeos Educacionais */}
        {passo.videos && passo.videos.length > 0 && (
          <Card className="mb-6 border-primary/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Play className="w-5 h-5 text-primary" />
                    Assista e Aprenda
                  </CardTitle>
                  <CardDescription>Vídeos curtos para aprofundar seu entendimento</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {passo.videos.map((video: any) => {
                const assistido = videosAssistidos.includes(video.id)
                const temReflexao = video.reflexao_situacao !== null && video.reflexao_situacao !== undefined
                const reflexaoAprovada = video.reflexao_situacao === "aprovado"
                const reflexaoPendente = temReflexao && !reflexaoAprovada

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
                          onClick={() => abrirModalMissaoCumprida("video", video)}
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
              {passo.artigos.map((artigo: any) => {
                const lido = artigosLidos.includes(artigo.id)
                const temReflexao = artigo.reflexao_situacao !== null && artigo.reflexao_situacao !== undefined
                const reflexaoAprovada = artigo.reflexao_situacao === "aprovado"
                const reflexaoPendente = temReflexao && !reflexaoAprovada

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
                          onClick={() => abrirModalMissaoCumprida("artigo", artigo)}
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

        {((passo.videos && passo.videos.length > 0) || (passo.artigos && passo.artigos.length > 0)) &&
          temProgressoParaResetar() &&
          !todasReflexoesAprovadas() && (
            <div className="mb-6 flex justify-end">
              <Button type="button" variant="outline" onClick={handleResetarProgresso} disabled={carregandoReflexoes}>
                <RotateCcw className="w-4 h-4 mr-2" />
                {carregandoReflexoes ? "Carregando..." : "Resetar Progresso do Passo"}
              </Button>
            </div>
          )}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-secondary">Pergunta para Responder</CardTitle>
            <CardDescription>Responda com suas próprias palavras</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold mb-4">
              <TextWithBibleLinks text={passo.perguntaChave} />
            </p>
            <Textarea
              name="resposta_pergunta"
              id="resposta_pergunta"
              placeholder="Escreva com suas próprias palavras..."
              className="min-h-32 text-base"
              value={respostaPergunta}
              onChange={(e) => setRespostaPergunta(e.target.value)}
              disabled={respostaPerguntaHistorico?.situacao === "aprovado" || status === "aguardando"}
            />
            {respostaPerguntaHistorico?.situacao === "aprovado" && (
              <div className="mt-3 rounded-lg p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                <p className="text-sm font-medium text-green-700 dark:text-green-300">
                  Pergunta aprovada pelo discipulador! +{respostaPerguntaHistorico.xp_ganho || 0} XP
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-primary mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Missão Prática
            </CardTitle>
            <CardDescription>{passo.missao}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Textarea
                name="resposta_missao"
                id="resposta_missao"
                placeholder='Exemplo: "Existo para glorificar a Deus e viver em comunhão com Ele"'
                className="min-h-24 text-base"
                value={respostaMissao}
                onChange={(e) => setRespostaMissao(e.target.value)}
                disabled={respostaMissaoHistorico?.situacao === "aprovado" || status === "aguardando"}
              />
              {respostaMissaoHistorico?.situacao === "aprovado" && (
                <div className="mt-2 rounded-lg p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 flex items-center gap-2">
                  <CheckCheck className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">
                    Missão aprovada pelo discipulador! +{respostaMissaoHistorico.xp_ganho || 0} XP
                  </p>
                </div>
              )}
              {((respostaPerguntaHistorico?.situacao === "enviado" && !respostaMissaoHistorico) ||
                (respostaMissaoHistorico?.situacao === "enviado" && !respostaPerguntaHistorico) ||
                (respostaPerguntaHistorico?.situacao === "enviado" &&
                  respostaMissaoHistorico?.situacao === "enviado")) && (
                <div className="mt-2 rounded-lg p-3 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                    Aguardando validação do discipulador...
                  </p>
                </div>
              )}
              {(status === "pendente" ||
                respostaPerguntaHistorico?.situacao !== "aprovado" ||
                respostaMissaoHistorico?.situacao !== "aprovado") && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="w-full bg-transparent"
                    disabled={
                      respostaPerguntaHistorico?.situacao === "aprovado" &&
                      respostaMissaoHistorico?.situacao === "aprovado"
                    }
                    onClick={handleSalvarRascunho}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Salvar
                  </Button>
                  <Button
                    type="button"
                    size="lg"
                    disabled={
                      (respostaPerguntaHistorico?.situacao === "aprovado" &&
                        respostaMissaoHistorico?.situacao === "aprovado") ||
                      !respostaPergunta.trim() ||
                      !respostaMissao.trim()
                    }
                    onClick={handleEnviarValidacao}
                  >
                    {status === "aguardando" ? (
                      <>Enviando...</>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Enviar ao Discipulador
                      </>
                    )}
                  </Button>
                </div>
              )}

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
          </CardContent>
        </Card>

        {/* Navegação */}
        <div className="flex justify-between mt-8">
          <Link href="/dashboard">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Dashboard
            </Button>
          </Link>
          {numero < 10 && status === "validado" && statusLeituraSemana === "concluida" && (
            <Link href={`/dashboard/passo/${numero + 1}`}>
              <Button>
                Prosseguir
                <Sparkles className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          )}
        </div>
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
            <Button onClick={enviarReflexao} disabled={enviandoReflexao || reflexao.trim().length < 20}>
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
                  {reflexoesParaExcluir.map((reflexao) => (
                    <div key={reflexao.id} className="bg-background/50 rounded p-3 text-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {reflexao.tipo === "video" ? "🎥 Vídeo" : "📄 Artigo"}
                        </Badge>
                        <span className="font-medium">{reflexao.titulo}</span>
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

            {reflexoesParaExcluir.length === 0 && (
              <div className="bg-muted rounded-lg p-4 border">
                <p className="text-sm text-muted-foreground text-center">
                  Nenhuma reflexão encontrada para este passo. O reset apenas limpará o histórico de vídeos e artigos.
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
              Você poderá refazer os vídeos e artigos após o reset.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setModalResetAberto(false)
                setReflexoesParaExcluir([])
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
    </div>
  )
}
