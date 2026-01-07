"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function MinhaJornadaClient({ passoAtual }: { passoAtual: number }) {
  const router = useRouter()

  useEffect(() => {
    router.replace(`/dashboard/passo/${passoAtual}`)
  }, [passoAtual, router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Carregando sua jornada...</p>
      </div>
    </div>
  )
}
