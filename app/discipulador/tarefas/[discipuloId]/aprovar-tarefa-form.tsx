"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
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

  useEffect(() => {
    console.log("[v0] 🔷 AprovarTarefaForm MONTADO")
    console.log("[v0] Dados:", {
      tipo,
      tarefaId,
      discipuloId,
      xpBase,
    })
  }, [tipo, tarefaId, discipuloId, xpBase])

  async function handleAprovar() {
    if (!feedback.trim()) {
      toast.error("Por favor, adicione um feedback antes de aprovar")
      return
    }

    setLoading(true)
    console.log("[v0] === INÍCIO DA APROVAÇÃO ===")
    console.log("[v0] Tipo:", tipo)
    console.log("[v0] Tarefa ID:", tarefaId)
    console.log("[v0] Discípulo ID:", discipuloId)

    try {
      if (tipo === "progresso") {
        // Atualizar progresso
        const { error: updateError } = await supabase
          .from("progresso_fases")
          .update({
            enviado_para_validacao: false,
            completado: true,
            feedback_discipulador: feedback,
            data_atualizacao: new Date().toISOString(),
            xp_ganho: xpBase,
          })
          .eq("id", tarefaId)

        if (updateError) throw updateError

        // Adicionar XP ao discípulo
        const { data: discipulo } = await supabase.from("discipulos").select("xp_total").eq("id", discipuloId).single()

        if (discipulo) {
          await supabase
            .from("discipulos")
            .update({ xp_total: (discipulo.xp_total || 0) + xpBase })
            .eq("id", discipuloId)
        }

        toast.success(`Missão aprovada! +${xpBase} XP concedido`)
      } else {
        console.log("[v0] 📹 Aprovando reflexão...")

        const { data: reflexao, error: fetchError } = await supabase
          .from("reflexoes_conteudo")
          .select("*")
          .eq("id", tarefaId)
          .single()

        console.log("[v0] Reflexão encontrada:", reflexao ? "SIM" : "NÃO")
        if (reflexao) {
          console.log("[v0] Dados da reflexão:", {
            id: reflexao.id,
            discipulo_id: reflexao.discipulo_id,
            situacao: reflexao.situacao,
            titulo: reflexao.titulo,
          })
        }
        if (fetchError) {
          console.error("[v0] ❌ Erro ao buscar reflexão:", fetchError)
        }

        const { error: updateError } = await supabase
          .from("reflexoes_conteudo")
          .update({
            situacao: "aprovado",
            feedback_discipulador: feedback,
            xp_ganho: xpBase,
          })
          .eq("id", tarefaId)

        if (updateError) {
          console.error("[v0] ❌ Erro ao atualizar reflexão:", updateError)
          throw updateError
        }
        console.log("[v0] ✅ Reflexão atualizada para 'aprovado'")

        const {
          data: { user },
        } = await supabase.auth.getUser()

        console.log("[v0] User ID do discipulador:", user?.id)

        if (user) {
          console.log("[v0] 🔍 Buscando notificação para deletar...")
          console.log("[v0] Filtros: user_id =", user.id, "discipulo_id =", discipuloId, "reflexao_id =", tarefaId)

          const { data: notificacoes, error: fetchNotifError } = await supabase
            .from("notificacoes")
            .select("*")
            .eq("user_id", user.id)
            .eq("discipulo_id", discipuloId)
            .eq("reflexao_id", tarefaId)

          console.log("[v0] Notificações encontradas:", notificacoes?.length || 0)
          if (notificacoes && notificacoes.length > 0) {
            notificacoes.forEach((notif) => {
              console.log("[v0] Notificação:", {
                id: notif.id,
                user_id: notif.user_id,
                discipulo_id: notif.discipulo_id,
                reflexao_id: notif.reflexao_id,
                tipo: notif.tipo,
              })
            })
          }
          if (fetchNotifError) {
            console.error("[v0] ❌ Erro ao buscar notificações:", fetchNotifError)
          }

          if (notificacoes && notificacoes.length > 0) {
            console.log("[v0] 🗑️ Deletando", notificacoes.length, "notificação(ões)...")
            const { error: deleteNotifError } = await supabase
              .from("notificacoes")
              .delete()
              .eq("user_id", user.id)
              .eq("discipulo_id", discipuloId)
              .eq("reflexao_id", tarefaId)

            if (deleteNotifError) {
              console.error("[v0] ❌ Erro ao deletar notificação:", deleteNotifError)
            } else {
              console.log("[v0] ✅ Notificação deletada com sucesso!")
            }
          } else {
            console.log("[v0] ⚠️ Nenhuma notificação encontrada para deletar")
          }
        }

        // Adicionar XP ao discípulo
        const { data: discipulo } = await supabase.from("discipulos").select("xp_total").eq("id", discipuloId).single()

        if (discipulo) {
          await supabase
            .from("discipulos")
            .update({ xp_total: (discipulo.xp_total || 0) + xpBase })
            .eq("id", discipuloId)
        }

        toast.success(`Reflexão aprovada! +${xpBase} XP concedido`)
      }

      console.log("[v0] === FIM DA APROVAÇÃO - RECARREGANDO PÁGINA ===")
      window.location.reload()
    } catch (error) {
      console.error("Erro ao aprovar:", error)
      toast.error("Erro ao aprovar tarefa")
      setLoading(false)
    }
  }

  async function handleRejeitar() {
    if (!feedback.trim()) {
      toast.error("Por favor, adicione um feedback explicando o motivo da rejeição")
      return
    }

    setLoading(true)
    console.log("[v0] === INÍCIO DA REJEIÇÃO ===")
    console.log("[v0] Tipo:", tipo)
    console.log("[v0] Tarefa ID:", tarefaId)

    try {
      if (tipo === "progresso") {
        const { error } = await supabase
          .from("progresso_fases")
          .update({
            enviado_para_validacao: false,
            feedback_discipulador: feedback,
            data_atualizacao: new Date().toISOString(),
          })
          .eq("id", tarefaId)

        if (error) throw error
      } else {
        console.log("[v0] 📹 Rejeitando reflexão...")

        const { error } = await supabase
          .from("reflexoes_conteudo")
          .update({
            situacao: "reprovado",
            feedback_discipulador: feedback,
          })
          .eq("id", tarefaId)

        if (error) throw error
        console.log("[v0] ✅ Reflexão marcada como reprovada")

        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          console.log("[v0] 🗑️ Deletando notificação após rejeição...")
          const { error: deleteNotifError } = await supabase
            .from("notificacoes")
            .delete()
            .eq("user_id", user.id)
            .eq("discipulo_id", discipuloId)
            .eq("reflexao_id", tarefaId)

          if (deleteNotifError) {
            console.error("[v0] ❌ Erro ao deletar notificação:", deleteNotifError)
          } else {
            console.log("[v0] ✅ Notificação deletada!")
          }
        }
      }

      toast.success("Feedback de rejeição enviado")
      console.log("[v0] === FIM DA REJEIÇÃO - RECARREGANDO PÁGINA ===")
      window.location.reload()
    } catch (error) {
      console.error("Erro ao rejeitar:", error)
      toast.error("Erro ao rejeitar tarefa")
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
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
          Aprovar {tipo === "progresso" && `(+${xpBase} XP)`}
        </Button>
        <Button onClick={handleRejeitar} disabled={loading} variant="destructive" className="flex-1">
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
          Solicitar Revisão
        </Button>
      </div>
    </div>
  )
}
