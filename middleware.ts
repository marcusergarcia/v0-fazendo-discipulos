import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
    },
  )

  if (
    request.nextUrl.pathname.startsWith("/convite/") ||
    request.nextUrl.pathname.startsWith("/auth/") ||
    request.nextUrl.pathname.startsWith("/aguardando-aprovacao") ||
    request.nextUrl.pathname === "/"
  ) {
    return supabaseResponse
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (
    user &&
    (request.nextUrl.pathname.startsWith("/auth/login") || request.nextUrl.pathname.startsWith("/auth/sign-up"))
  ) {
    const url = request.nextUrl.clone()
    url.pathname = "/dashboard"
    return NextResponse.redirect(url)
  }

  if (
    user &&
    (request.nextUrl.pathname.startsWith("/dashboard") || request.nextUrl.pathname.startsWith("/discipulador"))
  ) {
    const { data: discipulo, error: discipuloError } = await supabase
      .from("discipulos")
      .select("aprovado_discipulador, discipulador_id, user_id")
      .eq("user_id", user.id)
      .single()

    console.log("[v0] Middleware - Verificando aprovação:", {
      discipulo,
      error: discipuloError,
      userId: user.id,
      path: request.nextUrl.pathname,
    })

    if (discipulo && discipulo.discipulador_id !== null && discipulo.aprovado_discipulador === false) {
      const url = request.nextUrl.clone()
      url.pathname = "/aguardando-aprovacao"
      console.log("[v0] Bloqueando acesso - usuário não aprovado, discipulador_id:", discipulo.discipulador_id)
      return NextResponse.redirect(url)
    }

    if (!discipulo && !discipuloError) {
      console.log("[v0] Usuário sem registro em discipulos - permitindo acesso")
    }
  }

  if (
    !user &&
    (request.nextUrl.pathname.startsWith("/dashboard") || request.nextUrl.pathname.startsWith("/discipulador"))
  ) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
