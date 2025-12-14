"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Send, ArrowLeft, Check, CheckCheck } from "lucide-react"
import { useRouter } from "next/navigation"
import type { RealtimeChannel } from "@supabase/supabase-js"
import { useSupabase } from "@/components/supabase-provider"

interface Mensagem {
  id: string
  discipulo_id: string
  remetente_id: string
  mensagem: string
  created_at: string
  lida: boolean
  data_leitura: string | null
}

export default function ChatClient({
  userId,
  discipuloIdConversa,
  outroUserId,
  outroUsuarioNome,
  mensagensIniciais,
}: {
  userId: string
  discipuloIdConversa: string
  outroUserId: string
  outroUsuarioNome: string
  mensagensIniciais: Mensagem[]
}) {
  const [mensagens, setMensagens] = useState<Mensagem[]>(mensagensIniciais)
  const [novaMensagem, setNovaMensagem] = useState("")
  const [enviando, setEnviando] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = useSupabase()
  const router = useRouter()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [mensagens])

  useEffect(() => {
    const channel: RealtimeChannel = supabase
      .channel(`chat:${discipuloIdConversa}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "mensagens",
          filter: `discipulo_id=eq.${discipuloIdConversa}`,
        },
        (payload) => {
          const novaMensagem = payload.new as Mensagem
          setMensagens((prev) => [...prev, novaMensagem])

          // Se a mensagem foi enviada pelo outro usuário, marca como lida
          if (novaMensagem.remetente_id === outroUserId) {
            supabase
              .from("mensagens")
              .update({ lida: true, data_leitura: new Date().toISOString() })
              .eq("id", novaMensagem.id)
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "mensagens",
          filter: `discipulo_id=eq.${discipuloIdConversa}`,
        },
        (payload) => {
          const mensagemAtualizada = payload.new as Mensagem
          setMensagens((prev) => prev.map((m) => (m.id === mensagemAtualizada.id ? mensagemAtualizada : m)))
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [discipuloIdConversa, outroUserId, supabase])

  const enviarMensagem = async () => {
    if (!novaMensagem.trim() || enviando) return

    setEnviando(true)
    try {
      const { error } = await supabase.from("mensagens").insert({
        discipulo_id: discipuloIdConversa,
        remetente_id: userId,
        mensagem: novaMensagem.trim(),
        lida: false,
      })

      if (error) throw error

      setNovaMensagem("")
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error)
      alert("Erro ao enviar mensagem. Tente novamente.")
    } finally {
      setEnviando(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      enviarMensagem()
    }
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="border-b bg-background p-4 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="font-semibold">{outroUsuarioNome}</h2>
          <p className="text-sm text-muted-foreground">Online</p>
        </div>
      </div>

      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {mensagens.map((msg) => {
          const ehMinhaMensagem = msg.remetente_id === userId

          return (
            <div key={msg.id} className={`flex ${ehMinhaMensagem ? "justify-end" : "justify-start"}`}>
              <Card
                className={`max-w-[70%] p-3 ${ehMinhaMensagem ? "bg-primary text-primary-foreground" : "bg-muted"}`}
              >
                <p className="whitespace-pre-wrap break-words">{msg.mensagem}</p>
                <div className="flex items-center gap-1 justify-end mt-1">
                  <span className="text-xs opacity-70">
                    {new Date(msg.created_at).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {ehMinhaMensagem && (
                    <>
                      {msg.lida ? (
                        <CheckCheck className="h-3 w-3 opacity-70" />
                      ) : (
                        <Check className="h-3 w-3 opacity-70" />
                      )}
                    </>
                  )}
                </div>
              </Card>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input de mensagem */}
      <div className="border-t bg-background p-4">
        <div className="flex gap-2">
          <Textarea
            value={novaMensagem}
            onChange={(e) => setNovaMensagem(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua mensagem..."
            className="min-h-[60px] resize-none"
            disabled={enviando}
          />
          <Button
            onClick={enviarMensagem}
            disabled={!novaMensagem.trim() || enviando}
            size="icon"
            className="h-[60px] w-[60px]"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">Pressione Enter para enviar, Shift+Enter para nova linha</p>
      </div>
    </div>
  )
}
