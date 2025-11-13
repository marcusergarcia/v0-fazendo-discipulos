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

    const { data: existingDiscipulo } = await supabaseAdmin
      .from("discipulos")
      .select("*")
      .eq("email_temporario", dados.email)
      .maybeSingle()

    if (existingDiscipulo) {
      console.log("[v0] Já existe cadastro pendente para este email, deletando:", existingDiscipulo.id)
      await supabaseAdmin.from("discipulos").delete().eq("id", existingDiscipulo.id)
    }

    // O user_id será NULL até a aprovação
    const { data: novoDiscipulo, error: discipuloError } = await supabaseAdmin
      .from("discipulos")
      .insert({
        user_id: null, // NULL até aprovação
        email_temporario: dados.email, // Guardar email temporariamente
        senha_temporaria: dados.password, // Guardar senha temporariamente (será usada na aprovação)
        nome_completo_temp: dados.nomeCompleto,
        telefone_temp: dados.telefone,
        igreja_temp: dados.igreja,
        genero_temp: dados.genero,
        etnia_temp: dados.etnia,
        data_nascimento_temp: dados.dataNascimento,
        foto_perfil_url_temp: dados.fotoUrl,
        discipulador_id: dados.discipuladorId,
        nivel_atual: "Novo",
        xp_total: 0,
        fase_atual: 1,
        passo_atual: 1,
        status: "inativo", // INATIVO aguardando aprovação
        aprovado_discipulador: false,
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
      .select()
      .single()

    if (discipuloError) throw new Error(`Erro ao criar discípulo: ${discipuloError.message}`)
    console.log("[v0] ✅ Discípulo criado (SEM usuário auth ainda) - ID:", novoDiscipulo.id)

    await supabaseAdmin
      .from("convites")
      .update({
        usado: true,
        usado_por: novoDiscipulo.id, // Usar o ID do discipulo, não user_id
        data_uso: new Date().toISOString(),
      })
      .eq("codigo_convite", dados.codigoConvite)

    await supabaseAdmin.from("notificacoes").insert({
      user_id: dados.discipuladorId,
      tipo: "aprovacao_discipulo",
      titulo: "Novo Discípulo Aguardando Aprovação",
      mensagem: `${dados.nomeCompleto} completou o cadastro e aguarda sua aprovação para iniciar o discipulado.`,
      link: `/discipulador/aprovar/${novoDiscipulo.id}`,
      lida: false,
    })

    console.log("[v0] ✅ Cadastro concluído com sucesso!")
    console.log("[v0] - Email:", dados.email)
    console.log("[v0] - Status: INATIVO (aguardando aprovação)")
    console.log("[v0] - user_id: NULL (será criado após aprovação)")
    console.log("[v0] - Discipulador notificado:", dados.discipuladorId)

    return { success: true, discipuloId: novoDiscipulo.id }
  } catch (error) {
    console.error("[v0] ❌ Erro no cadastro:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido ao criar conta",
    }
  }
}
