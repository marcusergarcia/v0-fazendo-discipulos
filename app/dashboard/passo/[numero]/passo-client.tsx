"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BookOpen,
  Video,
  FileText,
  Check,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Calendar,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import type { PassoConteudo } from "@/constants/passos-evangelho"
import type { PassoBatismo } from "@/constants/passos-batismo"
import { RESUMOS_GERAIS_PASSOS } from "@/constants/resumos-gerais-passos"
import { RESUMOS_GERAIS_BATISMO } from "@/constants/resumos-gerais-batismo"
import { getLeituraPorPasso } from "@/constants/plano-leitura-biblica"

interface PassoClientProps {
  numero: number
  numeroExibido: number
  passo: PassoConteudo | PassoBatismo
  discipulo: {
    id: string
    passo_atual: number
    fase_atual: number
    necessita_fase_batismo: boolean
    ja_batizado: boolean
  }
  estaEmFaseBatismo: boolean
  progresso?: {
    videos_assistidos: string[]
    artigos_lidos: string[]
    perguntas_respondidas: boolean
  }
}

export default function PassoClient({
  numero,
  numeroExibido,
  passo,
  discipulo,
  estaEmFaseBatismo,
  progresso,
}: PassoClientProps) {
  const [videosAssistidos, setVideosAssistidos] = useState<string[]>(progresso?.videos_assistidos || [])
  const [artigosLidos, setArtigosLidos] = useState<string[]>(progresso?.artigos_lidos || [])

  // Calcula total de passos da fase atual
  const totalPassosFase = estaEmFaseBatismo || (numero >= 11 && numero <= 22) ? 12 : 10

  // Busca o resumo geral correto
  const numeroParaResumo = estaEmFaseBatismo || (numero >= 11 && numero <= 22) ? numero : numero
  const resumoGeral =
    estaEmFaseBatismo || (numero >= 11 && numero <= 22)
      ? RESUMOS_GERAIS_BATISMO[numeroParaResumo as keyof typeof RESUMOS_GERAIS_BATISMO]
      : RESUMOS_GERAIS_PASSOS[numeroParaResumo as keyof typeof RESUMOS_GERAIS_PASSOS]

  // Busca plano de leitura da semana
  const numeroParaLeitura = estaEmFaseBatismo || (numero >= 11 && numero <= 22) ? numero - 10 : numero
  const planoLeitura = getLeituraPorPasso(numeroParaLeitura)

  const toggleVideo = (videoId: string) => {
    setVideosAssistidos((prev) => (prev.includes(videoId) ? prev.filter((id) => id !== videoId) : [...prev, videoId]))
  }

  const toggleArtigo = (artigoId: string) => {
    setArtigosLidos((prev) => (prev.includes(artigoId) ? prev.filter((id) => id !== artigoId) : [...prev, artigoId]))
  }

  const nomeFase =
    estaEmFaseBatismo || (numero >= 11 && numero <= 22)
      ? "Batismo Cristão"
      : discipulo.fase_atual === 1
        ? "O Evangelho"
        : discipulo.fase_atual === 2
          ? "Armadura de Deus"
          : discipulo.fase_atual === 3
            ? "Vida em Comunidade"
            : "Sermão da Montanha"

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header fixo */}
      <div className="sticky top-0 z-10 bg-card border-b p-4 shadow-sm">
        <div className="container mx-auto flex items-center justify-between">
          <div className="text-center flex-1">
            <p className="text-sm text-muted-foreground">
              Passo {numeroExibido} de {totalPassosFase}
            </p>
            <p className="text-xs text-muted-foreground">
              FASE {discipulo.fase_atual}
              {estaEmFaseBatismo || (numero >= 11 && numero <= 22) ? " (INTERMEDIÁRIA)" : ""}: {nomeFase}
            </p>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
        {/* Cabeçalho do Passo */}
        <div className="text-center space-y-2">
          <Badge variant="secondary" className="mb-2">
            {passo.dificuldade || "intermediária"}
          </Badge>
          <h1 className="text-3xl font-bold">{passo.titulo}</h1>
        </div>

        {/* Objetivo do Passo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Objetivo do Passo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{passo.objetivo}</p>
          </CardContent>
        </Card>

        {/* Versículo Destaque */}
        {(passo.versiculo || (passo as PassoConteudo).versiculos) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Versículo Destaque
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(passo as PassoConteudo).versiculos && Array.isArray((passo as PassoConteudo).versiculos) ? (
                <div className="space-y-3">
                  {(passo as PassoConteudo).versiculos?.map((vers, idx) => (
                    <div key={idx}>
                      <p className="italic text-muted-foreground">"{vers.texto}"</p>
                      <p className="text-sm text-primary mt-1">— {vers.referencia}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  <p className="italic text-muted-foreground">
                    "{passo.textoVersiculo || (passo as PassoBatismo).descricaoVersiculo}"
                  </p>
                  <p className="text-sm text-primary mt-1">— {passo.versiculo}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Conteúdo do Passo (se existir) */}
        {(passo as PassoConteudo).conteudo && Array.isArray((passo as PassoConteudo).conteudo) && (
          <Card>
            <CardHeader>
              <CardTitle>Conteúdo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(passo as PassoConteudo).conteudo.map((item, idx) => (
                <div key={idx}>
                  <h3 className="font-semibold mb-2">{item.subtitulo}</h3>
                  <p className="text-muted-foreground">{item.texto}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Tabs de Recursos */}
        <Card>
          <CardHeader>
            <CardTitle>Recursos de Aprendizado</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="videos" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="videos">
                  <Video className="w-4 h-4 mr-2" />
                  Vídeos ({passo.videos?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="artigos">
                  <FileText className="w-4 h-4 mr-2" />
                  Artigos ({passo.artigos?.length || 0})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="videos" className="space-y-3">
                {passo.videos?.map((video, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "border rounded-lg p-4 hover:border-primary transition-colors",
                      videosAssistidos.includes(video.url) && "bg-primary/5 border-primary",
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{video.titulo}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{video.descricao}</p>
                        <Button variant="outline" size="sm" asChild>
                          <a href={video.url} target="_blank" rel="noopener noreferrer">
                            Assistir
                          </a>
                        </Button>
                      </div>
                      <Button
                        variant={videosAssistidos.includes(video.url) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleVideo(video.url)}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="artigos" className="space-y-3">
                {passo.artigos?.map((artigo, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "border rounded-lg p-4 hover:border-primary transition-colors",
                      artigosLidos.includes(artigo.url) && "bg-primary/5 border-primary",
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{artigo.titulo}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{artigo.descricao}</p>
                        <Button variant="outline" size="sm" asChild>
                          <a href={artigo.url} target="_blank" rel="noopener noreferrer">
                            Ler
                          </a>
                        </Button>
                      </div>
                      <Button
                        variant={artigosLidos.includes(artigo.url) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleArtigo(artigo.url)}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Leitura Bíblica Semanal */}
        {planoLeitura && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Leitura Bíblica Semanal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-semibold mb-1">{planoLeitura.tema}</h4>
                <p className="text-sm text-muted-foreground">{planoLeitura.descricao}</p>
              </div>
              <Button variant="outline" asChild className="w-full bg-transparent">
                <Link href={`/dashboard/leitura-biblica?semana=${numeroParaLeitura}`}>
                  Acessar Leitura da Semana {numeroParaLeitura}
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Resumo Geral */}
        {resumoGeral && (
          <Card>
            <CardHeader>
              <CardTitle>Resumo Geral</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {resumoGeral.topicos?.map((topico, idx) => (
                <div key={idx}>
                  <h4 className="font-semibold mb-1">{topico.titulo}</h4>
                  <p className="text-sm text-muted-foreground">{topico.descricao}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Perguntas Reflexivas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Perguntas Reflexivas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Responda às perguntas reflexivas e envie para seu discipulador avaliar.
            </p>
            <Button className="w-full" asChild>
              <Link href={`/dashboard/passo/${numero}/perguntas`}>
                {progresso?.perguntas_respondidas ? "Ver Respostas" : "Responder Perguntas"}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Footer fixo com navegação */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t p-4 shadow-lg">
        <div className="container mx-auto flex items-center justify-between gap-4">
          {/* Botão Voltar */}
          {numero > 1 && (
            <Button variant="outline" asChild className="flex-1 bg-transparent">
              <Link href={`/dashboard/passo/${numero - 1}`}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Voltar ao Passo {numero - 1}
              </Link>
            </Button>
          )}

          {/* Informação central */}
          <div className="text-center flex-1">
            <p className="text-sm font-medium">
              Passo {numeroExibido} de {totalPassosFase}
            </p>
            <p className="text-xs text-muted-foreground">
              FASE {discipulo.fase_atual}: {nomeFase}
            </p>
          </div>

          {/* Botão Avançar */}
          {discipulo.passo_atual > numero && (
            <Button asChild className="flex-1">
              <Link href={`/dashboard/passo/${numero + 1}`}>
                Ir para Passo {numero + 1}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
