"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CheckCircle, AlertCircle } from 'lucide-react'
import { createClient } from "@/lib/supabase/client"
import { PASSOS_CONTEUDO } from "@/constants/passos-conteudo"

type AvaliarRespostasModalProps = {
  resposta: {
    id: string
    discipulo_id: string
    fase_numero: number
    passo_numero: number
    tipo_resposta: 'pergunta' | 'missao'
    resposta: string // Usar campo unificado 'resposta'
    situacao: string
    notificacao_id: string | null
  }
  discipuloNome: string
  onAprovado?: (xp: number) => void
}

export default function AvaliarRespostasModal({
  resposta,
  discipuloNome,
  onAprovado,
}: AvaliarRespostasModalProps) {
  const [open, setOpen] = useState(false)
  const [xp, setXp] = useState(10)
  const [feedback, setFeedback] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const conteudoPasso = PASSOS_CONTEUDO[resposta.passo_numero as keyof typeof PASSOS_CONTEUDO]
  const textoPergunta = resposta.tipo_resposta === 'pergunta' 
    ? conteudoPasso?.perguntaChave 
    : conteudoPasso?.missao

  const handleAprovar = async () => {
    if (resposta.situacao === "aprovado") {
      setError("Esta resposta já foi aprovada anteriormente.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      // Aprovar a resposta
      const { error: updateError } = await supabase
        .from("historico_respostas_passo")
        .update({
          situacao: "aprovado",
          xp_ganho: xp,
          feedback_discipulador: feedback,
          data_aprovacao: new Date().toISOString(),
        })
        .eq("id", resposta.id)

      if (updateError) {
        console.error("[v0] Erro ao atualizar resposta:", updateError)
        setError("Erro ao aprovar resposta")
        setLoading(false)
        return
      }

      // Marcar notificação como lida
      if (resposta.notificacao_id) {
        await supabase
          .from("notificacoes")
          .update({ lida: true })
          .eq("id", resposta.notificacao_id)
      }

      const { data: progresso } = await supabase
        .from("progresso_fases")
        .select("pontuacao_total")
        .eq("discipulo_id", resposta.discipulo_id)
        .eq("passo_numero", resposta.passo_numero)
        .single()

      if (progresso) {
        const novaPontuacao = (progresso.pontuacao_total || 0) + xp
        await supabase
          .from("progresso_fases")
          .update({ pontuacao_total: novaPontuacao })
          .eq("discipulo_id", resposta.discipulo_id)
          .eq("passo_numero", resposta.passo_numero)
      }

      const { data: discipulo } = await supabase
        .from("discipulos")
        .select("xp_total, passo_atual")
        .eq("id", resposta.discipulo_id)
        .single()

      if (discipulo) {
        await supabase
          .from("discipulos")
          .update({ xp_total: (discipulo.xp_total || 0) + xp })
          .eq("id", resposta.discipulo_id)

        const { data: respostasPassoAtual } = await supabase
          .from("historico_respostas_passo")
          .select("situacao, tipo_resposta")
          .eq("discipulo_id", resposta.discipulo_id)
          .eq("passo_numero", resposta.passo_numero)
          .eq("fase_numero", resposta.fase_numero)

        const perguntaAprovada = respostasPassoAtual?.some(
          r => r.tipo_resposta === 'pergunta' && r.situacao === 'aprovado'
        )
        const missaoAprovada = respostasPassoAtual?.some(
          r => r.tipo_resposta === 'missao' && r.situacao === 'aprovado'
        )

        const { data: reflexoes } = await supabase
          .from("reflexoes_conteudo")
          .select("situacao")
          .eq("discipulo_id", resposta.discipulo_id)
          .eq("passo_numero", resposta.passo_numero)

        const todasReflexoesAprovadas = reflexoes && reflexoes.length > 0
          ? reflexoes.every(r => r.situacao === 'aprovado')
          : false

        // Se tudo aprovado, marcar passo como completado e liberar próximo
        if (perguntaAprovada && missaoAprovada && todasReflexoesAprovadas) {
          // Marcar passo como completado
          await supabase
            .from("progresso_fases")
            .update({
              completado: true,
              data_completado: new Date().toISOString(),
            })
            .eq("discipulo_id", resposta.discipulo_id)
            .eq("passo_numero", resposta.passo_numero)

          // Liberar próximo passo
          const proximoPasso = resposta.passo_numero + 1
          
          if (proximoPasso <= 10) {
            await supabase
              .from("discipulos")
              .update({ passo_atual: proximoPasso })
              .eq("id", resposta.discipulo_id)

            console.log(`[v0] Passo ${proximoPasso} liberado automaticamente!`)
          }
        }
      }

      setOpen(false)
      onAprovado?.(xp)
      window.location.reload()
    } catch (error: any) {
      console.error("[v0] Erro:", error)
      setError(error.message || "Erro ao aprovar resposta")
    } finally {
      setLoading(false)
    }
  }

  const titulo = resposta.tipo_resposta === 'pergunta' ? 'Pergunta para Responder' : 'Missão Prática'

  return (
    <>
      <Button
        size="sm"
        onClick={() => setOpen(true)}
        className="bg-primary"
      >
        <CheckCircle className="w-4 h-4 mr-1" />
        Avaliar
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-primary" />
              Avaliar {titulo} - Passo {resposta.passo_numero}
            </DialogTitle>
            <DialogDescription>
              Discípulo: {discipuloNome}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="border rounded-lg p-4 bg-muted/30">
              <h3 className="font-semibold text-base mb-2 text-secondary">
                {titulo}
              </h3>
              <p className="text-sm font-medium mb-3 text-muted-foreground">
                {textoPergunta}
              </p>
              <div className="bg-background rounded-md p-3 border">
                <p className="text-sm whitespace-pre-wrap">
                  {resposta.resposta}
                </p>
              </div>
            </div>

            <div>
              <Label htmlFor="xp" className="text-sm font-semibold">
                XP a conceder
              </Label>
              <Input
                id="xp"
                type="number"
                min="0"
                max="50"
                value={xp}
                onChange={(e) => setXp(parseInt(e.target.value) || 0)}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Recomendado: 10 XP por resposta
              </p>
            </div>

            <div>
              <Label htmlFor="feedback" className="text-sm font-semibold">
                Feedback (opcional)
              </Label>
              <Textarea
                id="feedback"
                placeholder="Deixe um comentário motivacional ou sugestão de melhoria..."
                className="mt-2 min-h-24"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleAprovar}
              disabled={loading || xp <= 0}
            >
              {loading ? "Aprovando..." : "Aprovar e Conceder XP"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
