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
import { useEffect, useState } from "react"
import { useSupabase } from "@/components/supabase-provider"
import { useRouter } from "next/navigation"
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

export function NotificacoesDropdown({ discipuloId }: { discipuloId: string }) {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = useSupabase()

  const naoLidas = notificacoes.filter((n) => !n.lida).length

  useEffect(() => {
    carregarNotificacoes()

    const channel = supabase
      .channel("notificacoes-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notificacoes",
          filter: `discipulo_id=eq.${discipuloId}`,
        },
        () => {
          carregarNotificacoes()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [discipuloId])

  async function carregarNotificacoes() {
    const { data, error } = await supabase
      .from("notificacoes")
      .select("*")
      .eq("discipulo_id", discipuloId)
      .eq("lida", false)
      .order("created_at", { ascending: false })
      .limit(10)

    if (!error && data) {
      setNotificacoes(data)
    }
    setLoading(false)
  }

  async function marcarComoLida(notificacao: Notificacao) {
    await supabase.from("notificacoes").delete().eq("id", notificacao.id)

    setNotificacoes((prev) => prev.filter((n) => n.id !== notificacao.id))

    if (notificacao.link) {
      router.push(notificacao.link)
    }
  }

  async function marcarTodasComoLidas() {
    console.log("[v0] Iniciando limpeza de todas as notificações para discipuloId:", discipuloId)

    const { data: notificacoesDoUsuario, error: notifError } = await supabase
      .from("notificacoes")
      .select("id")
      .eq("discipulo_id", discipuloId)

    if (notifError) {
      console.error("[v0] Erro ao buscar notificações:", notifError)
      return
    }

    if (!notificacoesDoUsuario || notificacoesDoUsuario.length === 0) {
      console.log("[v0] Nenhuma notificação encontrada para deletar")
      setNotificacoes([])
      return
    }

    const notificacaoIds = notificacoesDoUsuario.map((n) => n.id)
    console.log("[v0] Total de notificações a deletar:", notificacaoIds.length)
    console.log("[v0] IDs das notificações:", notificacaoIds)

    const { error: perguntasError } = await supabase
      .from("perguntas_reflexivas")
      .update({ notificacao_id: null })
      .in("notificacao_id", notificacaoIds)

    if (perguntasError) {
      console.error("[v0] Erro ao limpar referências de perguntas_reflexivas:", perguntasError)
    } else {
      console.log("[v0] Referências de perguntas_reflexivas limpas com sucesso")
    }

    const { error: deleteError, count } = await supabase
      .from("notificacoes")
      .delete()
      .eq("discipulo_id", discipuloId)
      .select()

    if (deleteError) {
      console.error("[v0] Erro ao deletar notificações:", deleteError)
    } else {
      console.log("[v0] Notificações deletadas com sucesso. Count:", count)
    }

    setNotificacoes([])

    carregarNotificacoes()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative gap-2">
          <Bell className="w-4 h-4" />
          {naoLidas > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
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
