"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
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
} from "lucide-react"
import Link from "next/link"
import {
  salvarRascunho,
  enviarParaValidacao,
  marcarVideoAssistido,
  marcarArtigoLido,
  resetarProgresso,
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
  console.log("[v0] PassoClient: Componente montado para passo", numero)
  console.log("[v0] PassoClient: Status:", status)

  const [respostaPergunta, setRespostaPergunta] = useState(progresso?.resposta_pergunta || "")
  const [respostaMissao, setRespostaMissao] = useState(
    progresso?.rascunho_resposta ? JSON.parse(progresso.rascunho_resposta).missao : "",
  )

  const handleSalvarRascunho = async () => {
    console.log("[v0] PassoClient: Salvando rascunho...")
    const formData = new FormData()
    formData.append("resposta_pergunta", respostaPergunta)
    formData.append("resposta_missao", respostaMissao)
    await salvarRascunho(numero, formData)
    console.log("[v0] PassoClient: Rascunho salvo com sucesso")
  }

  const handleEnviarValidacao = async () => {
    console.log("[v0] PassoClient: Enviando para validação...")
    const formData = new FormData()
    formData.append("resposta_missao", respostaMissao)
    await enviarParaValidacao(numero, formData)
    console.log("[v0] PassoClient: Enviado para validação com sucesso")
  }

  const handleResetarProgresso = async () => {
    console.log("[v0] PassoClient: Resetando progresso...")
    await resetarProgresso(numero)
    console.log("[v0] PassoClient: Progresso resetado com sucesso")
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
                Passo {numero} de 10 • Nível: {discipulo.nivel_atual}
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
                {(videosAssistidos.length > 0 || artigosLidos.length > 0) && (
                  <Button type="button" variant="outline" size="sm" onClick={handleResetarProgresso}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Resetar Progresso
                  </Button>
                )}
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
                    {assistido ? (
                      <Badge className="bg-accent text-accent-foreground">
                        <CheckCheck className="w-3 h-3 mr-1" />
                        Assistido
                      </Badge>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        onClick={async () => {
                          window.open(video.url, "_blank")
                          await marcarVideoAssistido(numero, video.id)
                        }}
                        className="bg-primary"
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Assistir
                      </Button>
                    )}
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
                {(videosAssistidos.length > 0 || artigosLidos.length > 0) && (
                  <Button type="button" variant="outline" size="sm" onClick={handleResetarProgresso}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Resetar Progresso
                  </Button>
                )}
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
                    {lido ? (
                      <Badge className="bg-accent text-accent-foreground">
                        <CheckCheck className="w-3 h-3 mr-1" />
                        Lido
                      </Badge>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={async () => {
                          window.open(artigo.url, "_blank")
                          await marcarArtigoLido(numero, artigo.id)
                        }}
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Ler Agora
                      </Button>
                    )}
                  </div>
                )
              })}
            </CardContent>
          </Card>
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
                    <Send className="w-4 h-4 mr-2" />
                    Enviar ao Discipulador
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
    </div>
  )
}
