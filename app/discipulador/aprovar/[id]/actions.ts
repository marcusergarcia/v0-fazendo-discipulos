"use server"

import { createClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function aprovarDiscipulo(discipuloId: string) {
  try {
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const { data: discipulo, error: fetchError } = await supabaseAdmin
      .from("discipulos")
      .select("*")
      .eq("id", discipuloId)
      .single()

    if (fetchError || !discipulo) {
      throw new Error("Discípulo não encontrado")
    }

    if (discipulo.aprovado_discipulador) {
      throw new Error("Discípulo já foi aprovado anteriormente")
    }

    if (!discipulo.email_temporario || !discipulo.senha_temporaria) {
      throw new Error("Dados temporários não encontrados")
    }

    let userId: string

    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
    const existingUser = existingUsers?.users.find((u) => u.email === discipulo.email_temporario)

    if (existingUser) {
      console.log("[v0] Usuário Auth existente encontrado, deletando:", existingUser.id)

      // Deletar profile antigo se existir
      await supabaseAdmin.from("profiles").delete().eq("id", existingUser.id)

      // Deletar usuário Auth antigo
      const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(existingUser.id)

      if (deleteAuthError) {
        console.error("[v0] Erro ao deletar usuário Auth existente:", deleteAuthError)
        throw new Error(`Não foi possível remover usuário existente: ${deleteAuthError.message}`)
      }

      console.log("[v0] Usuário Auth existente deletado com sucesso")
    }

    // Criar novo usuário Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: discipulo.email_temporario,
      password: discipulo.senha_temporaria,
      email_confirm: true,
    })

    if (authError) throw new Error(`Erro ao criar usuário: ${authError.message}`)
    if (!authData.user) throw new Error("Erro ao criar usuário")

    userId = authData.user.id
    console.log("[v0] Novo usuário Auth criado:", userId)

    const { error: profileError } = await supabaseAdmin.from("profiles").insert({
      id: userId,
      email: discipulo.email_temporario,
      nome_completo: discipulo.nome_completo_temp,
      telefone: discipulo.telefone_temp,
      igreja: discipulo.igreja_temp,
      genero: discipulo.genero_temp,
      etnia: discipulo.etnia_temp,
      data_nascimento: discipulo.data_nascimento_temp,
      foto_perfil_url: discipulo.foto_perfil_url_temp,
      aceitou_lgpd: discipulo.aceitou_lgpd,
      aceitou_compromisso: discipulo.aceitou_compromisso,
      data_aceite_termos: discipulo.data_aceite_termos,
      localizacao_cadastro: discipulo.localizacao_cadastro,
      latitude_cadastro: discipulo.latitude_cadastro,
      longitude_cadastro: discipulo.longitude_cadastro,
      data_cadastro: discipulo.data_cadastro,
      hora_cadastro: discipulo.hora_cadastro,
      semana_cadastro: discipulo.semana_cadastro,
      status: "ativo",
    })

    if (profileError) throw new Error(`Erro ao criar perfil: ${profileError.message}`)
    console.log("[v0] Novo profile criado")

    const { error: updateError } = await supabaseAdmin
      .from("discipulos")
      .update({
        user_id: userId,
        aprovado_discipulador: true,
        data_aprovacao_discipulador: new Date().toISOString(),
        status: "ativo",
        // Limpar dados temporários
        email_temporario: null,
        senha_temporaria: null,
      })
      .eq("id", discipuloId)

    if (updateError) throw new Error(`Erro ao atualizar discípulo: ${updateError.message}`)

    const { error: recompensaError } = await supabaseAdmin.from("recompensas").insert({
      discipulo_id: discipuloId,
      tipo_recompensa: "boas_vindas",
      nome_recompensa: "Bem-vindo ao Fazendo Discípulos!",
      descricao: "Você foi aprovado e começou sua jornada de discipulado!",
      conquistado_em: new Date().toISOString(),
    })

    if (recompensaError) {
      console.error("[v0] Erro ao criar recompensa inicial:", recompensaError)
      // Não falhar a aprovação por causa disso
    }

    await supabaseAdmin
      .from("notificacoes")
      .delete()
      .eq("user_id", discipulo.discipulador_id)
      .eq("link", `/discipulador/aprovar/${discipuloId}`)

    // Criar notificação de boas-vindas para o novo discípulo
    await supabaseAdmin.from("notificacoes").insert({
      user_id: userId,
      tipo: "aprovacao_aceita",
      titulo: "Cadastro Aprovado!",
      mensagem: `Seu cadastro foi aprovado! Bem-vindo ao Fazendo Discípulos. Você já pode fazer login e começar sua jornada.`,
      link: "/dashboard",
      lida: false,
    })

    revalidatePath("/discipulador/aprovar")
    revalidatePath("/dashboard/arvore")

    const linkBoasVindas = `${process.env.NEXT_PUBLIC_SITE_URL || "https://fazendodiscipulos.vercel.app"}/boas-vindas-discipulo`

    return {
      success: true,
      userId,
      linkBoasVindas,
      email: discipulo.email_temporario,
    }
  } catch (error) {
    console.error("[v0] Erro ao aprovar discípulo:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido ao aprovar discípulo",
    }
  }
}

export async function rejeitarDiscipulo(discipuloId: string, motivo?: string) {
  try {
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const { data: discipulo } = await supabaseAdmin.from("discipulos").select("*").eq("id", discipuloId).single()

    if (!discipulo) {
      throw new Error("Discípulo não encontrado")
    }

    await supabaseAdmin
      .from("notificacoes")
      .delete()
      .eq("user_id", discipulo.discipulador_id)
      .eq("link", `/discipulador/aprovar/${discipuloId}`)

    const { error: deleteError } = await supabaseAdmin.from("discipulos").delete().eq("id", discipuloId)

    if (deleteError) throw new Error(`Erro ao rejeitar discípulo: ${deleteError.message}`)

    // Notificar o discipulador da rejeição
    await supabaseAdmin.from("notificacoes").insert({
      user_id: discipulo.discipulador_id,
      tipo: "discipulo_rejeitado",
      titulo: "Discípulo Rejeitado",
      mensagem: `Você rejeitou o cadastro de ${discipulo.nome_completo_temp}. ${motivo ? `Motivo: ${motivo}` : ""}`,
      lida: false,
    })

    revalidatePath("/discipulador/aprovar")

    return { success: true }
  } catch (error) {
    console.error("[v0] Erro ao rejeitar discípulo:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido ao rejeitar discípulo",
    }
  }
}
