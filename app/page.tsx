import type React from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Target, Users, Award, Shield, Sword, BookOpen, Trophy } from 'lucide-react'
import { createClient } from "@/lib/supabase/server"

export default async function LandingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))] dark:bg-grid-slate-700/25" />

        <div className="relative container mx-auto px-4 py-20 sm:py-32">
          <div className="flex flex-col items-center text-center space-y-8">
            <Image
              src="/logo-fazendo-discipulos.png"
              alt="Ministério Fazendo Discípulos"
              width={400}
              height={150}
              priority
              className="mb-4"
            />

            <Badge className="px-4 py-2 text-sm font-semibold bg-secondary text-secondary-foreground">
              <Sparkles className="w-4 h-4 mr-2 inline" />
              Jornada de Fé Interativa
            </Badge>

            <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-balance max-w-4xl">
              Fazendo Discípulos
              <span className="block text-primary mt-2">de Cristo</span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl text-balance">
              Uma jornada gamificada de crescimento espiritual. Aprenda, pratique e multiplique a fé através de missões,
              recompensas e conexões reais.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Button size="lg" className="text-lg px-8 py-6" asChild>
                <Link href={user ? "/dashboard" : "/auth/login"}>
                  {user ? "Continuar Jornada" : "Iniciar Jornada"}
                  <Target className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-transparent">
                Conheça o Sistema
                <BookOpen className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Como Funciona</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Um sistema completo de discipulado estruturado em fases progressivas
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon={<BookOpen className="w-8 h-8" />}
            title="Fase 1: O Evangelho"
            description="10 passos para compreender o Evangelho e tornar-se discípulo de Cristo"
            color="text-primary"
          />
          <FeatureCard
            icon={<Shield className="w-8 h-8" />}
            title="Fase 2: Armadura de Deus"
            description="Adquira cada peça da armadura espiritual através de missões práticas"
            color="text-accent"
          />
          <FeatureCard
            icon={<Sword className="w-8 h-8" />}
            title="Sermão da Montanha"
            description="Treinamento completo em Mateus 5-7 para formar discipuladores"
            color="text-secondary"
          />
          <FeatureCard
            icon={<Users className="w-8 h-8" />}
            title="Conexão Real"
            description="Interação obrigatória entre discipulador e discípulo em cada passo"
            color="text-chart-2"
          />
          <FeatureCard
            icon={<Award className="w-8 h-8" />}
            title="Recompensas"
            description="Ganhe insígnias digitais e medalhas físicas ao completar cada fase"
            color="text-secondary"
          />
          <FeatureCard
            icon={<Trophy className="w-8 h-8" />}
            title="Multiplicação"
            description="Torne-se discipulador e ajude outros a crescer na fé"
            color="text-chart-4"
          />
        </div>
      </section>

      {/* Levels Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Níveis de Crescimento</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Progrida através dos níveis enquanto cresce espiritualmente
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <LevelCard level={1} name="Explorador" description="Conhecendo o Evangelho" />
            <LevelCard level={2} name="Discípulo" description="Seguidor de Cristo" />
            <LevelCard level={3} name="Guerreiro" description="Vestido com a Armadura" />
            <LevelCard level={4} name="Servo Mestre" description="Treinado e Preparado" />
            <LevelCard level={5} name="Multiplicador" description="Fazendo Discípulos" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 container mx-auto px-4">
        <Card className="p-12 text-center bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
          <h2 className="text-4xl font-bold mb-4">Pronto para Começar?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Inicie sua jornada de fé hoje. Conecte-se com um discipulador e comece a transformação.
          </p>
          <Button size="lg" className="text-lg px-8 py-6" asChild>
            <Link href={user ? "/dashboard" : "/auth/login"}>
              {user ? "Ir para Dashboard" : "Iniciar Agora"}
              <Sparkles className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </Card>
      </section>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
  color,
}: { icon: React.ReactNode; title: string; description: string; color: string }) {
  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className={`mb-4 ${color}`}>{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </Card>
  )
}

function LevelCard({ level, name, description }: { level: number; name: string; description: string }) {
  return (
    <Card className="p-6 text-center hover:border-primary transition-colors">
      <div className="text-3xl font-bold text-primary mb-2">{level}</div>
      <h3 className="text-lg font-semibold mb-1">{name}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </Card>
  )
}
