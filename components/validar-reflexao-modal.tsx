"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, Loader2 } from "lucide-react"
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
    situacao?: string
    passo_numero: number
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
  const supabase = createClient()

  async function handleAprovar() {
    if (!feedback.trim()) {
      toast.error("Por favor, adicione um feedback antes de aprovar")
      return
    }

    setLoading(true)

    try {
      console.log("[v0] ===== INICIANDO APROVAÇÃO DE REFLEXÃO =====")
      console.log("[v0] Reflexão ID:", reflexao.id)
      console.log("[v0] Discípulo ID:", discipuloId)
      console.log("[v0] Tipo:", reflexao.tipo)
      console.log("[v0] Conteúdo ID:", reflexao.conteudo_id)
      console.log("[v0] Situação atual:", reflexao.situacao)

      if (reflexao.situacao === "aprovado") {
        toast.error("Esta reflexão já foi aprovada anteriormente")
        setLoading(false)
        setOpen(false)
        return
      }

      const { data: reflexaoAtual, error: selectError } = await supabase
        .from("reflexoes_conteudo")
        .select("id, situacao, xp_ganho")
        .eq("id", reflexao.id)
        .single()

      console.log("[v0] Reflexão encontrada no banco:", reflexaoAtual)

      if (selectError || !reflexaoAtual) {
        console.error("[v0] ERRO: Reflexão não encontrada!", selectError)
        toast.error("Erro: Reflexão não encontrada no banco de dados")
        setLoading(false)
        return
      }

      if (reflexaoAtual.situacao === "aprovado") {
        console.log("[v0] Reflexão já aprovada, cancelando")
        toast.error("Esta reflexão já foi aprovada por outro processo")
        setLoading(false)
        setOpen(false)
        return
      }

      console.log("[v0] Atualizando reflexão para aprovado...")
      const { data: reflexaoAtualizada, error: updateReflexaoError } = await supabase
        .from("reflexoes_conteudo")
        .update({
          feedback_discipulador: feedback,
          xp_ganho: xpConcedido,
          data_aprovacao: new Date().toISOString(),
          situacao: "aprovado",
        })
        .eq("id", reflexao.id)
        .select()

      if (updateReflexaoError) {
        console.error("[v0] ERRO ao atualizar reflexão:", updateReflexaoError)
        toast.error("Erro ao atualizar reflexão: " + updateReflexaoError.message)
        setLoading(false)
        return
      }

      console.log("[v0] Reflexão atualizada com sucesso:", reflexaoAtualizada)

      if (!reflexaoAtualizada || reflexaoAtualizada.length === 0) {
        console.error("[v0] ERRO: Nenhuma linha foi atualizada!")
        toast.error("Erro: Nenhuma reflexão foi atualizada")
        setLoading(false)
        return
      }

      const { data: progresso } = await supabase
        .from("progresso_fases")
        .select("*")
        .eq("discipulo_id", discipuloId)
        .eq("passo_numero", reflexao.passo_numero)
        .single()

      console.log("[v0] Progresso encontrado:", progresso)

      if (progresso) {
        let videos_assistidos = progresso.videos_assistidos || []
        let artigos_lidos = progresso.artigos_lidos || []
        let pontuacaoAtual = progresso.pontuacao_total || 0
        let reflexoesConcluidas = progresso.reflexoes_concluidas || 0

        if (reflexao.tipo === "video") {
          videos_assistidos = videos_assistidos.map((v: any) =>
            v.id === reflexao.conteudo_id ? { ...v, xp_ganho: xpConcedido, avaliado: true } : v,
          )
        } else {
          artigos_lidos = artigos_lidos.map((a: any) =>
            a.id === reflexao.conteudo_id ? { ...a, xp_ganho: xpConcedido, avaliado: true } : a,
          )
        }

        // Adicionar XP à pontuação total do passo
        pontuacaoAtual += xpConcedido
        reflexoesConcluidas += 1

        await supabase
          .from("progresso_fases")
          .update({
            videos_assistidos: reflexao.tipo === "video" ? videos_assistidos : progresso.videos_assistidos,
            artigos_lidos: reflexao.tipo === "artigo" ? artigos_lidos : progresso.artigos_lidos,
            pontuacao_total: pontuacaoAtual,
            reflexoes_concluidas: reflexoesConcluidas,
          })
          .eq("id", progresso.id)

        console.log("[v0] ✅ XP adicionado à pontuação do passo:", xpConcedido)
      }

      const { data: notificacao } = await supabase
        .from("notificacoes")
        .select("id")
        .eq("reflexao_id", reflexao.id)
        .maybeSingle()

      console.log("[v0] Notificação encontrada:", notificacao)

      if (notificacao) {
        const { error: deleteNotifError } = await supabase.from("notificacoes").delete().eq("id", notificacao.id)
        console.log("[v0] Notificação deletada. Erro?", deleteNotifError)
      }

      // Agora verifica apenas perguntas_reflexivas e leitura bíblica

      const { data: discipuloInfo } = await supabase
        .from("discipulos")
        .select("passo_atual")
        .eq("id", discipuloId)
        .single()

      if (discipuloInfo) {
        const passoAtual = discipuloInfo.passo_atual

        const { data: todasReflexoes } = await supabase
          .from("reflexoes_conteudo")
          .select("situacao")
          .eq("discipulo_id", discipuloId)
          .eq("passo_numero", passoAtual)

        const todasReflexoesAprovadas =
          todasReflexoes && todasReflexoes.length > 0 ? todasReflexoes.every((r) => r.situacao === "aprovado") : false

        const { data: perguntasReflexivas } = await supabase
          .from("perguntas_reflexivas")
          .select("situacao")
          .eq("discipulo_id", discipuloId)
          .eq("passo_numero", passoAtual)
          .maybeSingle()

        const perguntasReflexivasAprovadas = perguntasReflexivas?.situacao === "aprovado"

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
            return
          }

          const { data: progressoCompleto } = await supabase
            .from("progresso_fases")
            .select("pontuacao_total")
            .eq("discipulo_id", discipuloId)
            .eq("passo_numero", passoAtual)
            .single()

          const pontosDoPassoCompleto = progressoCompleto?.pontuacao_total || 0

          await supabase
            .from("progresso_fases")
            .update({
              completado: true,
              data_completado: new Date().toISOString(),
            })
            .eq("discipulo_id", discipuloId)
            .eq("passo_numero", passoAtual)

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

            const { data: progressoExistente } = await supabase
              .from("progresso_fases")
              .select("id")
              .eq("discipulo_id", discipuloId)
              .eq("passo_numero", proximoPasso)
              .maybeSingle()

            if (!progressoExistente) {
              const { data: progressoAtualCompleto } = await supabase
                .from("progresso_fases")
                .select("fase_numero")
                .eq("discipulo_id", discipuloId)
                .eq("passo_numero", passoAtual)
                .single()

              const faseNumero = progressoAtualCompleto?.fase_numero || 1

              await supabase.from("progresso_fases").insert({
                discipulo_id: discipuloId,
                fase_numero: faseNumero,
                passo_numero: proximoPasso,
                pontuacao_total: 0,
                completado: false,
                videos_assistidos: [],
                artigos_lidos: [],
                reflexoes_concluidas: 0,
                data_inicio: new Date().toISOString(),
                dias_no_passo: 0,
                alertado_tempo_excessivo: false,
                enviado_para_validacao: false,
              })
            }

            console.log(`[v0] Passo ${proximoPasso} liberado automaticamente!`)
            toast.success(`Parabéns! Passo ${passoAtual} concluído. Passo ${proximoPasso} liberado!`)
          }
        }
      }

      console.log("[v0] ===== APROVAÇÃO CONCLUÍDA COM SUCESSO =====")
      toast.success(`Reflexão aprovada! +${xpConcedido} XP será creditado ao completar o passo`)
      setOpen(false)

      if (onAprovado) {
        onAprovado(xpConcedido)
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
