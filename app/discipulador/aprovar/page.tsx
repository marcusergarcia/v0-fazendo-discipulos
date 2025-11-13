import { createClient } from "@/lib/supabase/server"
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Clock, Mail, MapPin, Calendar, Phone, Church } from 'lucide-react'
import Link from "next/link"

export default async function AprovarDiscipulosPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: discipulosPendentes } = await supabase
    .from("discipulos")
    .select("*")
    .eq("discipulador_id", user.id)
    .eq("aprovado_discipulador", false)
    .is("user_id", null) // Apenas os que ainda não têm usuário criado
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost">← Voltar ao Dashboard</Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Aprovar Novos Discípulos</CardTitle>
            <CardDescription>
              Revise as informações dos candidatos e aprove ou rejeite seus acessos ao sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!discipulosPendentes || discipulosPendentes.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Nenhum discípulo aguardando aprovação</h3>
                <p className="text-muted-foreground">
                  Quando alguém se cadastrar através do seu convite, aparecerá aqui para aprovação.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {discipulosPendentes.map((discipulo) => {
                  return (
                    <Card key={discipulo.id} className="border-primary/20">
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <Avatar className="w-16 h-16">
                            {discipulo.foto_perfil_url_temp ? (
                              <AvatarImage
                                src={discipulo.foto_perfil_url_temp || "/placeholder.svg"}
                                alt={discipulo.nome_completo_temp || ""}
                              />
                            ) : (
                              <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                                {discipulo.nome_completo_temp
                                  ?.split(" ")
                                  .map((n: string) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            )}
                          </Avatar>

                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h3 className="text-xl font-semibold">{discipulo.nome_completo_temp}</h3>
                                <Badge variant="secondary" className="mt-1">
                                  Aguardando aprovação
                                </Badge>
                              </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-3 text-sm">
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-muted-foreground" />
                                <span>{discipulo.email_temporario}</span>
                              </div>
                              {discipulo.telefone_temp && (
                                <div className="flex items-center gap-2">
                                  <Phone className="w-4 h-4 text-muted-foreground" />
                                  <span>{discipulo.telefone_temp}</span>
                                </div>
                              )}
                              {discipulo.igreja_temp && (
                                <div className="flex items-center gap-2">
                                  <Church className="w-4 h-4 text-muted-foreground" />
                                  <span>{discipulo.igreja_temp}</span>
                                </div>
                              )}
                              {discipulo.localizacao_cadastro && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4 text-muted-foreground" />
                                  <span>{discipulo.localizacao_cadastro}</span>
                                </div>
                              )}
                              {discipulo.data_cadastro && (
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-muted-foreground" />
                                  <span>
                                    Cadastro: {discipulo.data_cadastro} às {discipulo.hora_cadastro}
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="flex gap-2 mt-4">
                              <Link href={`/discipulador/aprovar/${discipulo.id}`} className="flex-1">
                                <Button className="w-full">Revisar e Aprovar</Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
