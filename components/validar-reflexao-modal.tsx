"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, Loader2, CheckCircle2 } from 'lucide-react'
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useRouter } from 'next/navigation'

interface ValidarReflexaoModalProps {
  reflexao: {
    id: string
    titulo: string
    reflexao: string
    tipo: string
  }
  discipuloId: string
  discipuloNome: string
  xpGanho?: number | null
}

export function ValidarReflexaoModal({ reflexao, discipuloId, discipuloNome, xpGanho }: ValidarReflexaoModalProps) {
  const [open, setOpen] = useState(false)
  const [feedback, setFeedback] = useState("")
  const [loading, setLoading] = useState(false)
  const [xpConcedido, setXpConcedido] = useState(20)
  const router = useRouter()
  const supabase = createClient()

  async function handleAprovar() {
    if (!feedback.trim()) {
      toast.error("Por favor, adicione um feedback antes de aprovar")
      return
    }

    setLoading(true)

    try {
      console.log("[v0] Aprovando reflexão:", reflexao.id, "XP:", xpConcedido)
      
      const { error: updateError } = await supabase
        .from("reflexoes_conteudo")
        .update({ 
          xp_ganho: xpConcedido,
          feedback_discipulador: feedback
        })
        .eq("id", reflexao.id)

      if (updateError) {
        console.error("[v0] Erro ao atualizar reflexão:", updateError)
        throw updateError
      }

      console.log("[v0] Reflexão atualizada com sucesso")

      const { data: progresso } = await supabase
        .from("progresso_fases")
        .select("pontuacao_total")
        .eq("discipulo_id", discipuloId)
        .single()

      if (progresso) {
        await supabase
          .from("progresso_fases")
          .update({ 
            pontuacao_total: (progresso.pontuacao_total || 0) + xpConcedido 
          })
          .eq("discipulo_id", discipuloId)
      }

      const { data: disc } = await supabase
        .from("discipulos")
        .select("xp_total")
        .eq("id", discipuloId)
        .single()

      if (disc) {
        await supabase
          .from("discipulos")
          .update({ xp_total: (disc.xp_total || 0) + xpConcedido })
          .eq("id", discipuloId)
      }

      console.log("[v0] XP adicionado ao discípulo")

      toast.success(`Reflexão aprovada! +${xpConcedido} XP concedido ao discípulo`)
      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error("[v0] Erro ao aprovar reflexão:", error)
      toast.error("Erro ao aprovar reflexão")
    } finally {
      setLoading(false)
    }
  }

  if (xpGanho && xpGanho > 0) {
    return (
      <Badge className="bg-green-100 text-green-700 border-green-300 hover:bg-green-100">
        <CheckCircle2 className="w-3 h-3 mr-1" />
        Aprovado (+{xpGanho} XP)
      </Badge>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="bg-yellow-50 border-yellow-300 hover:bg-yellow-100">
          <Clock className="w-3 h-3 mr-1" />
          Avaliar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Avaliar Reflexão de {discipuloNome}</DialogTitle>
          <DialogDescription>
            Leia a reflexão e forneça um feedback construtivo ao discípulo
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="capitalize">{reflexao.tipo}</Badge>
              <h3 className="font-semibold">{reflexao.titulo}</h3>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">Reflexão do Discípulo:</Label>
            <div className="mt-2 p-4 bg-muted rounded-lg">
              <p className="whitespace-pre-wrap">{reflexao.reflexao}</p>
            </div>
          </div>

          <div>
            <Label htmlFor="feedback">Seu Feedback (obrigatório)</Label>
            <Textarea
              id="feedback"
              placeholder="Escreva um feedback construtivo e encorajador..."
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
            <Button 
              onClick={handleAprovar} 
              disabled={loading || !feedback.trim()} 
              className="flex-1"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              Aprovar e Conceder {xpConcedido} XP
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
