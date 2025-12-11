"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { FileText, CheckCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { PERGUNTAS_POR_PASSO } from "@/constants/perguntas-passos"
import { aprovarPerguntasReflexivas } from "@/app/discipulador/actions"

interface PerguntaResposta {
  pergunta_id: number
  pergunta?: string
  resposta: string
}

interface PerguntasReflexivasModalProps {
  perguntasResposta: {
    id: string
    discipulo_id: string
    fase_numero: number
    passo_numero: number
    respostas: PerguntaResposta[]
    situacao: string
    xp_ganho?: number
  }
  discipuloId: string
  discipuloNome: string
  onAprovado?: (xpConcedido: number) => void
}

export function AvaliarPerguntasReflexivasModal({
  perguntasResposta,
  discipuloId,
  discipuloNome,
  onAprovado,
}: PerguntasReflexivasModalProps) {
  const [open, setOpen] = useState(false)
  const [feedback, setFeedback] = useState("")
  const [loading, setLoading] = useState(false)
  const [xpConcedido, setXpConcedido] = useState(20)

  const perguntasTexto = PERGUNTAS_POR_PASSO[perguntasResposta.passo_numero] || []

  async function handleAprovar() {
    if (!feedback.trim()) {
      toast.error("Por favor, adicione um feedback antes de aprovar")
      return
    }

    setLoading(true)

    try {
      const result = await aprovarPerguntasReflexivas({
        perguntasId: perguntasResposta.id,
        discipuloId,
        feedback,
        xpConcedido,
        faseNumero: perguntasResposta.fase_numero,
        passoNumero: perguntasResposta.passo_numero,
        situacaoAtual: perguntasResposta.situacao,
      })

      if (result.error) {
        toast.error(result.error)
        setLoading(false)
        return
      }

      if (result.proximoPasso) {
        toast.success(`Parabéns! Passo ${result.proximoPasso - 1} concluído. Passo ${result.proximoPasso} liberado!`)
      } else if (result.leituraPendente) {
        toast.warning(`Leitura bíblica da semana ${result.leituraPendente} ainda não foi concluída`)
      } else {
        toast.success(`Perguntas reflexivas aprovadas! +${xpConcedido} XP concedido`)
      }

      setOpen(false)

      if (onAprovado) {
        onAprovado(xpConcedido)
      }

      window.location.reload()
    } catch (error) {
      console.error("[v0] Erro ao aprovar perguntas reflexivas:", error)
      toast.error("Erro ao aprovar perguntas reflexivas")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button size="sm" className="bg-orange-600 hover:bg-orange-700" onClick={() => setOpen(true)}>
        <FileText className="w-4 h-4 mr-1" />
        Aguardando Aprovação
      </Button>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Avaliar Reflexão de {discipuloNome}</DialogTitle>
          <DialogDescription>Leia a reflexão do discípulo e forneça um feedback construtivo</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {perguntasResposta.respostas.map((item, index) => {
            const textoPergunta = perguntasTexto[item.pergunta_id - 1] || `Pergunta ${item.pergunta_id}`

            return (
              <div key={index} className="space-y-2">
                <div className="flex items-start gap-2">
                  <Badge variant="secondary" className="mt-1 bg-yellow-100 text-yellow-800 border-yellow-300">
                    Vídeo
                  </Badge>
                  <div className="flex-1">
                    <h3 className="font-semibold text-base leading-relaxed">{textoPergunta}</h3>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Reflexão do Discípulo:</Label>
                  <div className="mt-1 p-4 bg-muted rounded-lg">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{item.resposta}</p>
                  </div>
                </div>
              </div>
            )
          })}

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
