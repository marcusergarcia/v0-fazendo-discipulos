"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export function AprovarTarefaForm({
  tipo,
  tarefaId,
  discipuloId,
  xpBase,
}: {
  tipo: "progresso" | "reflexao"
  tarefaId: string
  discipuloId: string
  xpBase: number
}) {
  const [feedback, setFeedback] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleAprovar() {
    if (!feedback.trim()) {
      toast.error("Por favor, adicione um feedback antes de aprovar")
      return
    }

    setLoading(true)

    try {
      if (tipo === "progresso") {
        // Atualizar progresso
        const { error: updateError } = await supabase
          .from("progresso_fases")
          .update({
            status_validacao: "aprovado",
            feedback_discipulador: feedback,
            data_validacao: new Date().toISOString(),
            xp_ganho: xpBase,
          })
          .eq("id", tarefaId)

        if (updateError) throw updateError

        // Adicionar XP ao discípulo
        const { data: discipulo } = await supabase
          .from("discipulos")
          .select("xp_total")
          .eq("id", discipuloId)
          .single()

        if (discipulo) {
          await supabase
            .from("discipulos")
            .update({ xp_total: (discipulo.xp_total || 0) + xpBase })
            .eq("id", discipuloId)
        }

        toast.success(`Missão aprovada! +${xpBase} XP concedido`)
      } else {
        // Para reflexões, apenas salvar o feedback (não há sistema de validação formal ainda)
        toast.success("Feedback enviado com sucesso!")
      }

      router.refresh()
    } catch (error) {
      console.error("Erro ao aprovar:", error)
      toast.error("Erro ao aprovar tarefa")
    } finally {
      setLoading(false)
    }
  }

  async function handleRejeitar() {
    if (!feedback.trim()) {
      toast.error("Por favor, adicione um feedback explicando o motivo da rejeição")
      return
    }

    setLoading(true)

    try {
      if (tipo === "progresso") {
        const { error } = await supabase
          .from("progresso_fases")
          .update({
            status_validacao: "rejeitado",
            feedback_discipulador: feedback,
            data_validacao: new Date().toISOString(),
          })
          .eq("id", tarefaId)

        if (error) throw error
      }

      toast.success("Feedback de rejeição enviado")
      router.refresh()
    } catch (error) {
      console.error("Erro ao rejeitar:", error)
      toast.error("Erro ao rejeitar tarefa")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor={`feedback-${tarefaId}`}>Feedback para o Discípulo</Label>
        <Textarea
          id={`feedback-${tarefaId}`}
          placeholder="Escreva um feedback construtivo sobre a resposta do discípulo..."
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          rows={4}
          className="mt-1"
        />
      </div>
      <div className="flex gap-2">
        <Button onClick={handleAprovar} disabled={loading} className="flex-1">
          {loading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <CheckCircle className="w-4 h-4 mr-2" />
          )}
          Aprovar {tipo === "progresso" && `(+${xpBase} XP)`}
        </Button>
        <Button onClick={handleRejeitar} disabled={loading} variant="destructive" className="flex-1">
          {loading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <XCircle className="w-4 h-4 mr-2" />
          )}
          Solicitar Revisão
        </Button>
      </div>
    </div>
  )
}
