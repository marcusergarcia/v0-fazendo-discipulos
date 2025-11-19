import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, BookOpen, Users, TrendingUp, MessageCircle, Award } from 'lucide-react'
import Link from "next/link"

export default function BoasVindasDiscipuloPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-block p-4 bg-primary/10 rounded-full mb-4">
              <CheckCircle className="w-16 h-16 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Bem-vindo ao Fazendo Discípulos!</h1>
            <p className="text-xl text-muted-foreground">
              Seu cadastro foi aprovado e você está pronto para começar sua jornada de discipulado
            </p>
          </div>

          {/* Como Funciona */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">Como Funciona o Sistema</CardTitle>
              <CardDescription>
                Um guia rápido para você começar sua jornada de crescimento espiritual
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">1. Faça Login</h3>
                  <p className="text-muted-foreground">
                    Use seu email e senha para acessar o sistema. Você receberá as credenciais por email.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">2. Complete os Passos</h3>
                  <p className="text-muted-foreground">
                    Você passará por 10 passos de crescimento espiritual. Cada passo contém vídeos, artigos, 
                    perguntas para reflexão e missões práticas. Complete todas as tarefas para avançar.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">3. Converse com seu Discipulador</h3>
                  <p className="text-muted-foreground">
                    Use o chat para tirar dúvidas, compartilhar reflexões e pedir orientação. Seu discipulador 
                    está aqui para acompanhar seu crescimento.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Award className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">4. Ganhe XP e Avance de Nível</h3>
                  <p className="text-muted-foreground">
                    Ao completar tarefas e escrever reflexões, você ganha pontos de experiência (XP) e avança 
                    pelos níveis: Explorador → Caminhante → Aprendiz → Servo → Líder.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">5. Torne-se um Discipulador</h3>
                  <p className="text-muted-foreground">
                    Quando estiver preparado, você poderá convidar outras pessoas e se tornar um discipulador, 
                    multiplicando o que aprendeu.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recursos Disponíveis */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">Recursos Disponíveis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">📖 Leitura Bíblica</h4>
                  <p className="text-sm text-muted-foreground">
                    Plano de leitura de 1 ano com checkboxes por capítulo e sistema de marcação de texto colorido
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">💬 Chat em Tempo Real</h4>
                  <p className="text-sm text-muted-foreground">
                    Converse diretamente com seu discipulador para tirar dúvidas e compartilhar experiências
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">🎯 Sistema de Progresso</h4>
                  <p className="text-sm text-muted-foreground">
                    Acompanhe sua evolução através de passos, fases, níveis e pontos de experiência
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">🌳 Árvore Genealógica</h4>
                  <p className="text-sm text-muted-foreground">
                    Visualize sua linha de discipulado e veja o impacto da multiplicação espiritual
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Primeiros Passos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Próximos Passos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                <p className="text-muted-foreground">
                  <strong>1.</strong> Verifique seu email para obter suas credenciais de acesso
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                <p className="text-muted-foreground">
                  <strong>2.</strong> Faça login no sistema usando o link abaixo
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                <p className="text-muted-foreground">
                  <strong>3.</strong> Explore o dashboard e comece seu primeiro passo
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                <p className="text-muted-foreground">
                  <strong>4.</strong> Entre em contato com seu discipulador pelo chat se tiver dúvidas
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Botão de Ação */}
          <div className="text-center mt-8">
            <Link href="/auth/login">
              <Button size="lg" className="text-lg px-8">
                Fazer Login e Começar
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
