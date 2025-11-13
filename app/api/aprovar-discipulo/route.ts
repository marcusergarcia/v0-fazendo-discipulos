import { createClient } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    const { tempUserId, email } = await request.json()

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Buscar senha temporária
    const { data: discipuloData, error: fetchError } = await supabaseAdmin
      .from("discipulos")
      .select("senha_temporaria")
      .eq("user_id", tempUserId)
      .single()

    if (fetchError || !discipuloData?.senha_temporaria) {
      throw new Error("Senha temporária não encontrada")
    }

    // Criar usuário no auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: discipuloData.senha_temporaria,
      email_confirm: true,
    })

    if (authError) throw authError
    if (!authData.user) throw new Error("Erro ao criar usuário no auth")

    const authUserId = authData.user.id

    // Atualizar profile com novo ID
    const { data: profileData } = await supabaseAdmin.from("profiles").select("*").eq("id", tempUserId).single()

    if (profileData) {
      await supabaseAdmin.from("profiles").delete().eq("id", tempUserId)

      await supabaseAdmin.from("profiles").insert({
        ...profileData,
        id: authUserId,
        status: "ativo",
      })
    }

    // Atualizar discipulo
    await supabaseAdmin
      .from("discipulos")
      .update({
        user_id: authUserId,
        status: "ativo",
        aprovado_discipulador: true,
        data_aprovacao_discipulador: new Date().toISOString(),
        senha_temporaria: null,
      })
      .eq("user_id", tempUserId)

    console.log("[v0] Usuário aprovado e migrado para auth:", authUserId)

    return NextResponse.json({ success: true, authUserId })
  } catch (error) {
    console.error("[v0] Erro ao aprovar:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro desconhecido" }, { status: 500 })
  }
}
