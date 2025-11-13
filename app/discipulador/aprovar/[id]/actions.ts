"use server"

import { createClient } from "@supabase/supabase-js"

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

    if (!discipulo.email_temporario || !discipulo.senha_temporaria) {
      throw new Error("Dados de cadastro incompletos")
    }

    console.log("[v0] Aprovando discípulo:", discipulo.email_temporario)

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: discipulo.email_temporario,
      password: discipulo.senha_temporaria,
      email_confirm: true,
    })

    if (authError) throw new Error(`Erro ao criar usuário: ${authError.message}`)
    if (!authData.user) throw new Error("Erro ao criar usuário")

    const userId = authData.user.id
    console.log("[v0] ✅ Usuário auth criado com ID:", userId)

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
      status: "ativo", // ATIVO após aprovação
    })

    if (profileError) throw new Error(`Erro ao criar perfil: ${profileError.message}`)
    console.log("[v0] ✅ Perfil criado")

    const { error: updateError } = await supabaseAdmin
      .from("discipulos")
      .update({
        user_id: userId,
        status: "ativo",
        aprovado_discipulador: true,
        data_aprovacao_discipulador: new Date().toISOString(),
        // Limpar dados temporários (opcional, por segurança)
        email_temporario: null,
        senha_temporaria: null,
        nome_completo_temp: null,
        telefone_temp: null,
        igreja_temp: null,
        genero_temp: null,
        etnia_temp: null,
        data_nascimento_temp: null,
        foto_perfil_url_temp: null,
      })
      .eq("id", discipuloId)

    if (updateError) throw new Error(`Erro ao atualizar discípulo: ${updateError.message}`)
    console.log("[v0] ✅ Discípulo atualizado para ATIVO")

    const { error: progressoError } = await supabaseAdmin.from("progresso_fases").insert({
      discipulo_id: discipuloId,
      fase_numero: 1,
      passo_numero: 1,
      completado: false,
    })

    if (progressoError) console.error("[v0] Aviso: erro ao criar progresso:", progressoError)

    await supabaseAdmin.from("notificacoes").insert({
      user_id: userId,
      tipo: "aprovacao_aceita",
      titulo: "Cadastro Aprovado!",
      mensagem: "Seu discipulador aprovou seu cadastro. Bem-vindo à jornada de fé! Agora você pode fazer login.",
      link: "/dashboard",
      lida: false,
    })

    console.log("[v0] ✅ APROVAÇÃO COMPLETA!")
    console.log("[v0] - user_id criado:", userId)
    console.log("[v0] - Status: ATIVO")
    console.log("[v0] - Usuário pode fazer login agora")

    return { success: true, userId }
  } catch (error) {
    console.error("[v0] ❌ Erro ao aprovar discípulo:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao aprovar discípulo",
    }
  }
}

export async function rejeitarDiscipulo(discipuloId: string) {
  try {
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const { error: deleteError } = await supabaseAdmin.from("discipulos").delete().eq("id", discipuloId)

    if (deleteError) throw new Error(`Erro ao rejeitar: ${deleteError.message}`)

    console.log("[v0] ✅ Discípulo rejeitado e removido:", discipuloId)

    return { success: true }
  } catch (error) {
    console.error("[v0] ❌ Erro ao rejeitar discípulo:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao rejeitar discípulo",
    }
  }
}
