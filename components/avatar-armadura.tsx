import { Award } from "lucide-react"

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
    sm: "w-24 h-32",
    md: "w-32 h-48",
    lg: "w-48 h-64",
  }

  const iconSize = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-6 h-6",
  }

  return (
    <div className="flex flex-col items-center">
      <div className={`relative ${sizeClasses[size]} flex items-center justify-center`}>
        {/* Base do personagem */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            {/* Corpo do personagem (boneco simples) */}
            <svg viewBox="0 0 100 140" className="w-full h-full">
              {/* Cabeça */}
              <circle cx="50" cy="25" r="15" fill="oklch(0.85 0.02 200)" stroke="oklch(0.5 0.02 200)" strokeWidth="1" />

              {/* Capacete - Aparece no nível 2+ */}
              {pecasArmadura.capacete && (
                <g>
                  <path
                    d="M 35 25 Q 35 12, 50 12 Q 65 12, 65 25 L 62 28 L 38 28 Z"
                    fill="oklch(0.65 0.15 40)"
                    stroke="oklch(0.45 0.15 40)"
                    strokeWidth="1.5"
                  />
                  <circle cx="50" cy="20" r="3" fill="oklch(0.85 0.2 60)" />
                </g>
              )}

              {/* Corpo */}
              <rect
                x="38"
                y="40"
                width="24"
                height="35"
                rx="3"
                fill="oklch(0.75 0.05 200)"
                stroke="oklch(0.5 0.02 200)"
                strokeWidth="1"
              />

              {/* Peitoral - Aparece no nível 3+ */}
              {pecasArmadura.peitoral && (
                <g>
                  <rect
                    x="36"
                    y="40"
                    width="28"
                    height="30"
                    rx="4"
                    fill="oklch(0.60 0.15 40)"
                    stroke="oklch(0.40 0.15 40)"
                    strokeWidth="1.5"
                  />
                  <line x1="50" y1="42" x2="50" y2="68" stroke="oklch(0.45 0.15 40)" strokeWidth="1" />
                  <circle cx="50" cy="50" r="4" fill="oklch(0.85 0.2 60)" />
                </g>
              )}

              {/* Braços */}
              <rect
                x="25"
                y="42"
                width="8"
                height="25"
                rx="4"
                fill="oklch(0.75 0.05 200)"
                stroke="oklch(0.5 0.02 200)"
                strokeWidth="1"
              />
              <rect
                x="67"
                y="42"
                width="8"
                height="25"
                rx="4"
                fill="oklch(0.75 0.05 200)"
                stroke="oklch(0.5 0.02 200)"
                strokeWidth="1"
              />

              {/* Escudo - Aparece no nível 4+ (braço esquerdo) */}
              {pecasArmadura.escudo && (
                <g>
                  <path
                    d="M 18 50 L 18 65 Q 23 70, 28 65 L 28 50 Z"
                    fill="oklch(0.55 0.18 250)"
                    stroke="oklch(0.35 0.18 250)"
                    strokeWidth="1.5"
                  />
                  <path d="M 20 52 L 26 52 L 23 62 Z" fill="oklch(0.85 0.2 60)" />
                </g>
              )}

              {/* Espada - Aparece no nível 5 (braço direito) */}
              {pecasArmadura.espada && (
                <g>
                  <rect
                    x="74"
                    y="38"
                    width="3"
                    height="25"
                    fill="oklch(0.70 0.05 200)"
                    stroke="oklch(0.40 0.05 200)"
                    strokeWidth="0.5"
                  />
                  <rect
                    x="72"
                    y="36"
                    width="7"
                    height="4"
                    rx="1"
                    fill="oklch(0.50 0.15 40)"
                    stroke="oklch(0.30 0.15 40)"
                    strokeWidth="0.5"
                  />
                  <path
                    d="M 73 63 L 75.5 68 L 78 63 Z"
                    fill="oklch(0.75 0.05 200)"
                    stroke="oklch(0.40 0.05 200)"
                    strokeWidth="0.5"
                  />
                </g>
              )}

              {/* Pernas */}
              <rect
                x="40"
                y="75"
                width="8"
                height="30"
                rx="4"
                fill="oklch(0.75 0.05 200)"
                stroke="oklch(0.5 0.02 200)"
                strokeWidth="1"
              />
              <rect
                x="52"
                y="75"
                width="8"
                height="30"
                rx="4"
                fill="oklch(0.75 0.05 200)"
                stroke="oklch(0.5 0.02 200)"
                strokeWidth="1"
              />

              {/* Botas */}
              <ellipse cx="44" cy="108" rx="6" ry="3" fill="oklch(0.40 0.05 200)" />
              <ellipse cx="56" cy="108" rx="6" ry="3" fill="oklch(0.40 0.05 200)" />
            </svg>
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
