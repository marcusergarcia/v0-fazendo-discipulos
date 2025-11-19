"use client"

import { useState } from "react"
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Sparkles, Heart, BookOpen, Users, ArrowRight } from 'lucide-react'
import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { generateAvatar } from "@/lib/generate-avatar"

interface BoasVindasClientProps {
  discipulo: any
  profile: any
}

export default function BoasVindasClient({ discipulo, profile }: BoasVindasClientProps) {
  const router = useRouter()
  const [etapaAtual, setEtapaAtual] = useState(1)

  const handleContinuar = () => {
    if (etapaAtual < 3) {
      setEtapaAtual(etapaAtual + 1)
    } else {
      router.push("/dashboard")
    }
  }

  const handlePular = () => {
    router.push("/dashboard")
  }

  const avatarUrl = profile?.foto_perfil_url || generateAvatar({
    genero: profile?.genero,
    idade: profile?.data_nascimento ? new Date().getFullYear() - new Date(profile.data_nascimento).getFullYear() : undefined,
    etnia: profile?.etnia
  })

  const discipuladorAvatar = discipulo?.discipulador?.foto_perfil_url

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <motion.div
        key={etapaAtual}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card className="p-8 md:p-12 shadow-xl">
          {/* Etapa 1: Boas-vindas */}
          {etapaAtual === 1 && (
            <div className="text-center space-y-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
              >
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Sparkles className="w-12 h-12 text-white" />
                </div>
              </motion.div>

              <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  Bem-vindo ao Fazendo Discípulos!
                </h1>
                <p className="text-xl text-gray-600">
                  Olá, {profile?.nome_completo?.split(" ")[0] || "Discípulo"}!
                </p>
              </div>

              <p className="text-lg text-gray-700 max-w-xl mx-auto">
                Você foi aprovado e agora faz parte de uma jornada transformadora de fé e crescimento espiritual.
              </p>

              <div className="flex items-center justify-center gap-4 pt-4">
                <Avatar className="w-16 h-16 border-4 border-white shadow-lg">
                  <AvatarImage src={avatarUrl || "/placeholder.svg"} alt="Seu avatar" />
                  <AvatarFallback>{profile?.nome_completo?.[0] || "D"}</AvatarFallback>
                </Avatar>
                <Heart className="w-8 h-8 text-red-500" />
                <Avatar className="w-16 h-16 border-4 border-white shadow-lg">
                  <AvatarImage src={discipuladorAvatar || "/placeholder.svg"} alt="Discipulador" />
                  <AvatarFallback>{discipulo?.discipulador?.nome_completo?.[0] || "D"}</AvatarFallback>
                </Avatar>
              </div>

              <p className="text-sm text-gray-600">
                Seu discipulador: <span className="font-semibold">{discipulo?.discipulador?.nome_completo}</span>
              </p>
            </div>
          )}

          {/* Etapa 2: O que esperar */}
          {etapaAtual === 2 && (
            <div className="space-y-8">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-gray-900">
                  Sua Jornada de Fé
                </h2>
                <p className="text-gray-600">
                  Descubra o que te espera nesta caminhada
                </p>
              </div>

              <div className="space-y-4">
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg"
                >
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">10 Passos de Discipulado</h3>
                    <p className="text-sm text-gray-600">
                      Cada passo contém vídeos, artigos e reflexões sobre fundamentos da fé cristã
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg"
                >
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Sistema de Experiência (XP)</h3>
                    <p className="text-sm text-gray-600">
                      Ganhe pontos, suba de nível e conquiste insígnias conforme progride
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-start gap-4 p-4 bg-green-50 rounded-lg"
                >
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Acompanhamento Personalizado</h3>
                    <p className="text-sm text-gray-600">
                      Seu discipulador vai acompanhar, avaliar e conversar com você durante toda jornada
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          )}

          {/* Etapa 3: Pronto para começar */}
          {etapaAtual === 3 && (
            <div className="text-center space-y-6">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring" }}
              >
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                  <ArrowRight className="w-12 h-12 text-white" />
                </div>
              </motion.div>

              <div className="space-y-2">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                  Pronto para Começar?
                </h2>
                <p className="text-lg text-gray-600">
                  Sua jornada começa agora!
                </p>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 space-y-3">
                <p className="font-semibold text-gray-900">
                  Passo 1: O Evangelho
                </p>
                <p className="text-sm text-gray-600">
                  Você começará descobrindo a essência do Evangelho e o propósito de Deus para sua vida
                </p>
              </div>

              <p className="text-sm text-gray-500 italic">
                Portanto, vão e façam discípulos de todas as nações - Mateus 28:19
              </p>
            </div>
          )}

          {/* Botões de navegação */}
          <div className="flex items-center justify-between mt-8 pt-8 border-t">
            <Button
              variant="ghost"
              onClick={handlePular}
              className="text-gray-500"
            >
              Pular introdução
            </Button>

            <div className="flex items-center gap-3">
              <div className="flex gap-2">
                {[1, 2, 3].map((etapa) => (
                  <div
                    key={etapa}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      etapa === etapaAtual ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>

              <Button onClick={handleContinuar} size="lg">
                {etapaAtual < 3 ? "Continuar" : "Começar Jornada"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
