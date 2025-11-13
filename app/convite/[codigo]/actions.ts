"use server"

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function cadastrarDiscipuloPorConvite(dados: {
  email: string
  password: string
  nomeCompleto: string
  telefone?: string
  igreja?: string
  genero: string
  etnia: string
  dataNascimento: string
  fotoUrl?: string | null
  discipuladorId: string
  codigoConvite: string
  aceitouLGPD: boolean
  aceitouCompromisso: boolean
  localizacao?: string
  latitude?: number | null
  longitude?: number | null
  dataCadastro: string
  horaCadastro: string
  semanaCadastro: string
}) {
  try {
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("id, email")
      .eq("email", dados.email)
      .single()

    if (existingProfile) {
      console.log("[v0] Perfil existente encontrado, deletando:", existingProfile.id)

      // Deletar todos os registros relacionados
      await supabaseAdmin.from("notificacoes").delete().eq("user_id", existingProfile.id)
      await supabaseAdmin.from("progresso_fases").delete().eq("discipulo_id", existingProfile.id)
      await supabaseAdmin.from("recompensas").delete().eq("discipulo_id", existingProfile.id)
      await supabaseAdmin.from("reflexoes_conteudo").delete().eq("discipulo_id", existingProfile.id)
      await supabaseAdmin.from("mensagens").delete().eq("discipulo_id", existingProfile.id)
      await supabaseAdmin.from("mensagens").delete().eq("remetente_id", existingProfile.id)
      await supabaseAdmin.from("discipulos").delete().eq("user_id", existingProfile.id)
      await supabaseAdmin.from("profiles").delete().eq("id", existingProfile.id)

      // Deletar do auth.users
      await supabaseAdmin.auth.admin.deleteUser(existingProfile.id)
      console.log("[v0] Usuário anterior deletado completamente")
    }

    console.log("[v0] Criando usuário no auth.users com status INATIVO...")
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: dados.email,
      password: dados.password,
      email_confirm: false, // Email não confirmado = não pode fazer login ainda
      user_metadata: {
        nome_completo: dados.nomeCompleto,
        aguardando_aprovacao: true,
      },
    })

    if (authError || !authData.user) {
      throw new Error(`Erro ao criar usuário: ${authError?.message}`)
    }

    const userId = authData.user.id
    console.log("[v0] Usuário criado no auth.users:", userId)

    const { error: profileError } = await supabaseAdmin.from("profiles").insert({
      id: userId,
      email: dados.email,
      nome_completo: dados.nomeCompleto,
      telefone: dados.telefone,
      igreja: dados.igreja,
      genero: dados.genero,
      etnia: dados.etnia,
      data_nascimento: dados.dataNascimento,
      foto_perfil_url: dados.fotoUrl,
      aceitou_lgpd: dados.aceitouLGPD,
      aceitou_compromisso: dados.aceitouCompromisso,
      data_aceite_termos: new Date().toISOString(),
      localizacao_cadastro: dados.localizacao,
      latitude_cadastro: dados.latitude,
      longitude_cadastro: dados.longitude,
      data_cadastro: dados.dataCadastro,
      hora_cadastro: dados.horaCadastro,
      semana_cadastro: dados.semanaCadastro,
      status: "inativo", // Status INATIVO até aprovação
    })

    if (profileError) throw new Error(`Erro ao criar perfil: ${profileError.message}`)
    console.log("[v0] Perfil criado com status INATIVO")

    const { error: discipuloError } = await supabaseAdmin.from("discipulos").insert({
      user_id: userId,
      discipulador_id: dados.discipuladorId,
      nivel_atual: "Novo",
      xp_total: 0,
      fase_atual: 1,
      passo_atual: 1,
      aprovado_discipulador: false,
      status: "inativo", // Status INATIVO até aprovação
    })

    if (discipuloError) throw new Error(`Erro ao criar discípulo: ${discipuloError.message}`)
    console.log("[v0] Discípulo criado com status INATIVO")

    // Atualizar convite
    await supabaseAdmin
      .from("convites")
      .update({
        usado: true,
        usado_por: userId,
        data_uso: new Date().toISOString(),
      })
      .eq("codigo_convite", dados.codigoConvite)

    const { error: notifError } = await supabaseAdmin.from("notificacoes").insert({
      user_id: dados.discipuladorId,
      tipo: "aprovacao_discipulo",
      titulo: "Novo Discípulo Aguardando Aprovação",
      mensagem: `${dados.nomeCompleto} completou o cadastro e aguarda sua aprovação para iniciar o discipulado.`,
      link: `/discipulador/aprovar/${userId}`,
      lida: false,
    })

    if (notifError) {
      console.error("[v0] ERRO ao criar notificação:", notifError)
    } else {
      console.log("[v0] ✅ Notificação enviada ao discipulador:", dados.discipuladorId)
    }

    console.log("[v0] ✅ Cadastro concluído - Usuário INATIVO aguardando aprovação")
    return { success: true, userId }
  } catch (error) {
    console.error("[v0] ❌ Erro no cadastro:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido ao criar conta",
    }
  }
}
