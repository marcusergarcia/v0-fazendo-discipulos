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

    const { data: discipuloExistente } = await supabaseAdmin
      .from("discipulos")
      .select("*")
      .eq("email_temporario", dados.email)
      .maybeSingle()

    if (discipuloExistente) {
      // Deletar cadastro temporário anterior
      await supabaseAdmin.from("discipulos").delete().eq("id", discipuloExistente.id)
    }

    const { data: discipuloData, error: discipuloError } = await supabaseAdmin
      .from("discipulos")
      .insert({
        discipulador_id: dados.discipuladorId,
        nivel_atual: "Explorador",
        xp_total: 0,
        fase_atual: 1,
        passo_atual: 1,
        aprovado_discipulador: false,
        status: "inativo",
        email_temporario: dados.email,
        senha_temporaria: dados.password, // Será usado na aprovação
        nome_completo_temp: dados.nomeCompleto,
        telefone_temp: dados.telefone,
        igreja_temp: dados.igreja,
        genero_temp: dados.genero,
        etnia_temp: dados.etnia,
        data_nascimento_temp: dados.dataNascimento,
        foto_perfil_url_temp: dados.fotoUrl,
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

    await supabaseAdmin
      .from("convites")
      .update({
        usado: true,
        usado_por: discipuloData.id, // Usar o ID do registro discipulos
        data_uso: new Date().toISOString(),
      })
      .eq("codigo_convite", dados.codigoConvite)

    console.log("[v0] Tentando criar notificação para discipulador:", dados.discipuladorId)
    const { data: notificacaoData, error: notificacaoError } = await supabaseAdmin
      .from("notificacoes")
      .insert({
        user_id: dados.discipuladorId,
        tipo: "novo_discipulo",
        titulo: "Novo Discípulo Aguardando Aprovação",
        mensagem: `${dados.nomeCompleto} completou o cadastro e aguarda sua aprovação para iniciar o discipulado.`,
        link: `/discipulador/aprovar/${discipuloData.id}`,
        lida: false,
      })
      .select()

    if (notificacaoError) {
      console.error("[v0] ERRO ao criar notificação:", notificacaoError)
    } else {
      console.log("[v0] Notificação criada com sucesso:", notificacaoData)
    }

    console.log("[v0] Cadastro temporário concluído - aguardando aprovação:", dados.email)
    return { success: true, discipuloId: discipuloData.id }
  } catch (error) {
    console.error("[v0] Erro no cadastro:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido ao criar conta",
    }
  }
}
