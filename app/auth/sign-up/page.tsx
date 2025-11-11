"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useMemo } from "react"
import { Shield } from "lucide-react"

export default function Page() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [nomeCompleto, setNomeCompleto] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const supabase = useMemo(() => createClient(), [])

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError("As senhas não coincidem")
      setIsLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nome_completo: nomeCompleto,
          },
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error

      if (data.user && data.session) {
        router.push("/dashboard")
      } else {
        router.push("/auth/sign-up-success")
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Erro ao criar conta")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-blue-950 p-6">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <Shield className="h-12 w-12 text-yellow-400" />
            <h1 className="text-3xl font-bold text-white">Fazendo Discípulos</h1>
            <p className="text-sm text-blue-200">Comece sua jornada de fé</p>
          </div>

          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Cadastro</CardTitle>
              <CardDescription className="text-blue-200">Crie sua conta para iniciar</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignUp}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="nome" className="text-white">
                      Nome Completo
                    </Label>
                    <Input
                      id="nome"
                      type="text"
                      placeholder="Seu nome"
                      required
                      value={nomeCompleto}
                      onChange={(e) => setNomeCompleto(e.target.value)}
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="text-white">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password" className="text-white">
                      Senha
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="repeat-password" className="text-white">
                      Confirmar Senha
                    </Label>
                    <Input
                      id="repeat-password"
                      type="password"
                      required
                      value={repeatPassword}
                      onChange={(e) => setRepeatPassword(e.target.value)}
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                    />
                  </div>
                  {error && <p className="text-sm text-red-300 bg-red-500/20 p-2 rounded">{error}</p>}
                  <Button
                    type="submit"
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-blue-950"
                    disabled={isLoading}
                  >
                    {isLoading ? "Criando conta..." : "Cadastrar"}
                  </Button>
                </div>
                <div className="mt-4 text-center text-sm text-blue-200">
                  Já tem uma conta?{" "}
                  <Link
                    href="/auth/login"
                    className="text-yellow-400 hover:text-yellow-300 underline underline-offset-4"
                  >
                    Entrar
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
