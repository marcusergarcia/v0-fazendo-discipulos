"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { aprovarReflexao } from "@/app/discipulador/actions"

interface ValidarReflexaoModalProps {
  reflexao: {
    id: string
    titulo: string
    reflexao: string
    tipo: string
    conteudo_id: string
    xp_ganho?: number
    situacao?: string
    passo_atual: number
  }
  discipuloId: string
  discipuloNome: string
  onAprovado?: (xpConcedido: number) => void
  respostaPergunta?: string | null
  respostaMissao?: string | null
}

export function ValidarReflexaoModal({
  reflexao,
  discipuloId,
  discipuloNome,
  onAprovado,
  respostaPergunta,
  respostaMissao,
}: ValidarReflexaoModalProps) {
  const [open, setOpen] = useState(false)
  const [feedback, setFeedback] = useState("")
  const [loading, setLoading] = useState(false)
  const [xpConcedido, setXpConcedido] = useState(20)

  async function handleAprovar() {
    if (!feedback.trim()) {
      toast.error("Por favor, adicione um feedback antes de aprovar")
      return
    }

    setLoading(true)

    try {
      const result = await aprovarReflexao({
        reflexaoId: reflexao.id,
        discipuloId: discipuloId,
        passoAtual: reflexao.passo_atual,
        tipo: reflexao.tipo,
        conteudoId: reflexao.conteudo_id,
        feedback: feedback,
        xpConcedido: xpConcedido,
      })

      if (!result.success) {
        toast.error(result.error || "Erro ao aprovar reflexão")
        return
      }

      if (result.warning) {
        toast.warning(result.warning)
      }

      toast.success(result.message)
      setOpen(false)

      if (onAprovado) {
        onAprovado(result.xpConcedido!)
      }
    } catch (error) {
      console.error("[v0] Erro ao aprovar reflexão:", error)
      toast.error("Erro ao aprovar reflexão")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        size="sm"
        variant="outline"
        className="bg-yellow-50 border-yellow-300 hover:bg-yellow-100"
        onClick={() => setOpen(true)}
      >
        <Clock className="w-3 h-3 mr-1" />
        Avaliar
      </Button>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Avaliar Reflexão de {discipuloNome}</DialogTitle>
          <DialogDescription>Leia a reflexão do discípulo e forneça um feedback construtivo</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="capitalize">
                {reflexao.tipo}
              </Badge>
              <h3 className="font-semibold">{reflexao.titulo}</h3>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">Reflexão do Discípulo:</Label>
            <div className="mt-2 p-4 bg-muted rounded-lg">
              <p className="whitespace-pre-wrap">{reflexao.reflexao}</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <Label htmlFor="feedback">Seu Feedback (obrigatório)</Label>
            <Textarea
              id="feedback"
              placeholder="Escreva um feedback construtivo e encorajador sobre a reflexão do discípulo..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="xp">XP a Conceder</Label>
            <div className="flex gap-2 mt-1">
              {[10, 15, 20, 25, 30].map((xp) => (
                <Button
                  key={xp}
                  type="button"
                  variant={xpConcedido === xp ? "default" : "outline"}
                  size="sm"
                  onClick={() => setXpConcedido(xp)}
                >
                  {xp} XP
                </Button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleAprovar} disabled={loading || !feedback.trim()} className="flex-1">
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
              Aprovar e Conceder {xpConcedido} XP
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
