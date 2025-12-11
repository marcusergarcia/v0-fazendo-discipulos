"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Loader2, Clock } from "lucide-react"
import { toast } from "sonner"
import { aprovarPerguntaReflexiva } from "@/app/discipulador/actions"

interface AvaliarPerguntaReflexivaModalProps {
  perguntaTexto: string
  perguntaId: number
  resposta: string
  discipuloId: string
  discipuloNome: string
  passoAtual: number
  faseNumero: number
  perguntasReflexivasId: string
  situacaoAtual?: string
  xpGanho?: number
}

export function AvaliarPerguntaReflexivaModal({
  perguntaTexto,
  perguntaId,
  resposta,
  discipuloId,
  discipuloNome,
  passoAtual,
  faseNumero,
  perguntasReflexivasId,
  situacaoAtual,
  xpGanho,
}: AvaliarPerguntaReflexivaModalProps) {
  const [open, setOpen] = useState(false)
  const [feedback, setFeedback] = useState("")
  const [loading, setLoading] = useState(false)
  const [xpConcedido, setXpConcedido] = useState(20)
  const router = useRouter()

  async function handleAprovar() {
    if (!feedback.trim()) {
      toast.error("Por favor, adicione um feedback antes de aprovar")
      return
    }

    setLoading(true)

    try {
      const result = await aprovarPerguntaReflexiva({
        perguntasReflexivasId,
        perguntaId,
        discipuloId,
        passoAtual,
        faseNumero,
        feedback: feedback.trim(),
        xpConcedido,
      })

      if (!result.success) {
        toast.error(result.error || "Erro ao aprovar pergunta reflexiva")
        return
      }

      toast.success(result.message)
      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error("[v0] Erro ao aprovar:", error)
      toast.error("Erro ao aprovar pergunta reflexiva")
    } finally {
      setLoading(false)
    }
  }

  const jaAprovada = situacaoAtual === "aprovado"

  if (jaAprovada) {
    return (
      <Badge variant="default" className="bg-green-600 hover:bg-green-700">
        <CheckCircle className="w-3 h-3 mr-1" />
        Aprovado {xpGanho}XP
      </Badge>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button size="sm" className="bg-orange-600 hover:bg-orange-700" onClick={() => setOpen(true)}>
        <Clock className="w-4 h-4 mr-1" />
        Aguardando Aprovação
      </Button>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Avaliar Reflexão de {discipuloNome}</DialogTitle>
          <DialogDescription>Leia a reflexão do discípulo e forneça um feedback construtivo</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <Badge variant="secondary" className="mt-1 bg-blue-100 text-blue-800 border-blue-300">
                Resumo
              </Badge>
              <div className="flex-1">
                <h3 className="font-semibold text-base leading-relaxed">{perguntaTexto}</h3>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-muted-foreground">Reflexão do Discípulo:</Label>
              <div className="mt-1 p-4 bg-muted rounded-lg">
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{resposta}</p>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <Label htmlFor="feedback" className="text-base font-semibold">
              Seu Feedback (obrigatório)
            </Label>
            <Textarea
              id="feedback"
              placeholder="Escreva um feedback construtivo e encorajador sobre a reflexão do discípulo..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
              className="mt-2"
            />
          </div>

          <div>
            <Label className="text-base font-semibold mb-3 block">XP a Conceder</Label>
            <div className="flex gap-2">
              {[10, 15, 20, 25, 30].map((xp) => (
                <Button
                  key={xp}
                  type="button"
                  variant={xpConcedido === xp ? "default" : "outline"}
                  size="default"
                  onClick={() => setXpConcedido(xp)}
                >
                  {xp} XP
                </Button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={handleAprovar} disabled={loading || !feedback.trim()} className="flex-1 h-11 text-base">
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
              Aprovar e Conceder {xpConcedido} XP
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading} className="h-11">
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
