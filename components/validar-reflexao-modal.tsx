"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, Loader2, HelpCircle, Target } from "lucide-react"
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
      if (reflexao.situacao === "aprovado") {
        toast.error("Esta reflexão já foi aprovada anteriormente")
        setLoading(false)
        setOpen(false)
        return
      }

      const { data: reflexaoAtual } = await supabase
        .from("reflexoes_conteudo")
        .select("situacao, xp_ganho")
        .eq("id", reflexao.id)
        .single()

      if (reflexaoAtual && reflexaoAtual.situacao === "aprovado") {
        toast.error("Esta reflexão já foi aprovada por outro processo")
        setLoading(false)
        setOpen(false)
        return
      }

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
        toast.error("Erro ao atualizar reflexão: " + updateReflexaoError.message)
        setLoading(false)
        return
      }

      if (!reflexaoAtualizada || reflexaoAtualizada.length === 0) {
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
      }

      // Atualizar XP total do discípulo
      const { data: disc } = await supabase.from("discipulos").select("xp_total").eq("id", discipuloId).single()

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
        await supabase.from("notificacoes").delete().eq("id", notificacao.id)
      }

      const { data: discipuloInfo } = await supabase
        .from("discipulos")
        .select("passo_atual")
        .eq("id", discipuloId)
        .single()

      if (discipuloInfo) {
        const passoAtual = discipuloInfo.passo_atual

        // Verificar todas as reflexões do passo
        const { data: todasReflexoes } = await supabase
          .from("reflexoes_conteudo")
          .select("situacao")
          .eq("discipulo_id", discipuloId)
          .eq("passo_numero", passoAtual)

        const todasReflexoesAprovadas =
          todasReflexoes && todasReflexoes.length > 0 ? todasReflexoes.every((r) => r.situacao === "aprovado") : false

        // Verificar se pergunta e missão estão aprovadas
        const { data: respostas } = await supabase
          .from("historico_respostas_passo")
          .select("situacao, tipo_resposta")
          .eq("discipulo_id", discipuloId)
          .eq("passo_numero", passoAtual)

        const perguntaAprovada = respostas?.some((r) => r.tipo_resposta === "pergunta" && r.situacao === "aprovado")
        const missaoAprovada = respostas?.some((r) => r.tipo_resposta === "missao" && r.situacao === "aprovado")

        // Se tudo aprovado, marcar passo como completado e liberar próximo
        if (todasReflexoesAprovadas && perguntaAprovada && missaoAprovada) {
          console.log("[v0] Todas as reflexões, pergunta e missão aprovadas! Verificando leitura bíblica...")

          const semanaCorrespondente = passoAtual // Passo 1 = Semana 1, Passo 2 = Semana 2, etc.

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

          // Marcar passo como completado
          await supabase
            .from("progresso_fases")
            .update({
              completado: true,
              data_completado: new Date().toISOString(),
            })
            .eq("discipulo_id", discipuloId)
            .eq("passo_numero", passoAtual)

          // Liberar próximo passo
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

      toast.success(`Reflexão aprovada! +${xpConcedido} XP concedido ao discípulo`)
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
          <DialogDescription>
            Leia a reflexão e as respostas do discípulo, depois forneça um feedback construtivo
          </DialogDescription>
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

          {respostaPergunta && (
            <div className="border-t pt-4">
              <Label className="text-sm font-medium flex items-center gap-2 mb-2">
                <HelpCircle className="w-4 h-4 text-primary" />
                Pergunta para Responder
              </Label>
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <p className="whitespace-pre-wrap text-sm">{respostaPergunta}</p>
              </div>
            </div>
          )}

          {respostaMissao && (
            <div className="border-t pt-4">
              <Label className="text-sm font-medium flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-secondary" />
                Missão Prática
              </Label>
              <div className="p-4 bg-secondary/5 rounded-lg border border-secondary/20">
                <p className="whitespace-pre-wrap text-sm">{respostaMissao}</p>
              </div>
            </div>
          )}

          <div className="border-t pt-4">
            <Label htmlFor="feedback">Seu Feedback (obrigatório)</Label>
            <Textarea
              id="feedback"
              placeholder="Escreva um feedback construtivo e encorajador sobre a reflexão e as respostas do discípulo..."
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

function getInsigniaNome(passo: number): string {
  const insignias: Record<number, string> = {
    1: "Insígnia: Criação",
    2: "Insígnia: Amor Divino",
    3: "Insígnia: Reconhecimento da Verdade",
    4: "Insígnia: Consciência",
    5: "Insígnia: Salvador",
    6: "Insígnia: Cruz e Ressurreição",
    7: "Insígnia: Graça",
    8: "Insígnia: Coração Quebrantado",
    9: "Insígnia: Confissão",
    10: "Insígnia: Novo Nascimento",
  }
  return insignias[passo] || "Insígnia Especial"
}
