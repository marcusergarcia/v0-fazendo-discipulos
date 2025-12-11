"use client"

import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { limparTodasNotificacoes } from "@/app/discipulador/actions"
import { useState } from "react"

interface Notificacao {
  tipo: string
  discipulo_nome?: string
  passo?: number
}

interface SinoNotificacoesDiscipuladorProps {
  totalNotificacoes: number
  notificacoes: Notificacao[]
}

export function SinoNotificacoesDiscipulador({ totalNotificacoes, notificacoes }: SinoNotificacoesDiscipuladorProps) {
  const router = useRouter()
  const [isClearing, setIsClearing] = useState(false)

  const handleLimparTodas = async () => {
    if (isClearing) return

    setIsClearing(true)
    try {
      await limparTodasNotificacoes()
      router.refresh()
    } catch (error) {
      console.error("[v0] Erro ao limpar notificações:", error)
    } finally {
      setIsClearing(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`relative ${totalNotificacoes > 0 ? "text-yellow-500" : "text-muted-foreground"}`}
        >
          <Bell className="h-5 w-5" />
          {totalNotificacoes > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {totalNotificacoes}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notificações</span>
          {totalNotificacoes > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLimparTodas}
              disabled={isClearing}
              className="h-auto py-1 px-2 text-xs"
            >
              {isClearing ? "Limpando..." : "Limpar todas"}
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {totalNotificacoes === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">Nenhuma notificação pendente</div>
        ) : (
          <>
            {notificacoes.map((notif, index) => {
              let mensagem = ""

              if (notif.tipo === "reflexao_enviada") {
                mensagem = `${notif.discipulo_nome} enviou reflexão do Passo ${notif.passo}`
              } else if (notif.tipo === "pergunta_enviada") {
                mensagem = `${notif.discipulo_nome} enviou pergunta reflexiva do Passo ${notif.passo}`
              } else if (notif.tipo === "novo_discipulo") {
                mensagem = `${notif.discipulo_nome} está aguardando aprovação`
              }

              return (
                <DropdownMenuItem
                  key={index}
                  className="cursor-pointer"
                  onClick={() => {
                    if (notif.tipo === "novo_discipulo") {
                      router.push("/discipulador/aprovar")
                    } else {
                      router.push("/discipulador")
                    }
                  }}
                >
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium">{mensagem}</p>
                    <p className="text-xs text-muted-foreground">Clique para revisar</p>
                  </div>
                </DropdownMenuItem>
              )
            })}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
