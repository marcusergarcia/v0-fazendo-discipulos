"use client"
import Image from "next/image"

interface PecaArmadura {
  id: string
  nome: string
  desbloqueada: boolean
}

interface AvatarArmaduraProps {
  fotoUrl?: string | null
  nome: string
  xp: number
  xpProximoNivel: number
  nivel: number
  pecasArmadura: PecaArmadura[]
  tamanho?: "sm" | "md" | "lg"
}

export function AvatarArmadura({
  fotoUrl,
  nome,
  xp,
  xpProximoNivel,
  nivel,
  pecasArmadura,
  tamanho = "md",
}: AvatarArmaduraProps) {
  const iniciais = nome
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase()

  const porcentagemXP = (xp / xpProximoNivel) * 100

  // Tamanhos
  const tamanhos = {
    sm: { container: "w-32", foto: 80, avatar: 80 },
    md: { container: "w-48", foto: 120, avatar: 120 },
    lg: { container: "w-64", foto: 160, avatar: 160 },
  }

  const config = tamanhos[tamanho]

  // Verifica quais peças estão desbloqueadas
  const capacete = pecasArmadura.find((p) => p.id === "capacete")?.desbloqueada
  const couraca = pecasArmadura.find((p) => p.id === "couraca")?.desbloqueada
  const cinto = pecasArmadura.find((p) => p.id === "cinto")?.desbloqueada
  const calcado = pecasArmadura.find((p) => p.id === "calcado")?.desbloqueada
  const escudo = pecasArmadura.find((p) => p.id === "escudo")?.desbloqueada
  const espada = pecasArmadura.find((p) => p.id === "espada")?.desbloqueada

  return (
    <div className={`${config.container} mx-auto`}>
      {/* Foto de Perfil */}
      <div className="relative mx-auto mb-3" style={{ width: config.foto, height: config.foto }}>
        {/* Avatar base */}
        <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-primary shadow-lg">
          {fotoUrl ? (
            <Image src={fotoUrl || "/placeholder.svg"} alt={nome} fill className="object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
              <span className="text-4xl font-bold text-primary">{iniciais}</span>
            </div>
          )}
        </div>

        {/* Capacete da Salvação (no topo) */}
        {capacete && (
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-16 h-16 text-yellow-500 animate-pulse">
            <svg viewBox="0 0 64 64" fill="currentColor" className="drop-shadow-lg">
              <path d="M32 4 C20 4 12 12 12 20 L12 32 L16 32 L16 20 C16 14 22 8 32 8 C42 8 48 14 48 20 L48 32 L52 32 L52 20 C52 12 44 4 32 4 Z M18 24 L18 36 L46 36 L46 24 Z M22 28 L42 28 C42 30 42 32 42 32 L22 32 C22 32 22 30 22 28 Z" />
            </svg>
          </div>
        )}

        {/* Couraça da Justiça (ao redor do peito) */}
        {couraca && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/4 w-20 h-20 text-blue-500 opacity-80">
            <svg viewBox="0 0 64 64" fill="currentColor" className="drop-shadow-lg">
              <path d="M32 8 L16 16 L16 28 C16 40 24 48 32 56 C40 48 48 40 48 28 L48 16 Z M32 16 L40 20 L40 28 C40 34 36 40 32 44 C28 40 24 34 24 28 L24 20 Z" />
            </svg>
          </div>
        )}

        {/* Cinturão da Verdade (ao redor da cintura) */}
        {cinto && (
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-4 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 rounded-full shadow-lg border-2 border-amber-700" />
        )}

        {/* Escudo da Fé (lado esquerdo) */}
        {escudo && (
          <div className="absolute top-1/3 -left-6 w-12 h-16 text-red-600 animate-pulse">
            <svg viewBox="0 0 32 48" fill="currentColor" className="drop-shadow-lg">
              <path d="M16 4 L4 8 L4 24 C4 32 10 40 16 44 C22 40 28 32 28 24 L28 8 Z M16 8 L24 12 L24 24 C24 28 20 34 16 38 C12 34 8 28 8 24 L8 12 Z" />
              <path d="M12 16 L14 18 L18 14 L20 16 L14 22 L10 18 Z" fill="gold" />
            </svg>
          </div>
        )}

        {/* Espada do Espírito (lado direito) */}
        {espada && (
          <div className="absolute top-1/3 -right-6 w-8 h-20 text-gray-300 rotate-45">
            <svg viewBox="0 0 32 80" fill="currentColor" className="drop-shadow-lg">
              <rect x="14" y="4" width="4" height="60" fill="silver" />
              <path d="M16 0 L10 8 L22 8 Z" fill="silver" />
              <rect x="12" y="64" width="8" height="6" fill="gold" />
              <circle cx="16" cy="70" r="4" fill="gold" />
            </svg>
          </div>
        )}

        {/* Calçado da Paz (embaixo) */}
        {calcado && (
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
            <div className="w-6 h-4 bg-gradient-to-b from-brown-700 to-brown-900 rounded-t-full shadow-lg" />
            <div className="w-6 h-4 bg-gradient-to-b from-brown-700 to-brown-900 rounded-t-full shadow-lg" />
          </div>
        )}

        {/* Badge de Nível */}
        <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-amber-500 to-yellow-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg shadow-lg border-2 border-white">
          {nivel}
        </div>
      </div>

      {/* Barra de XP */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>XP: {xp}</span>
          <span>{xpProximoNivel}</span>
        </div>
        <div className="h-3 bg-secondary rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500 ease-out shadow-lg"
            style={{ width: `${Math.min(porcentagemXP, 100)}%` }}
          />
        </div>
      </div>

      {/* Lista de Peças Desbloqueadas */}
      <div className="mt-3 grid grid-cols-3 gap-1 text-xs">
        {pecasArmadura.map((peca) => (
          <div
            key={peca.id}
            className={`text-center p-1 rounded ${
              peca.desbloqueada ? "bg-green-500/20 text-green-700 font-semibold" : "bg-gray-200 text-gray-400"
            }`}
          >
            {peca.nome.split(" ")[0]}
          </div>
        ))}
      </div>
    </div>
  )
}
