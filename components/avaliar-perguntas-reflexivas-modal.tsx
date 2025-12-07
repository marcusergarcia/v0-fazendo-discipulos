"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { FileText, CheckCircle, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { PERGUNTAS_POR_PASSO } from "@/constants/perguntas-passos"

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
  const supabase = createClient()

  const perguntasTexto = PERGUNTAS_POR_PASSO[perguntasResposta.passo_numero] || []

  async function handleAprovar() {
    if (!feedback.trim()) {
      toast.error("Por favor, adicione um feedback antes de aprovar")
      return
    }

    setLoading(true)

    try {
      console.log("[v0] ===== INICIANDO APROVAÇÃO DE PERGUNTAS REFLEXIVAS =====")
      console.log("[v0] Perguntas ID:", perguntasResposta.id)
      console.log("[v0] Discípulo ID:", discipuloId)
      console.log("[v0] Situação atual:", perguntasResposta.situacao)

      if (perguntasResposta.situacao === "aprovado") {
        toast.error("Estas perguntas já foram aprovadas anteriormente")
        setLoading(false)
        setOpen(false)
        return
      }

      console.log("[v0] Atualizando perguntas reflexivas para aprovado...")
      const { data: perguntasAtualizadas, error: updateError } = await supabase
        .from("perguntas_reflexivas")
        .update({
          feedback_discipulador: feedback,
          xp_ganho: xpConcedido,
          data_aprovacao: new Date().toISOString(),
          situacao: "aprovado",
        })
        .eq("id", perguntasResposta.id)
        .select()

      if (updateError) {
        console.error("[v0] ERRO ao atualizar perguntas:", updateError)
        toast.error("Erro ao atualizar perguntas: " + updateError.message)
        setLoading(false)
        return
      }

      console.log("[v0] Perguntas atualizadas com sucesso:", perguntasAtualizadas)

      const { data: progresso } = await supabase
        .from("progresso_fases")
        .select("*")
        .eq("discipulo_id", discipuloId)
        .single()

      console.log("[v0] Progresso encontrado:", progresso)

      if (progresso) {
        const pontuacaoAtual = progresso.pontuacao_passo_atual || 0
        const novaPontuacao = pontuacaoAtual + xpConcedido

        await supabase
          .from("progresso_fases")
          .update({
            pontuacao_passo_atual: novaPontuacao,
          })
          .eq("discipulo_id", discipuloId)

        console.log("[v0] ✅ XP adicionado à pontuação do passo:", xpConcedido)
      }

      const { data: notificacao } = await supabase
        .from("notificacoes")
        .select("id")
        .eq("perguntas_reflexivas_id", perguntasResposta.id)
        .maybeSingle()

      console.log("[v0] Notificação de perguntas reflexivas encontrada:", notificacao)

      if (notificacao) {
        const { error: deleteNotifError } = await supabase.from("notificacoes").delete().eq("id", notificacao.id)
        console.log("[v0] Notificação deletada. Erro?", deleteNotifError)
      }

      const { data: discipuloInfo } = await supabase
        .from("discipulos")
        .select("passo_atual")
        .eq("id", discipuloId)
        .single()

      console.log("[v0] Discipulo info encontrado:", discipuloInfo)

      if (discipuloInfo) {
        const passoAtual = discipuloInfo.passo_atual

        const { data: todasReflexoes } = await supabase
          .from("reflexoes_conteudo")
          .select("situacao")
          .eq("discipulo_id", discipuloId)
          .eq("passo_numero", passoAtual)

        const todasReflexoesAprovadas =
          todasReflexoes && todasReflexoes.length > 0 ? todasReflexoes.every((r) => r.situacao === "aprovado") : false

        const perguntasReflexivasAprovadas = true

        if (todasReflexoesAprovadas && perguntasReflexivasAprovadas) {
          console.log("[v0] Todas as reflexões e perguntas reflexivas aprovadas! Verificando leitura bíblica...")

          const semanaCorrespondente = passoAtual

          const { data: planoSemana } = await supabase
            .from("plano_leitura_biblica")
            .select("capitulos_semana")
            .eq("semana", semanaCorrespondente)
            .single()

          let leituraBiblicaConcluida = false
          if (planoSemana && planoSemana.capitulos_semana) {
            const { data: leiturasDiscipulo } = await supabase
              .from("leituras_capitulos")
              .select("capitulos_lidos")
              .eq("discipulo_id", discipuloId)
              .single()

            const capitulosLidos = new Set(leiturasDiscipulo?.capitulos_lidos || [])
            const capitulosSemana = planoSemana.capitulos_semana
            leituraBiblicaConcluida = capitulosSemana.every((cap: string) => capitulosLidos.has(Number.parseInt(cap)))

            console.log("[v0] Verificação leitura bíblica:", {
              semana: semanaCorrespondente,
              capitulosSemana,
              capitulosLidos: Array.from(capitulosLidos),
              leituraConcluida: leituraBiblicaConcluida,
            })
          }

          if (!leituraBiblicaConcluida) {
            toast.warning(`Leitura bíblica da semana ${semanaCorrespondente} ainda não foi concluída`)
            setLoading(false)
            setOpen(false)
            onAprovado?.(xpConcedido)
            return
          }

          const { data: progressoCompleto } = await supabase
            .from("progresso_fases")
            .select("pontuacao_passo_atual")
            .eq("discipulo_id", discipuloId)
            .single()

          const pontosDoPassoCompleto = progressoCompleto?.pontuacao_passo_atual || 0

          await supabase
            .from("progresso_fases")
            .update({
              pontuacao_passo_atual: 0,
              reflexoes_concluidas: 0,
              videos_assistidos: [],
              artigos_lidos: [],
            })
            .eq("discipulo_id", discipuloId)

          const { data: disc } = await supabase.from("discipulos").select("xp_total").eq("id", discipuloId).single()

          if (disc) {
            await supabase
              .from("discipulos")
              .update({ xp_total: (disc.xp_total || 0) + pontosDoPassoCompleto })
              .eq("id", discipuloId)

            console.log("[v0] ✅ Transferidos", pontosDoPassoCompleto, "XP do passo para xp_total do discípulo")
          }

          const proximoPasso = passoAtual + 1

          if (proximoPasso <= 10) {
            await supabase.from("discipulos").update({ passo_atual: proximoPasso }).eq("id", discipuloId)

            console.log(`[v0] Passo ${proximoPasso} liberado automaticamente!`)
            toast.success(`Parabéns! Passo ${passoAtual} concluído. Passo ${proximoPasso} liberado!`)
          }
        }
      }

      console.log("[v0] ===== APROVAÇÃO CONCLUÍDA COM SUCESSO =====")
      toast.success(`Perguntas reflexivas aprovadas! +${xpConcedido} XP concedido`)
      setOpen(false)

      if (onAprovado) {
        onAprovado(xpConcedido)
      }
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
