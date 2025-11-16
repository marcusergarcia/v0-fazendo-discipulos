"use server"
import { createClient } from "@/lib/supabase/server"

interface SolicitarConviteData {
  nome: string
  email: string
  telefone?: string
  mensagem?: string
  discipuladorId: string
}

export async function solicitarConvite(data: SolicitarConviteData) {
  try {
    const supabase = await createClient()

    // Verificar se já existe uma solicitação pendente para este email e discipulador
    const { data: existente } = await supabase
      .from("solicitacoes_convite")
      .select("id")
      .eq("email", data.email)
      .eq("discipulador_id", data.discipuladorId)
      .eq("status", "pendente")
      .single()

    if (existente) {
      return {
        success: false,
        error: "Você já tem uma solicitação pendente para este discipulador",
      }
    }

    // Criar a solicitação
    const { error: insertError } = await supabase.from("solicitacoes_convite").insert({
      nome_completo: data.nome,
      email: data.email,
      telefone: data.telefone || null,
      mensagem: data.mensagem || null,
      discipulador_id: data.discipuladorId,
      status: "pendente",
    })

    if (insertError) throw insertError

    // Criar notificação para o discipulador
    const { error: notifError } = await supabase.from("notificacoes").insert({
      user_id: data.discipuladorId,
      tipo: "solicitacao_convite",
      titulo: "Nova Solicitação de Convite",
      mensagem: `${data.nome} solicitou um convite para iniciar o discipulado com você.`,
      lida: false,
    })

    if (notifError) console.error("[v0] Erro ao criar notificação:", notifError)

    console.log("[v0] Solicitação de convite criada:", data.email, "->", data.discipuladorId)

    return { success: true }
  } catch (error) {
    console.error("[v0] Erro ao solicitar convite:", error)
    return {
      success: false,
      error: "Erro ao enviar solicitação",
    }
  }
}
