"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Heart, Sparkles } from "lucide-react"
import { registrarDecisaoPorCristo } from "@/app/dashboard/actions"
import { toast } from "sonner"

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
        // Recarregar página para mostrar próxima fase
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
        {/* Adicionando celebração do passo 10 no início do modal de decisão */}
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
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
              </div>
              <DialogTitle className="text-2xl text-center">Confissão de Fé</DialogTitle>
              <DialogDescription className="text-center text-base mt-2">
                Leia e assine sua confissão de fé
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-6">
              <div className="p-6 bg-muted rounded-lg space-y-3">
                <p className="text-sm leading-relaxed font-medium">
                  Eu reconheço que sou pecador e que preciso da graça de Deus.
                </p>
                <p className="text-sm leading-relaxed font-medium">
                  Creio que Jesus Cristo é o Filho de Deus, que morreu por meus pecados e ressuscitou para me dar nova
                  vida.
                </p>
                <p className="text-sm leading-relaxed font-medium">
                  Hoje, eu O recebo como meu único e suficiente Salvador e declaro que Ele é o Senhor da minha vida.
                </p>
                <p className="text-sm leading-relaxed font-medium">
                  Decido viver segundo os ensinamentos de Cristo e caminhar no discipulado.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="nome-assinatura">Nome completo</Label>
                  <Input
                    id="nome-assinatura"
                    value={nomeAssinatura}
                    onChange={(e) => setNomeAssinatura(e.target.value)}
                    placeholder="Digite seu nome completo"
                  />
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="concordo"
                    checked={concordo}
                    onCheckedChange={(checked) => setConcordo(checked as boolean)}
                  />
                  <Label htmlFor="concordo" className="text-sm leading-relaxed cursor-pointer">
                    Declaro que faço esta confissão de fé de forma livre e consciente, reconhecendo Jesus Cristo como
                    meu Senhor e Salvador.
                  </Label>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setEtapa("decisao")}>
                Voltar
              </Button>
              <Button className="flex-1" onClick={handleConfissaoFe} disabled={!concordo || !nomeAssinatura.trim()}>
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
