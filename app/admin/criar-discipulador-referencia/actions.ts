"use server"

import { createClient } from "@supabase/supabase-js"

export async function criarDiscipuladorReferencia() {
  try {
    // Criar cliente admin com service role
    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const email12Apostolos = "12apostolos@ministerio.com"
    const senha12Apostolos = "Apostolos@2025!Ref"

    // Verificar se já existe
    const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers()
    const userExists = existingUser?.users.find((u) => u.email === email12Apostolos)

    let userId12Apostolos: string

    if (!userExists) {
      // Criar usuário no Auth
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: email12Apostolos,
        password: senha12Apostolos,
        email_confirm: true,
        user_metadata: {
          nome_completo: "12 Apóstolos",
        },
      })

      if (authError || !authData.user) {
        throw new Error(`Erro ao criar usuário no Auth: ${authError?.message}`)
      }

      userId12Apostolos = authData.user.id
    } else {
      userId12Apostolos = userExists.id
    }

    // Criar perfil
    const { error: profileError } = await supabaseAdmin.from("profiles").upsert({
      id: userId12Apostolos,
      nome_completo: "12 Apóstolos",
      email: email12Apostolos,
      status: "ativo",
      bio: "Base apostólica do ministério - Representação simbólica dos 12 apóstolos de Jesus Cristo",
    })

    if (profileError) {
      throw new Error(`Erro ao criar perfil: ${profileError.message}`)
    }

    // Criar registro de discípulo com nível máximo
    const { error: discipuloError } = await supabaseAdmin.from("discipulos").upsert({
      user_id: userId12Apostolos,
      discipulador_id: null, // Não tem discipulador acima
      nivel_atual: "Multiplicador",
      xp_total: 10000,
      fase_atual: 3,
      passo_atual: 10,
      status: "ativo",
    })

    if (discipuloError) {
      throw new Error(`Erro ao criar discípulo: ${discipuloError.message}`)
    }

    // Buscar Marcus e associar aos 12 Apóstolos
    const { data: marcusUser } = await supabaseAdmin.auth.admin.listUsers()
    const marcus = marcusUser?.users.find((u) => u.email === "marcus.macintel@terra.com.br")

    if (marcus) {
      const { error: updateError } = await supabaseAdmin
        .from("discipulos")
        .update({
          discipulador_id: userId12Apostolos,
          status: "ativo",
        })
        .eq("user_id", marcus.id)

      if (updateError) {
        throw new Error(`Erro ao associar Marcus: ${updateError.message}`)
      }
    }

    return {
      success: true,
      message: 'Discipulador "12 Apóstolos" criado com sucesso!',
    }
  } catch (error: any) {
    console.error("[v0] Erro ao criar discipulador referência:", error)
    return {
      success: false,
      message: error.message || "Erro desconhecido ao criar discipulador",
    }
  }
}
