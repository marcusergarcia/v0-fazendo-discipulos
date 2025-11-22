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

  const handleAprovar = async () => {
    console.log("[v0] ============ INICIANDO APROVAÇÃO ============")
    console.log("[v0] Tipo:", tipo)
    console.log("[v0] TarefaId:", tarefaId)
    console.log("[v0] DiscipuloId:", discipuloId)

    setLoading(true)

    try {
      if (tipo === "reflexao") {
        console.log("[v0] 📹 APROVANDO REFLEXÃO...")

        // Primeiro, buscar a reflexão para pegar o discipulo_id correto
        const { data: reflexao, error: reflexaoFetchError } = await supabase
          .from("reflexoes_conteudo")
          .select("*")
          .eq("id", tarefaId)
          .single()

        console.log("[v0] Reflexão encontrada:", reflexao)
        console.log("[v0] Erro ao buscar reflexão?", reflexaoFetchError)

        if (!reflexao) {
          console.error("[v0] ❌ Reflexão não encontrada!")
          toast.error("Reflexão não encontrada")
          setLoading(false)
          return
        }

        // Atualizar situação para "aprovado"
        console.log("[v0] Atualizando reflexão para 'aprovado'...")
        const { error: updateError } = await supabase
          .from("reflexoes_conteudo")
          .update({
            situacao: "aprovado",
            data_aprovacao: new Date().toISOString(),
          })
          .eq("id", tarefaId)

        console.log("[v0] Reflexão atualizada. Erro?", updateError)

        if (updateError) {
          console.error("[v0] ❌ Erro ao atualizar reflexão:", updateError)
          toast.error("Erro ao aprovar reflexão")
          setLoading(false)
          return
        }

        // Buscar e deletar notificação
        console.log("[v0] Buscando notificações para deletar...")
        console.log("[v0] Filtros:", {
          user_id: (await supabase.auth.getUser()).data.user?.id,
          discipulo_id: discipuloId,
          reflexao_id: tarefaId,
        })

        const { data: notificacoesParaDeletar, error: fetchNotifError } = await supabase
          .from("notificacoes")
          .select("*")
          .eq("user_id", (await supabase.auth.getUser()).data.user?.id!)
          .eq("discipulo_id", discipuloId)
          .eq("reflexao_id", tarefaId)

        console.log("[v0] 🔔 Notificações encontradas para deletar:", notificacoesParaDeletar?.length || 0)
        console.log("[v0] Detalhes das notificações:", notificacoesParaDeletar)
        console.log("[v0] Erro ao buscar notificações?", fetchNotifError)

        if (notificacoesParaDeletar && notificacoesParaDeletar.length > 0) {
          console.log("[v0] Deletando notificações...")
          const { error: deleteError } = await supabase
            .from("notificacoes")
            .delete()
            .eq("user_id", (await supabase.auth.getUser()).data.user?.id!)
            .eq("discipulo_id", discipuloId)
            .eq("reflexao_id", tarefaId)

          console.log("[v0] Notificações deletadas. Erro?", deleteError)

          if (deleteError) {
            console.error("[v0] ❌ Erro ao deletar notificações:", deleteError)
          } else {
            console.log("[v0] ✅ Notificações deletadas com sucesso!")
          }
        } else {
          console.log("[v0] ⚠️ Nenhuma notificação encontrada para deletar")
        }

        // Conceder XP
        console.log("[v0] Concedendo XP ao discípulo...")
        const { error: xpError } = await supabase.rpc("adicionar_xp_discipulo", {
          p_discipulo_id: discipuloId,
          p_quantidade_xp: xpBase,
        })

        console.log("[v0] XP concedido. Erro?", xpError)

        if (xpError) {
          console.error("[v0] ❌ Erro ao conceder XP:", xpError)
        }

        toast.success("Reflexão aprovada!")
        console.log("[v0] ============ APROVAÇÃO CONCLUÍDA ============")

        console.log("[v0] Revalidando dados...")
        try {
          await fetch("/api/revalidate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paths: ["/discipulador", `/discipulador/tarefas/${discipuloId}`] }),
          })
          console.log("[v0] ✅ Páginas revalidadas com sucesso")
        } catch (err) {
          console.log("[v0] ⚠️ Erro ao revalidar:", err)
        }

        router.refresh()
        setLoading(false)
      } else {
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
        router.refresh()
      }

      console.log("[v0] === FIM DA APROVAÇÃO - REVALIDANDO DADOS ===")
    } catch (error) {
      console.error("[v0] ❌ ERRO NA APROVAÇÃO:", error)
      toast.error("Erro ao aprovar")
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
      console.log("[v0] === FIM DA REJEIÇÃO - REVALIDANDO DADOS ===")

      try {
        await fetch("/api/revalidate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paths: ["/discipulador", `/discipulador/tarefas/${discipuloId}`] }),
        })
        console.log("[v0] ✅ Páginas revalidadas após rejeição")
      } catch (err) {
        console.log("[v0] ⚠️ Erro ao revalidar:", err)
      }

      router.refresh()
      setLoading(false)
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
