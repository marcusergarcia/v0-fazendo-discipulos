"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ArrowLeft, BookOpen, Sparkles, Award, Target, Send, Save, MessageCircle, Clock, CheckCheck, Play, ExternalLink, RotateCcw, CheckCircle } from 'lucide-react'
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

type PassoClientProps = {
  numero: number
  passo: any
  discipulo: any
  progresso: any
  passosCompletados: number
  videosAssistidos: string[]
  artigosLidos: string[]
  status: "pendente" | "aguardando" | "validado"
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
    progresso?.resposta_pergunta || rascunho.pergunta || ""
  )
  const [respostaMissao, setRespostaMissao] = useState(
    progresso?.resposta_missao || rascunho.missao || ""
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
    formData.append("resposta_missao", respostaMissao)
    await enviarParaValidacao(numero, formData)
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
      const reflexoesIds = reflexoesParaExcluir.map(r => r.id)
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
    } catch (error: any) {
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

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-bold">{passo.fase}</h1>
              <p className="text-sm text-muted-foreground">
                Passo {numero} de 10 • Nível: {discipulo.nivel_atual} • {discipulo.nome_completo || 'Sem nome'} • ID: {discipulo.id?.slice(0, 8)}
              </p>
            </div>
            <Badge className="bg-primary/10 text-primary border-primary/20">
              <Target className="w-3 h-3 mr-1" />+{passo.xp} XP
            </Badge>
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
                  {linha}
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
                return (
                  <div
                    key={video.id}
                    className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                      assistido ? "bg-accent/10 border-accent" : "bg-muted/50 border-border"
                    }`}
                  >
                    <div className="flex-1">
                      <h4 className="font-semibold text-base mb-1">{video.titulo}</h4>
                      <p className="text-sm text-muted-foreground">
                        {video.canal} • {video.duracao}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(video.url, "_blank")}
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Assistir
                      </Button>
                      {assistido ? (
                        <Badge className="bg-accent text-accent-foreground">
                          <CheckCheck className="w-3 h-3 mr-1" />
                          Missão Cumprida
                        </Badge>
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => abrirModalMissaoCumprida("video", video)}
                          className="bg-primary"
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
                return (
                  <div
                    key={artigo.id}
                    className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                      lido ? "bg-accent/10 border-accent" : "bg-muted/50 border-border"
                    }`}
                  >
                    <div className="flex-1">
                      <h4 className="font-semibold text-base mb-1">{artigo.titulo}</h4>
                      <p className="text-sm text-muted-foreground">{artigo.fonte}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(artigo.url, "_blank")}
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Ler
                      </Button>
                      {lido ? (
                        <Badge className="bg-accent text-accent-foreground">
                          <CheckCheck className="w-3 h-3 mr-1" />
                          Missão Cumprida
                        </Badge>
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => abrirModalMissaoCumprida("artigo", artigo)}
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

        {((passo.videos && passo.videos.length > 0) || (passo.artigos && passo.artigos.length > 0)) && (
          <div className="mb-6 flex justify-end">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleResetarProgresso}
              disabled={carregandoReflexoes}
            >
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
            <p className="text-lg font-semibold mb-4">{passo.perguntaChave}</p>
            <Textarea
              name="resposta_pergunta"
              id="resposta_pergunta"
              placeholder="Escreva com suas palavras..."
              className="min-h-32 text-base"
              value={respostaPergunta}
              onChange={(e) => setRespostaPergunta(e.target.value)}
              disabled={status === "validado"}
            />
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
                disabled={status === "validado"}
              />

              <div
                className={`rounded-lg p-4 flex items-start gap-3 ${
                  status === "validado"
                    ? "bg-accent/10 border border-accent"
                    : status === "aguardando"
                      ? "bg-secondary/10 border border-secondary"
                      : "bg-muted"
                }`}
              >
                {status === "validado" && (
                  <>
                    <CheckCheck className="w-5 h-5 text-accent mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-accent mb-1">Validado! Próximo passo liberado.</p>
                      <p className="text-sm text-muted-foreground">
                        Seu discipulador confirmou que você compreendeu o conteúdo.
                      </p>
                    </div>
                  </>
                )}
                {status === "aguardando" && (
                  <>
                    <Clock className="w-5 h-5 text-secondary mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-secondary mb-1">Aguardando validação do discipulador.</p>
                      <p className="text-sm text-muted-foreground">
                        Sua missão foi enviada. Em breve seu discipulador irá validá-la.
                      </p>
                    </div>
                  </>
                )}
                {status === "pendente" && (
                  <>
                    <Send className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold mb-1">Aguardando sua missão.</p>
                      <p className="text-sm text-muted-foreground">
                        Esta missão precisa ser enviada e confirmada para liberar o próximo passo.
                      </p>
                    </div>
                  </>
                )}
              </div>

              {status !== "validado" && (
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="w-full bg-transparent"
                    disabled={status === "validado"}
                    onClick={handleSalvarRascunho}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Salvar
                  </Button>
                  <Button
                    type="button"
                    size="lg"
                    disabled={status === "validado" || status === "aguardando"}
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

              <Link href={`/dashboard/chat`}>
                <Button type="button" variant="outline" size="lg" className="w-full bg-transparent">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Conversar com meu discipulador
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {status === "validado" && (
          <Card className="border-accent bg-accent/5 mb-6">
            <CardContent className="py-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent/20 mb-4">
                  <Award className="w-10 h-10 text-accent" />
                </div>
                <h3 className="text-2xl font-bold mb-2">🎖 Insígnia Conquistada!</h3>
                <p className="text-xl font-semibold text-accent mb-1">{passo.recompensa.toUpperCase()}</p>
                <p className="text-muted-foreground">
                  Esta insígnia confirma que você reconheceu sua origem espiritual em Deus.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navegação */}
        <div className="flex justify-between mt-8">
          <Link href="/dashboard">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Dashboard
            </Button>
          </Link>
          {numero < 10 && status === "validado" && (
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-primary" />
              Realizar Missão: {tipoConteudo === "video" ? "Vídeo" : "Artigo"}
            </DialogTitle>
            <DialogDescription>{conteudoAtual?.titulo}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-semibold mb-2 block">
                Escreva sua reflexão sobre o que você aprendeu:
              </label>
              <Textarea
                placeholder="Compartilhe suas principais descobertas, insights e como esse conteúdo impactou você..."
                className="min-h-40 text-base"
                value={reflexao}
                onChange={(e) => setReflexao(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Mínimo de 20 caracteres • Sua reflexão será enviada ao discipulador
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 border">
              <p className="text-sm font-medium mb-2">Após enviar sua reflexão:</p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Sua reflexão será enviada ao discipulador para validação</li>
                <li>O conteúdo será marcado como concluído</li>
                <li>O discipulador poderá conversar com você sobre sua reflexão</li>
                <li>Você poderá assistir/ler novamente quando quiser</li>
              </ul>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                window.open(conteudoAtual?.url, "_blank")
              }}
            >
              {tipoConteudo === "video" ? <Play className="w-4 h-4 mr-2" /> : <ExternalLink className="w-4 h-4 mr-2" />}
              {tipoConteudo === "video" ? "Assistir Novamente" : "Ler Novamente"}
            </Button>
            <Button type="button" onClick={enviarReflexao} disabled={enviandoReflexao || reflexao.trim().length < 20}>
              {enviandoReflexao ? (
                <>Enviando...</>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar ao Discipulador
                </>
              )}
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
                <p><span className="font-medium">Nome:</span> {discipulo.nome_completo || 'Não informado'}</p>
                <p><span className="font-medium">ID:</span> {discipulo.id}</p>
                <p><span className="font-medium">Passo:</span> {numero}</p>
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
                          {reflexao.tipo === 'video' ? '🎥 Vídeo' : '📄 Artigo'}
                        </Badge>
                        <span className="font-medium">{reflexao.titulo}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        ID: {reflexao.id.slice(0, 8)}... • Notificação: {reflexao.notificacao_id ? reflexao.notificacao_id.slice(0, 8) + '...' : 'Nenhuma'}
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
