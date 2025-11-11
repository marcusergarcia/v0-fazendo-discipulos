import { Award } from "lucide-react"
import Image from "next/image"

interface AvatarArmaduraProps {
  nivel: number
  size?: "sm" | "md" | "lg"
  showLabels?: boolean
}

export function AvatarArmadura({ nivel, size = "md", showLabels = false }: AvatarArmaduraProps) {
  // Mapeamento: nível 1 = Explorador (sem armadura), nível 5 = Multiplicador (armadura completa)
  const pecasArmadura = {
    capacete: nivel >= 2, // Discípulo
    peitoral: nivel >= 3, // Guerreiro
    escudo: nivel >= 4, // Servo Mestre
    espada: nivel >= 5, // Multiplicador
  }

  const sizeClasses = {
    sm: "w-32 h-40",
    md: "w-48 h-64",
    lg: "w-64 h-80",
  }

  const iconSize = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-6 h-6",
  }

  // Determina qual imagem 3D mostrar baseado no nível
  const getAvatarImage = () => {
    const images = {
      1: "/images/avatar-nivel-1.jpg", // Explorador - sem armadura
      2: "/images/avatar-nivel-2.jpg", // Discípulo - com capacete
      3: "/images/avatar-nivel-3.jpg", // Guerreiro - capacete + couraça
      4: "/images/avatar-nivel-4.jpg", // Servo Mestre - capacete + couraça + escudo
      5: "/images/avatar-nivel-5.jpg", // Multiplicador - armadura completa
    }
    return images[nivel as keyof typeof images] || images[1]
  }

  return (
    <div className="flex flex-col items-center">
      <div className={`relative ${sizeClasses[size]} flex items-center justify-center`}>
        <div className="relative w-full h-full rounded-lg overflow-hidden bg-gradient-to-b from-accent/10 to-background shadow-2xl">
          <Image
            src={getAvatarImage() || "/placeholder.svg"}
            alt={`Avatar Nível ${nivel}`}
            fill
            className="object-contain drop-shadow-2xl"
            priority
          />

          {/* Badge de nível */}
          <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg shadow-lg">
            {nivel}
          </div>
        </div>
      </div>

      {/* Labels das peças conquistadas */}
      {showLabels && (
        <div className="mt-4 space-y-1 text-xs">
          {Object.entries(pecasArmadura).map(([peca, conquistado]) => (
            <div key={peca} className="flex items-center gap-2">
              {conquistado ? (
                <Award className={`${iconSize[size]} text-accent`} />
              ) : (
                <div className={`${iconSize[size]} rounded-full bg-muted`} />
              )}
              <span className={conquistado ? "text-foreground" : "text-muted-foreground"}>{getNomePeca(peca)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function getNomePeca(peca: string): string {
  const nomes: Record<string, string> = {
    capacete: "Capacete da Salvação",
    peitoral: "Couraça da Justiça",
    escudo: "Escudo da Fé",
    espada: "Espada do Espírito",
  }
  return nomes[peca] || peca
}
