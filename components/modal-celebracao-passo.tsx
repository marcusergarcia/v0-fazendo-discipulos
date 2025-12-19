"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Sparkles, ArrowRight, Check } from "lucide-react"
import { PASSOS_CONTEUDO } from "@/constants/passos-conteudo"
import { StepBadge } from "@/components/step-badge"

interface ModalCelebracaoPassoProps {
  open: boolean
  onClose: () => void
  passoCompletado: number
  xpGanho: number
}

export function ModalCelebracaoPasso({ open, onClose, passoCompletado, xpGanho }: ModalCelebracaoPassoProps) {
  const passoAtual = PASSOS_CONTEUDO[passoCompletado as keyof typeof PASSOS_CONTEUDO]
  const proximoPasso = PASSOS_CONTEUDO[(passoCompletado + 1) as keyof typeof PASSOS_CONTEUDO]

  console.log("[v0] Modal Celebração Debug:", {
    passoCompletado,
    proximoNumero: passoCompletado + 1,
    passoAtualExiste: !!passoAtual,
    proximoPassoExiste: !!proximoPasso,
    proximoPassoTitulo: proximoPasso?.titulo,
    todasChavesPassos: Object.keys(PASSOS_CONTEUDO),
  })

  if (!passoAtual) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex flex-col items-center text-center space-y-6 py-6">
          <div className="relative">
            <StepBadge stepNumber={passoCompletado} status="completed" size="xxl" className="animate-bounce" />
            <Sparkles className="absolute -top-2 -right-2 w-10 h-10 text-yellow-400 animate-pulse" />
            <Sparkles className="absolute -bottom-2 -left-2 w-8 h-8 text-orange-400 animate-pulse" />
            <Sparkles className="absolute top-1/2 -left-4 w-6 h-6 text-yellow-300 animate-pulse delay-75" />
            <Sparkles className="absolute top-1/2 -right-4 w-6 h-6 text-orange-300 animate-pulse delay-150" />
          </div>

          {/* Título de parabéns */}
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-primary">Parabéns!</h2>
            <p className="text-xl text-muted-foreground">
              Você completou o <span className="font-semibold text-foreground">Passo {passoCompletado}</span>
            </p>
          </div>

          {/* Recompensa conquistada */}
          <div className="w-full bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6 space-y-3">
            <div className="flex items-center justify-center gap-3">
              <StepBadge stepNumber={passoCompletado} status="completed" size="md" />
              <h3 className="text-2xl font-bold">{passoAtual.recompensa}</h3>
            </div>
            <div className="flex items-center justify-center gap-2 text-lg">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              <span className="font-semibold text-primary">+{xpGanho} XP</span>
            </div>
          </div>

          {/* Resumo da conquista */}
          <div className="w-full space-y-3 text-left">
            <h4 className="font-semibold text-lg flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600" />O que você conquistou:
            </h4>
            <div className="bg-muted rounded-lg p-4 space-y-2 text-sm">
              <p className="font-medium">{passoAtual.titulo}</p>
              <p className="text-muted-foreground">{passoAtual.objetivo}</p>
            </div>
          </div>

          {/* Próximo passo */}
          {proximoPasso && (
            <div className="w-full space-y-3 text-left border-t pt-6">
              <h4 className="font-semibold text-lg flex items-center gap-2">
                <ArrowRight className="w-5 h-5 text-primary" />
                Próximo desafio:
              </h4>
              <div className="bg-primary/5 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-3">
                  <StepBadge stepNumber={passoCompletado + 1} status="current" size="sm" />
                  <p className="font-semibold">
                    Passo {passoCompletado + 1}: {proximoPasso.titulo}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">{proximoPasso.objetivo}</p>
              </div>
            </div>
          )}

          {/* Botão de continuar */}
          <Button onClick={onClose} size="lg" className="w-full mt-4">
            Continuar Jornada
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
