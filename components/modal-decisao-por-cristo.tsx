"use client"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Heart, Sparkles, ScrollText, ArrowDown } from "lucide-react"
import { registrarDecisaoPorCristo } from "@/app/dashboard/actions"
import { toast } from "sonner"
import { CONFISSAO_FE_TEXTO } from "@/constants/confissao-fe"
import ReactMarkdown from "react-markdown"

interface ModalDecisaoPorCristoProps {
  open: boolean
  discipuloId: string
  nomeCompleto: string
}

export function ModalDecisaoPorCristo({ open, discipuloId, nomeCompleto }: ModalDecisaoPorCristoProps) {
  const [etapa, setEtapa] = useState<"decisao" | "confissao" | "batismo">("decisao")
  const [loading, setLoading] = useState(false)
  const [concordo, setConcordo] = useState(false)
  const [nomeAssinatura, setNomeAssinatura] = useState(nomeCompleto)
  const [jaBatizado, setJaBatizado] = useState<boolean | null>(null)
  const [scrolledToBottom, setScrolledToBottom] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current
      const isBottom = scrollTop + clientHeight >= scrollHeight - 10 // 10px tolerance
      setScrolledToBottom(isBottom)
    }
  }

  useEffect(() => {
    if (etapa === "confissao") {
      setScrolledToBottom(false)
    }
  }, [etapa])

  const handleDecisao = async (decisao: boolean) => {
    if (!decisao) {
      toast.info("Continue sua jornada de fé. Estamos aqui para você!")
      return
    }
    setEtapa("confissao")
  }

  const handleConfissaoFe = async () => {
    if (!concordo || !nomeAssinatura.trim()) {
      toast.error("Por favor, preencha todos os campos e marque que concorda")
      return
    }

    setEtapa("batismo")
  }

  const handleRespostaBatismo = async (resposta: boolean) => {
    setLoading(true)
    try {
      const resultado = await registrarDecisaoPorCristo({
        discipuloId,
        decisaoPorCristo: true,
        confissaoFeAssinada: true,
        nomeAssinatura,
        jaBatizado: resposta,
      })

      if (resultado.success) {
        toast.success(resultado.message)
        window.location.reload()
      } else {
        toast.error(resultado.error || "Erro ao registrar decisão")
      }
    } catch (error) {
      toast.error("Erro ao processar sua decisão")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} modal>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center animate-bounce">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
          </div>
          <DialogTitle className="text-3xl text-center font-bold">Parabéns! Você completou o Passo 10!</DialogTitle>
          <DialogDescription className="text-center text-lg mt-2">
            <span className="text-green-600 dark:text-green-400 font-semibold">+360 XP</span> - Novo Nascimento e Vida
            com Deus
          </DialogDescription>
        </DialogHeader>

        <div className="my-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg border-2 border-blue-200 dark:border-blue-800">
          <p className="text-center font-medium">Você concluiu toda a Fase 1 - O Evangelho!</p>
          <p className="text-center text-sm text-muted-foreground mt-2">Agora é hora de um momento muito especial...</p>
        </div>

        {etapa === "decisao" && (
          <>
            <DialogHeader>
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center">
                  <Heart className="w-8 h-8 text-white fill-white" />
                </div>
              </div>
              <DialogTitle className="text-2xl text-center">Um Momento Importante</DialogTitle>
              <DialogDescription className="text-center text-base mt-2">
                Você completou a Fase 1 - O Evangelho. Agora é o momento de tomar a decisão mais importante da sua vida.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-6">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm leading-relaxed">
                  Você aprendeu sobre a justificação pela fé, adoção como filho de Deus, vida eterna e glorificação.
                  Compreendeu que Jesus morreu por seus pecados e ressuscitou para dar-lhe nova vida.
                </p>
              </div>

              <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                <h3 className="font-semibold text-lg mb-3 text-center">
                  Você deseja receber Jesus Cristo como seu Salvador?
                </h3>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Reconhecer que precisa de Deus, crer que Jesus morreu por você e recebê-Lo como Senhor da sua vida?
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => handleDecisao(false)}>
                Ainda não estou pronto
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700"
                onClick={() => handleDecisao(true)}
              >
                Sim, quero receber Cristo!
              </Button>
            </div>
          </>
        )}

        {etapa === "confissao" && (
          <>
            <DialogHeader>
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <ScrollText className="w-8 h-8 text-white" />
                </div>
              </div>
              <DialogTitle className="text-2xl text-center">Confissão de Fé</DialogTitle>
              <DialogDescription className="text-center text-base mt-2">
                Leia toda a confissão de fé antes de assinar
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-6">
              <div className="relative">
                <div
                  ref={scrollContainerRef}
                  onScroll={handleScroll}
                  className="h-80 overflow-y-auto p-6 bg-muted rounded-lg border-2 border-border space-y-4"
                >
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown
                      components={{
                        a: ({ node, ...props }) => (
                          <a
                            {...props}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                          />
                        ),
                      }}
                    >
                      {CONFISSAO_FE_TEXTO}
                    </ReactMarkdown>
                  </div>
                </div>

                {!scrolledToBottom && (
                  <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent pointer-events-none flex items-end justify-center pb-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground animate-bounce">
                      <ArrowDown className="w-4 h-4" />
                      <span>Role para ler toda a confissão</span>
                      <ArrowDown className="w-4 h-4" />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="nome-assinatura">Nome completo</Label>
                  <Input
                    id="nome-assinatura"
                    value={nomeAssinatura}
                    onChange={(e) => setNomeAssinatura(e.target.value)}
                    placeholder="Digite seu nome completo"
                    disabled={!scrolledToBottom}
                  />
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="concordo"
                    checked={concordo}
                    onCheckedChange={(checked) => setConcordo(checked as boolean)}
                    disabled={!scrolledToBottom}
                  />
                  <Label
                    htmlFor="concordo"
                    className={`text-sm leading-relaxed ${scrolledToBottom ? "cursor-pointer" : "cursor-not-allowed opacity-50"}`}
                  >
                    Declaro que faço esta confissão de fé de forma livre e consciente, reconhecendo Jesus Cristo como
                    meu Senhor e Salvador.
                  </Label>
                </div>

                {!scrolledToBottom && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <p className="text-xs text-amber-800 dark:text-amber-200 text-center">
                      Por favor, leia toda a confissão de fé rolando até o final antes de assinar
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setEtapa("decisao")}>
                Voltar
              </Button>
              <Button
                className="flex-1"
                onClick={handleConfissaoFe}
                disabled={!scrolledToBottom || !concordo || !nomeAssinatura.trim()}
              >
                Assinar Confissão de Fé
              </Button>
            </div>
          </>
        )}

        {etapa === "batismo" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl text-center">Batismo nas Águas</DialogTitle>
              <DialogDescription className="text-center text-base mt-2">
                Uma última pergunta importante
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-6">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm leading-relaxed">
                  O batismo nas águas é um mandamento de Jesus e representa publicamente sua decisão por Cristo. É um
                  testemunho da sua nova vida em Jesus.
                </p>
              </div>

              <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                <h3 className="font-semibold text-lg mb-3 text-center">
                  Você já foi batizado nas águas após sua decisão consciente por Cristo?
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleRespostaBatismo(true)}
                  disabled={loading}
                  className="h-auto py-4 text-left justify-start"
                >
                  <div>
                    <div className="font-semibold">Sim, já fui batizado</div>
                    <div className="text-xs text-muted-foreground mt-1">Seguir para Fase 2 - Armadura de Deus</div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleRespostaBatismo(false)}
                  disabled={loading}
                  className="h-auto py-4 text-left justify-start"
                >
                  <div>
                    <div className="font-semibold">Não, ainda não fui batizado</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Fazer fase intermediária sobre Batismo Cristão
                    </div>
                  </div>
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
