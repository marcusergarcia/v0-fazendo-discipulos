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

    const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers()
    const userExists = existingUser?.users.find((u) => u.email === dados.email)

    let userId: string

    if (userExists) {
      console.log("[v0] Usuário já existe, deletando para recriar:", userExists.id)

      // Deletar de discipulos primeiro
      await supabaseAdmin.from("discipulos").delete().eq("user_id", userExists.id)

      // Deletar de profiles
      await supabaseAdmin.from("profiles").delete().eq("id", userExists.id)

      // Deletar do auth
      await supabaseAdmin.auth.admin.deleteUser(userExists.id)
    }

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: dados.email,
      password: dados.password,
      email_confirm: true,
    })

    if (authError) throw authError
    if (!authData.user) throw new Error("Erro ao criar usuário")

    userId = authData.user.id

    // Inserir no profiles
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
    })

    if (profileError) throw new Error(`Erro ao criar perfil: ${profileError.message}`)

    const { error: discipuloError } = await supabaseAdmin.from("discipulos").insert({
      user_id: userId,
      discipulador_id: dados.discipuladorId,
      nivel_atual: "Novo",
      xp_total: 0,
      fase_atual: 1,
      passo_atual: 1,
      aprovado_discipulador: false,
      data_aprovacao_discipulador: null,
    })

    console.log("[v0] Inserindo discípulo:", {
      userId,
      discipuladorId: dados.discipuladorId,
      aprovado: false,
      error: discipuloError,
    })

    if (discipuloError) throw new Error(`Erro ao criar discípulo: ${discipuloError.message}`)

    // Marcar convite como usado
    await supabaseAdmin
      .from("convites")
      .update({
        usado: true,
        usado_por: userId,
        data_uso: new Date().toISOString(),
      })
      .eq("codigo_convite", dados.codigoConvite)

    // Criar notificação para o discipulador
    await supabaseAdmin.from("notificacoes").insert({
      user_id: dados.discipuladorId,
      tipo: "aprovacao_discipulo",
      titulo: "Novo Discípulo Aguardando Aprovação",
      mensagem: `${dados.nomeCompleto} completou o cadastro e aguarda sua aprovação para iniciar o discipulado.`,
      link: `/discipulador/aprovar/${userId}`,
    })

    console.log("[v0] Cadastro concluído com sucesso para:", dados.email)
    return { success: true, userId }
  } catch (error) {
    console.error("[v0] Erro no cadastro:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido ao criar conta",
    }
  }
}
