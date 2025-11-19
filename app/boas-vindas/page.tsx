import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerClient as createClient } from '@supabase/ssr'
import BoasVindasClient from "./boas-vindas-client"

export default async function BoasVindasPage() {
  const cookieStore = await cookies()

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Buscar dados do discípulo
  const { data: discipulo } = await supabase
    .from("discipulos")
    .select("*, discipulador:profiles!discipulador_id(nome_completo, foto_perfil_url)")
    .eq("user_id", user.id)
    .single()

  if (!discipulo) {
    redirect("/dashboard")
  }

  // Buscar dados do profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  return (
    <BoasVindasClient 
      discipulo={discipulo} 
      profile={profile}
    />
  )
}
