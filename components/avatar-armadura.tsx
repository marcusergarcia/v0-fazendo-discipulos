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
        <svg viewBox="0 0 200 280" className="w-full h-full drop-shadow-2xl">
          <defs>
            {/* Gradientes para efeito 3D */}
            <linearGradient id="skinGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="oklch(0.82 0.04 40)" />
              <stop offset="100%" stopColor="oklch(0.72 0.04 40)" />
            </linearGradient>
            <linearGradient id="tunicGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="oklch(0.55 0.20 25)" />
              <stop offset="100%" stopColor="oklch(0.40 0.20 25)" />
            </linearGradient>
            <linearGradient id="armorGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="oklch(0.65 0.05 240)" />
              <stop offset="100%" stopColor="oklch(0.45 0.05 240)" />
            </linearGradient>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="oklch(0.85 0.15 85)" />
              <stop offset="100%" stopColor="oklch(0.65 0.15 85)" />
            </linearGradient>
            <radialGradient id="shieldGradient">
              <stop offset="0%" stopColor="oklch(0.75 0.15 85)" />
              <stop offset="100%" stopColor="oklch(0.55 0.15 85)" />
            </radialGradient>
          </defs>

          {/* Pernas e Sandálias */}
          <g>
            {/* Perna esquerda */}
            <path
              d="M 85 170 L 80 230 L 75 235 Q 72 237, 70 235 L 65 230 L 70 170 Z"
              fill="url(#tunicGradient)"
              stroke="oklch(0.30 0.20 25)"
              strokeWidth="1.5"
            />
            {/* Perna direita */}
            <path
              d="M 115 170 L 120 230 L 125 235 Q 128 237, 130 235 L 135 230 L 130 170 Z"
              fill="url(#tunicGradient)"
              stroke="oklch(0.30 0.20 25)"
              strokeWidth="1.5"
            />
            {/* Sandálias */}
            <ellipse cx="72" cy="237" rx="10" ry="4" fill="oklch(0.35 0.05 40)" />
            <ellipse cx="128" cy="237" rx="10" ry="4" fill="oklch(0.35 0.05 40)" />
          </g>

          {/* Corpo - Túnica */}
          <g>
            <path
              d="M 75 100 L 70 170 Q 70 175, 75 175 L 125 175 Q 130 175, 130 170 L 125 100 Z"
              fill="url(#tunicGradient)"
              stroke="oklch(0.30 0.20 25)"
              strokeWidth="2"
            />
            {/* Cinto */}
            <rect x="70" y="150" width="60" height="8" rx="2" fill="oklch(0.40 0.05 40)" />
            <circle cx="100" cy="154" r="4" fill="url(#goldGradient)" />
          </g>

          {/* Peitoral/Couraça - Nível 3+ */}
          {pecasArmadura.peitoral && (
            <g>
              <path
                d="M 70 95 L 65 145 Q 65 150, 70 152 L 130 152 Q 135 150, 135 145 L 130 95 Z"
                fill="url(#armorGradient)"
                stroke="oklch(0.30 0.05 240)"
                strokeWidth="2"
              />
              {/* Detalhes da armadura - escamas */}
              {[...Array(4)].map((_, row) =>
                [...Array(6)].map((_, col) => (
                  <circle
                    key={`scale-${row}-${col}`}
                    cx={75 + col * 10}
                    cy={105 + row * 12}
                    r="4"
                    fill="oklch(0.50 0.05 240)"
                    opacity="0.6"
                  />
                )),
              )}
              {/* Cruz central */}
              <circle cx="100" cy="120" r="8" fill="url(#goldGradient)" stroke="oklch(0.50 0.15 85)" strokeWidth="1" />
            </g>
          )}

          {/* Braço esquerdo */}
          <g>
            <path
              d="M 70 100 L 45 135 L 42 140 Q 40 142, 42 144 L 48 145 L 75 110 Z"
              fill="url(#skinGradient)"
              stroke="oklch(0.62 0.04 40)"
              strokeWidth="1.5"
            />
            {/* Ombreira */}
            <ellipse cx="70" cy="100" rx="12" ry="8" fill="url(#tunicGradient)" />
          </g>

          {/* Escudo - Nível 4+ */}
          {pecasArmadura.escudo && (
            <g>
              <ellipse
                cx="35"
                cy="140"
                rx="20"
                ry="28"
                fill="url(#shieldGradient)"
                stroke="oklch(0.40 0.15 85)"
                strokeWidth="2"
              />
              <path
                d="M 35 118 L 28 140 L 35 162 L 42 140 Z"
                fill="oklch(0.85 0.20 60)"
                stroke="oklch(0.65 0.20 60)"
                strokeWidth="1.5"
              />
              <circle cx="35" cy="140" r="6" fill="url(#goldGradient)" />
            </g>
          )}

          {/* Braço direito */}
          <g>
            <path
              d="M 130 100 L 155 135 L 158 140 Q 160 142, 158 144 L 152 145 L 125 110 Z"
              fill="url(#skinGradient)"
              stroke="oklch(0.62 0.04 40)"
              strokeWidth="1.5"
            />
            {/* Ombreira */}
            <ellipse cx="130" cy="100" rx="12" ry="8" fill="url(#tunicGradient)" />
          </g>

          {/* Espada - Nível 5 */}
          {pecasArmadura.espada && (
            <g>
              {/* Lâmina */}
              <path
                d="M 160 110 L 165 80 L 167 78 L 169 80 L 174 110 Z"
                fill="oklch(0.85 0.02 240)"
                stroke="oklch(0.65 0.02 240)"
                strokeWidth="1"
              />
              {/* Guarda */}
              <rect x="157" y="108" width="20" height="5" rx="2" fill="url(#goldGradient)" />
              {/* Cabo */}
              <rect x="163" y="113" width="8" height="20" rx="2" fill="oklch(0.45 0.05 40)" />
              {/* Pomo */}
              <circle cx="167" cy="135" r="4" fill="url(#goldGradient)" />
            </g>
          )}

          {/* Pescoço */}
          <rect
            x="90"
            y="75"
            width="20"
            height="20"
            rx="4"
            fill="url(#skinGradient)"
            stroke="oklch(0.62 0.04 40)"
            strokeWidth="1"
          />

          {/* Cabeça */}
          <g>
            <ellipse
              cx="100"
              cy="55"
              rx="22"
              ry="26"
              fill="url(#skinGradient)"
              stroke="oklch(0.62 0.04 40)"
              strokeWidth="1.5"
            />
            {/* Rosto - olhos */}
            <ellipse cx="92" cy="52" rx="3" ry="4" fill="oklch(0.35 0.05 40)" />
            <ellipse cx="108" cy="52" rx="3" ry="4" fill="oklch(0.35 0.05 40)" />
            {/* Sobrancelhas */}
            <path d="M 87 47 Q 92 46, 97 47" stroke="oklch(0.30 0.05 40)" strokeWidth="1.5" fill="none" />
            <path d="M 103 47 Q 108 46, 113 47" stroke="oklch(0.30 0.05 40)" strokeWidth="1.5" fill="none" />
            {/* Boca */}
            <path d="M 92 62 Q 100 65, 108 62" stroke="oklch(0.45 0.05 40)" strokeWidth="1.5" fill="none" />
            {/* Barba */}
            <ellipse cx="100" cy="70" rx="18" ry="10" fill="oklch(0.40 0.05 40)" />
          </g>

          {/* Capacete - Nível 2+ */}
          {pecasArmadura.capacete && (
            <g>
              <path
                d="M 78 55 Q 78 30, 100 25 Q 122 30, 122 55 L 120 60 L 80 60 Z"
                fill="url(#armorGradient)"
                stroke="oklch(0.30 0.05 240)"
                strokeWidth="2"
              />
              {/* Crista do capacete */}
              <path
                d="M 100 25 L 95 15 Q 100 10, 105 15 L 100 25"
                fill="oklch(0.60 0.25 25)"
                stroke="oklch(0.40 0.25 25)"
                strokeWidth="1"
              />
              {/* Detalhe dourado */}
              <circle cx="100" cy="35" r="5" fill="url(#goldGradient)" />
              {/* Proteção facial */}
              <rect x="85" y="57" width="7" height="12" rx="1" fill="url(#armorGradient)" opacity="0.7" />
              <rect x="108" y="57" width="7" height="12" rx="1" fill="url(#armorGradient)" opacity="0.7" />
            </g>
          )}
        </svg>
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
