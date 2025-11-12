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

    // Criar usuário no auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: dados.email,
      password: dados.password,
      email_confirm: true,
    })

    if (authError) throw authError
    if (!authData.user) throw new Error("Erro ao criar usuário")

    // Inserir no profiles
    const { error: profileError } = await supabaseAdmin.from("profiles").insert({
      id: authData.user.id,
      email: dados.email,
      nome_completo: dados.nomeCompleto,
      telefone: dados.telefone,
      igreja: dados.igreja,
      genero: dados.genero,
      etnia: dados.etnia,
      data_nascimento: dados.dataNascimento,
      foto_perfil_url: dados.fotoUrl,
    })

    if (profileError) throw new Error(`Erro ao criar perfil: ${profileError.message}`)

    const { error: discipuloError } = await supabaseAdmin.from("discipulos").insert({
      user_id: authData.user.id,
      discipulador_id: dados.discipuladorId,
      nivel_atual: "Novo",
      xp_total: 0,
      fase_atual: 1,
      passo_atual: 1,
    })

    if (discipuloError) throw new Error(`Erro ao criar discípulo: ${discipuloError.message}`)

    const { error: updateProfileError } = await supabaseAdmin
      .from("profiles")
      .update({
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
      .eq("id", authData.user.id)

    if (updateProfileError) console.error("[v0] Erro ao atualizar profile:", updateProfileError)

    // Marcar convite como usado
    await supabaseAdmin
      .from("convites")
      .update({
        usado: true,
        usado_por: authData.user.id,
        data_uso: new Date().toISOString(),
      })
      .eq("codigo_convite", dados.codigoConvite)

    // Criar notificação para o discipulador
    await supabaseAdmin.from("notificacoes").insert({
      user_id: dados.discipuladorId,
      tipo: "aprovacao_discipulo",
      titulo: "Novo Discípulo Aguardando Aprovação",
      mensagem: `${dados.nomeCompleto} completou o cadastro e aguarda sua aprovação para iniciar o discipulado.`,
      link: `/discipulador/aprovar/${authData.user.id}`,
    })

    return { success: true, userId: authData.user.id }
  } catch (error) {
    console.error("[v0] Erro no cadastro:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido ao criar conta",
    }
  }
}
