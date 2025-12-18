import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Se as variáveis não existem, apenas continue sem autenticação
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("[v0] Supabase environment variables not found in proxy. Skipping authentication check.")
    return supabaseResponse
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
      },
    },
  })

  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch (error) {
    // Token inválido ou expirado - limpar cookies e redirecionar para login
    console.log("[v0] Auth error in proxy, clearing session:", error instanceof Error ? error.message : "Unknown error")

    // Limpar todos os cookies do Supabase
    const response = NextResponse.redirect(new URL("/auth/login", request.url))
    response.cookies.delete("sb-access-token")
    response.cookies.delete("sb-refresh-token")

    // Tentar limpar cookies com prefixo do projeto
    request.cookies.getAll().forEach((cookie) => {
      if (cookie.name.includes("supabase") || cookie.name.includes("sb-")) {
        response.cookies.delete(cookie.name)
      }
    })

    return response
  }

  // Se não está autenticado e não é rota pública, redireciona para login
  if (
    !user &&
    !request.nextUrl.pathname.startsWith("/convite/") &&
    !request.nextUrl.pathname.startsWith("/auth/") &&
    !request.nextUrl.pathname.startsWith("/aguardando-aprovacao") &&
    request.nextUrl.pathname !== "/" &&
    (request.nextUrl.pathname.startsWith("/dashboard") || request.nextUrl.pathname.startsWith("/discipulador"))
  ) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    url.searchParams.set("redirectedFrom", request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // Rotas públicas - não precisa verificar autenticação
  if (
    request.nextUrl.pathname.startsWith("/convite/") ||
    request.nextUrl.pathname.startsWith("/auth/") ||
    request.nextUrl.pathname.startsWith("/aguardando-aprovacao") ||
    request.nextUrl.pathname === "/"
  ) {
    return supabaseResponse
  }

  // Usuário autenticado tentando acessar login/signup - redireciona para dashboard
  if (
    user &&
    (request.nextUrl.pathname.startsWith("/auth/login") || request.nextUrl.pathname.startsWith("/auth/sign-up"))
  ) {
    const url = request.nextUrl.clone()
    url.pathname = "/dashboard"
    return NextResponse.redirect(url)
  }

  // Verifica status do usuário em rotas protegidas
  if (
    user &&
    (request.nextUrl.pathname.startsWith("/dashboard") || request.nextUrl.pathname.startsWith("/discipulador"))
  ) {
    const { data: profile } = await supabase.from("profiles").select("status").eq("id", user.id).single()

    const { data: discipulo } = await supabase
      .from("discipulos")
      .select("status, aprovado_discipulador, discipulador_id")
      .eq("user_id", user.id)
      .single()

    if (discipulo?.discipulador_id !== null && (profile?.status === "inativo" || discipulo?.status === "inativo")) {
      const url = request.nextUrl.clone()
      url.pathname = "/aguardando-aprovacao"
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
