"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, Loader2 } from 'lucide-react'
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface ValidarReflexaoModalProps {
  reflexao: {
    id: string
    titulo: string
    reflexao: string
    tipo: string
    conteudo_id: string
    xp_ganho?: number
  }
  discipuloId: string
  discipuloNome: string
  onAprovado?: () => void
}

export function ValidarReflexaoModal({ reflexao, discipuloId, discipuloNome, onAprovado }: ValidarReflexaoModalProps) {
  const [open, setOpen] = useState(false)
  const [feedback, setFeedback] = useState("")
  const [loading, setLoading] = useState(false)
  const [xpConcedido, setXpConcedido] = useState(20)
  const supabase = createClient()

  async function handleAprovar() {
    if (!feedback.trim()) {
      toast.error("Por favor, adicione um feedback antes de aprovar")
      return
    }

    setLoading(true)

    try {
      if (reflexao.xp_ganho && reflexao.xp_ganho > 0) {
        toast.error("Esta reflexão já foi aprovada anteriormente")
        setLoading(false)
        setOpen(false)
        return
      }

      const { error: updateReflexaoError } = await supabase
        .from("reflexoes_conteudo")
        .update({
          feedback_discipulador: feedback,
          xp_ganho: xpConcedido,
          data_aprovacao: new Date().toISOString()
        })
        .eq("id", reflexao.id)

      if (updateReflexaoError) {
        console.error("[v0] Erro ao atualizar reflexão:", updateReflexaoError)
        toast.error("Erro ao atualizar reflexão")
        setLoading(false)
        return
      }

      const { data: progresso } = await supabase
        .from("progresso_fases")
        .select("*")
        .eq("discipulo_id", discipuloId)
        .single()

      if (progresso) {
        let videos_assistidos = progresso.videos_assistidos || []
        let artigos_lidos = progresso.artigos_lidos || []

        if (reflexao.tipo === 'video') {
          videos_assistidos = videos_assistidos.map((v: any) => 
            v.id === reflexao.conteudo_id ? { ...v, xp_ganho: xpConcedido, avaliado: true } : v
          )
        } else {
          artigos_lidos = artigos_lidos.map((a: any) => 
            a.id === reflexao.conteudo_id ? { ...a, xp_ganho: xpConcedido, avaliado: true } : a
          )
        }

        await supabase
          .from("progresso_fases")
          .update({
            videos_assistidos: reflexao.tipo === 'video' ? videos_assistidos : progresso.videos_assistidos,
            artigos_lidos: reflexao.tipo === 'artigo' ? artigos_lidos : progresso.artigos_lidos,
          })
          .eq("id", progresso.id)
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

      const { data: notificacao } = await supabase
        .from("notificacoes")
        .select("id")
        .eq("reflexao_id", reflexao.id)
        .maybeSingle()

      if (notificacao) {
        await supabase
          .from("notificacoes")
          .update({ lida: true })
          .eq("id", notificacao.id)
      }

      toast.success(`Reflexão aprovada! +${xpConcedido} XP concedido ao discípulo`)
      setOpen(false)
      
      if (onAprovado) {
        onAprovado()
      }
    } catch (error) {
      console.error("Erro ao aprovar reflexão:", error)
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
