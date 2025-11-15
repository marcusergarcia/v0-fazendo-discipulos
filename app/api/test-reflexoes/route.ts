import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  // 1. Buscar discípulos do Marcus
  const { data: discipulos, error: errorDiscipulos } = await supabase
    .from("discipulos")
    .select("*")
    .eq("discipulador_id", user.id)

  const discipulosAprovados = discipulos?.filter(d => d.aprovado_discipulador) || []

  // 2. Buscar reflexões desses discípulos
  const idsParaBuscar = discipulosAprovados.map(d => d.id)
  
  const { data: reflexoes, error: errorReflexoes } = await supabase
    .from("reflexoes_conteudo")
    .select("*")
    .in("discipulo_id", idsParaBuscar)

  return NextResponse.json({
    user_id: user.id,
    total_discipulos: discipulos?.length || 0,
    discipulos_aprovados: discipulosAprovados.length,
    ids_buscar: idsParaBuscar,
    total_reflexoes: reflexoes?.length || 0,
    reflexoes,
    errors: {
      errorDiscipulos,
      errorReflexoes
    }
  })
}
