"use client"

import { Bell } from 'lucide-react'
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
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

type Notificacao = {
  id: string
  titulo: string
  mensagem: string
  link: string | null
  lida: boolean
  created_at: string
  tipo: string
}

export function NotificacoesDropdown({ userId }: { userId: string }) {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  const naoLidas = notificacoes.filter((n) => !n.lida).length

  useEffect(() => {
    carregarNotificacoes()

    // Atualizar notificações em tempo real
    const channel = supabase
      .channel("notificacoes-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notificacoes",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          carregarNotificacoes()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  async function carregarNotificacoes() {
    const { data, error } = await supabase
      .from("notificacoes")
      .select("*")
      .eq("user_id", userId)
      .eq("lida", false) // Apenas notificações não lidas
      .order("created_at", { ascending: false })
      .limit(10)

    if (!error && data) {
      setNotificacoes(data)
    }
    setLoading(false)
  }

  async function marcarComoLida(notificacao: Notificacao) {
    // Excluir a notificação do banco
    await supabase.from("notificacoes").delete().eq("id", notificacao.id)

    // Atualizar a lista localmente
    setNotificacoes((prev) => prev.filter((n) => n.id !== notificacao.id))

    if (notificacao.link) {
      router.push(notificacao.link)
    }
  }

  async function marcarTodasComoLidas() {
    await supabase.from("notificacoes").delete().eq("user_id", userId)

    carregarNotificacoes()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative gap-2">
          <Bell className="w-4 h-4" />
          {naoLidas > 0 && (
            <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
              {naoLidas > 9 ? "9+" : naoLidas}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-2">
          <DropdownMenuLabel>Notificações</DropdownMenuLabel>
          {naoLidas > 0 && (
            <Button variant="ghost" size="sm" onClick={marcarTodasComoLidas} className="text-xs h-auto py-1">
              Limpar todas
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        {loading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">Carregando...</div>
        ) : notificacoes.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">Nenhuma notificação</div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto">
            {notificacoes.map((notificacao) => (
              <DropdownMenuItem
                key={notificacao.id}
                className={`cursor-pointer flex-col items-start gap-1 p-3 ${!notificacao.lida ? "bg-primary/5" : ""}`}
                onClick={() => marcarComoLida(notificacao)}
              >
                <div className="flex items-start justify-between w-full gap-2">
                  <div className="font-medium text-sm">{notificacao.titulo}</div>
                  {!notificacao.lida && <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1" />}
                </div>
                <div className="text-xs text-muted-foreground">{notificacao.mensagem}</div>
                <div className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(notificacao.created_at), { addSuffix: true, locale: ptBR })}
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
