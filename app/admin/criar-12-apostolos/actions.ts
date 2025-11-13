"use server"

import { createClient } from "@/lib/supabase/server"

export async function criar12Apostolos() {
  try {
    const supabase = await createClient()

    // Criar usuário "12 Apóstolos" no Auth usando Admin API
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: "12apostolos@ministerio.com",
      password: crypto.randomUUID(), // Senha aleatória (não será usada)
      email_confirm: true,
      user_metadata: {
        nome_completo: "12 Apóstolos",
      },
    })

    if (authError) {
      // Se o usuário já existir, buscar o ID existente
      if (authError.message.includes("already registered")) {
        const { data: existingUser } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", "12apostolos@ministerio.com")
          .single()

        if (existingUser) {
          return { success: true, message: "12 Apóstolos já existe", userId: existingUser.id }
        }
      }
      throw authError
    }

    const userId = authData.user.id

    // Criar perfil
    const { error: profileError } = await supabase.from("profiles").upsert({
      id: userId,
      nome_completo: "12 Apóstolos",
      email: "12apostolos@ministerio.com",
      status: "ativo",
      bio: "Base apostólica do ministério - Representação simbólica dos 12 apóstolos de Jesus Cristo",
    })

    if (profileError) throw profileError

    // Criar registro de discípulo com nível máximo
    const { error: discipuloError } = await supabase.from("discipulos").upsert({
      user_id: userId,
      discipulador_id: null, // Não tem discipulador acima
      nivel_atual: "Multiplicador",
      xp_total: 10000,
      fase_atual: 3,
      passo_atual: 10,
      status: "ativo",
    })

    if (discipuloError) throw discipuloError

    // Buscar o user_id do Marcus
    const { data: marcusData } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", "marcus.macintel@terra.com.br")
      .single()

    if (marcusData) {
      // Associar Marcus aos 12 Apóstolos
      const { error: updateError } = await supabase
        .from("discipulos")
        .update({
          discipulador_id: userId,
          status: "ativo",
        })
        .eq("user_id", marcusData.id)

      if (updateError) throw updateError
    }

    return {
      success: true,
      message: "12 Apóstolos criado com sucesso e Marcus foi associado como discípulo",
      userId,
    }
  } catch (error: any) {
    console.error("[v0] Erro ao criar 12 Apóstolos:", error)
    return { success: false, error: error.message }
  }
}
