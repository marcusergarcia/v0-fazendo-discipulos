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
      .select("id, email, status")
      .eq("email", dados.email)
      .single()

    if (existingProfile) {
      console.log("[v0] Perfil existente encontrado:", existingProfile)

      // Se já tem usuário no auth, deletar tudo
      const { data: authUser } = await supabaseAdmin.auth.admin.listUsers()
      const userExists = authUser?.users.find((u) => u.email === dados.email)

      if (userExists) {
        console.log("[v0] Deletando usuário completo para recriar:", userExists.id)
        await supabaseAdmin.from("notificacoes").delete().eq("user_id", userExists.id)
        await supabaseAdmin.from("progresso_fases").delete().eq("discipulo_id", userExists.id)
        await supabaseAdmin.from("recompensas").delete().eq("discipulo_id", userExists.id)
        await supabaseAdmin.from("reflexoes_conteudo").delete().eq("discipulo_id", userExists.id)
        await supabaseAdmin.from("mensagens").delete().eq("discipulo_id", userExists.id)
        await supabaseAdmin.from("mensagens").delete().eq("remetente_id", userExists.id)
        await supabaseAdmin.from("discipulos").delete().eq("user_id", userExists.id)
        await supabaseAdmin.from("profiles").delete().eq("id", userExists.id)
        await supabaseAdmin.auth.admin.deleteUser(userExists.id)
      } else {
        // Apenas deletar de profiles e discipulos se não tem usuário no auth
        await supabaseAdmin.from("discipulos").delete().eq("user_id", existingProfile.id)
        await supabaseAdmin.from("profiles").delete().eq("id", existingProfile.id)
      }

      console.log("[v0] Registros anteriores removidos")
    }

    const tempUserId = `temp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

    console.log("[v0] Criando perfil INATIVO (sem usuário auth ainda):", tempUserId)

    const { error: profileError } = await supabaseAdmin.from("profiles").insert({
      id: tempUserId,
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
      status: "inativo",
    })

    if (profileError) throw new Error(`Erro ao criar perfil: ${profileError.message}`)
    console.log("[v0] Profile criado com status INATIVO (sem auth)")

    const { error: discipuloError } = await supabaseAdmin.from("discipulos").insert({
      user_id: tempUserId,
      discipulador_id: dados.discipuladorId,
      nivel_atual: "Novo",
      xp_total: 0,
      fase_atual: 1,
      passo_atual: 1,
      aprovado_discipulador: false,
      data_aprovacao_discipulador: null,
      status: "inativo",
      senha_temporaria: dados.password, // Guardar senha para criar auth depois
    })

    if (discipuloError) throw new Error(`Erro ao criar discípulo: ${discipuloError.message}`)
    console.log("[v0] Discípulo criado com status INATIVO (aguardando aprovação)")

    // Atualizar convite
    await supabaseAdmin
      .from("convites")
      .update({
        usado: true,
        usado_por: tempUserId,
        data_uso: new Date().toISOString(),
      })
      .eq("codigo_convite", dados.codigoConvite)

    const { error: notifError } = await supabaseAdmin.from("notificacoes").insert({
      user_id: dados.discipuladorId,
      tipo: "aprovacao_discipulo",
      titulo: "Novo Discípulo Aguardando Aprovação",
      mensagem: `${dados.nomeCompleto} completou o cadastro e aguarda sua aprovação para iniciar o discipulado.`,
      link: `/discipulador/aprovar/${tempUserId}`,
      lida: false,
    })

    if (notifError) {
      console.error("[v0] ERRO ao criar notificação:", notifError)
    } else {
      console.log("[v0] Notificação enviada ao discipulador:", dados.discipuladorId)
    }

    console.log("[v0] ✅ Cadastro concluído - INATIVO aguardando aprovação (SEM usuário auth)")
    return { success: true, userId: tempUserId }
  } catch (error) {
    console.error("[v0] ❌ Erro no cadastro:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido ao criar conta",
    }
  }
}
