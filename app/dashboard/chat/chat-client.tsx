"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Send, MessageCircle, Check, CheckCheck } from 'lucide-react'
import Link from "next/link"
import { useRouter } from 'next/navigation'

type Mensagem = {
  id: string
  discipulo_id: string
  remetente_id: string
  mensagem: string
  created_at: string
  lida: boolean
  data_leitura: string | null
}

type ChatClientProps = {
  userId: string
  discipuloId: string
  discipuladorId: string | null
  discipuladorNome: string
  mensagensIniciais: Mensagem[]
}

export default function ChatClient({
  userId,
  discipuloId,
  discipuladorId,
  discipuladorNome,
  mensagensIniciais,
}: ChatClientProps) {
  const [mensagens, setMensagens] = useState<Mensagem[]>(mensagensIniciais)
  const [novaMensagem, setNovaMensagem] = useState("")
  const [enviando, setEnviando] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()
  const router = useRouter()

  // Scroll automático para última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [mensagens])

  useEffect(() => {
    const channel = supabase
      .channel('mensagens-chat')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mensagens',
          filter: `discipulo_id=eq.${discipuloId}`,
        },
        (payload) => {
          const novaMensagem = payload.new as Mensagem
          setMensagens((prev) => [...prev, novaMensagem])
          
          // Se a mensagem é do discipulador, marcar como lida automaticamente
          if (novaMensagem.remetente_id === discipuladorId) {
            supabase
              .from("mensagens")
              .update({ lida: true, data_leitura: new Date().toISOString() })
              .eq("id", novaMensagem.id)
              .then(() => {
                // Atualizar estado local
                setMensagens((prev) =>
                  prev.map((msg) =>
                    msg.id === novaMensagem.id
                      ? { ...msg, lida: true, data_leitura: new Date().toISOString() }
                      : msg
                  )
                )
              })
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'mensagens',
          filter: `discipulo_id=eq.${discipuloId}`,
        },
        (payload) => {
          const mensagemAtualizada = payload.new as Mensagem
          setMensagens((prev) =>
            prev.map((msg) =>
              msg.id === mensagemAtualizada.id ? mensagemAtualizada : msg
            )
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, discipuloId, discipuladorId])

  const enviarMensagem = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!novaMensagem.trim() || enviando) return

    setEnviando(true)

    try {
      const { error } = await supabase.from("mensagens").insert({
        discipulo_id: discipuloId,
        remetente_id: userId,
        mensagem: novaMensagem.trim(),
        lida: false,
      })

      if (error) throw error

      setNovaMensagem("")
      router.refresh()
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-bold">Chat com Discipulador</h1>
              <p className="text-sm text-muted-foreground">
                {discipuladorNome}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Mensagens
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mb-6 max-h-[500px] overflow-y-auto p-4">
              {mensagens.length > 0 ? (
                mensagens.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-4 rounded-lg ${
                      msg.remetente_id === userId ? "bg-primary/10 ml-8" : "bg-muted mr-8"
                    }`}
                  >
                    <p className="text-sm font-medium mb-1">
                      {msg.remetente_id === userId ? "Você" : discipuladorNome}
                    </p>
                    <p className="text-base">{msg.mensagem}</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-muted-foreground">
                        {new Date(msg.created_at).toLocaleString("pt-BR")}
                      </p>
                      {msg.remetente_id === userId && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          {msg.lida ? (
                            <>
                              <CheckCheck className="w-3 h-3 text-primary" />
                              <span>Lida</span>
                            </>
                          ) : (
                            <>
                              <Check className="w-3 h-3" />
                              <span>Enviada</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhuma mensagem ainda. Inicie uma conversa!</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={enviarMensagem} className="space-y-3">
              <Textarea
                value={novaMensagem}
                onChange={(e) => setNovaMensagem(e.target.value)}
                placeholder="Digite sua mensagem..."
                className="min-h-24"
                required
              />
              <Button type="submit" size="lg" className="w-full" disabled={enviando}>
                <Send className="w-4 h-4 mr-2" />
                {enviando ? "Enviando..." : "Enviar Mensagem"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
