import { Shield } from "lucide-react"

type ArmaduraPeca = {
  nome: string
  xpNecessario: number
  descricao: string
}

const PECAS_ARMADURA: ArmaduraPeca[] = [
  { nome: "Cinturão da Verdade", xpNecessario: 100, descricao: "Efésios 6:14" },
  { nome: "Couraça da Justiça", xpNecessario: 300, descricao: "Efésios 6:14" },
  { nome: "Calçado do Evangelho", xpNecessario: 500, descricao: "Efésios 6:15" },
  { nome: "Escudo da Fé", xpNecessario: 700, descricao: "Efésios 6:16" },
  { nome: "Capacete da Salvação", xpNecessario: 900, descricao: "Efésios 6:17" },
  { nome: "Espada do Espírito", xpNecessario: 1000, descricao: "Efésios 6:17" },
]

export function AvatarArmadura({ xp, fotoUrl }: { xp: number; fotoUrl?: string | null }) {
  const pecasDesbloqueadas = PECAS_ARMADURA.filter((peca) => xp >= peca.xpNecessario)
  const proximaPeca = PECAS_ARMADURA.find((peca) => xp < peca.xpNecessario)
  const progressoAtual = proximaPeca ? Math.min((xp / proximaPeca.xpNecessario) * 100, 100) : 100

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Foto do Perfil */}
      <div className="relative">
        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary shadow-lg">
          {fotoUrl ? (
            <img src={fotoUrl || "/placeholder.svg"} alt="Foto de perfil" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <Shield className="w-16 h-16 text-primary" />
            </div>
          )}
        </div>
        {/* Badge de XP */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-bold shadow-lg">
          {xp} XP
        </div>
      </div>

      {/* Avatar com Armadura */}
      <div className="relative w-full max-w-sm">
        <svg viewBox="0 0 200 280" className="w-full h-auto">
          {/* Corpo base (sempre visível) */}
          <ellipse
            cx="100"
            cy="90"
            rx="35"
            ry="45"
            fill="oklch(0.85 0.02 240)"
            stroke="oklch(0.7 0.02 240)"
            strokeWidth="2"
          />
          <rect
            x="75"
            y="130"
            width="50"
            height="80"
            rx="5"
            fill="oklch(0.85 0.02 240)"
            stroke="oklch(0.7 0.02 240)"
            strokeWidth="2"
          />
          <rect
            x="55"
            y="140"
            width="20"
            height="60"
            rx="5"
            fill="oklch(0.85 0.02 240)"
            stroke="oklch(0.7 0.02 240)"
            strokeWidth="2"
          />
          <rect
            x="125"
            y="140"
            width="20"
            height="60"
            rx="5"
            fill="oklch(0.85 0.02 240)"
            stroke="oklch(0.7 0.02 240)"
            strokeWidth="2"
          />
          <rect
            x="80"
            y="210"
            width="15"
            height="50"
            rx="3"
            fill="oklch(0.85 0.02 240)"
            stroke="oklch(0.7 0.02 240)"
            strokeWidth="2"
          />
          <rect
            x="105"
            y="210"
            width="15"
            height="50"
            rx="3"
            fill="oklch(0.85 0.02 240)"
            stroke="oklch(0.7 0.02 240)"
            strokeWidth="2"
          />

          {/* Cinturão da Verdade - 100 XP */}
          {pecasDesbloqueadas.some((p) => p.nome === "Cinturão da Verdade") && (
            <g>
              <rect
                x="70"
                y="125"
                width="60"
                height="12"
                rx="2"
                fill="oklch(0.65 0.15 40)"
                stroke="oklch(0.5 0.15 40)"
                strokeWidth="2"
              />
              <rect x="95" y="127" width="10" height="8" rx="1" fill="oklch(0.75 0.2 60)" />
            </g>
          )}

          {/* Couraça da Justiça - 300 XP */}
          {pecasDesbloqueadas.some((p) => p.nome === "Couraça da Justiça") && (
            <g>
              <path
                d="M 75 135 L 75 180 Q 75 185 80 185 L 120 185 Q 125 185 125 180 L 125 135 Z"
                fill="oklch(0.6 0.1 240)"
                stroke="oklch(0.45 0.1 240)"
                strokeWidth="2"
              />
              <line x1="100" y1="135" x2="100" y2="185" stroke="oklch(0.5 0.1 240)" strokeWidth="2" />
              <line x1="85" y1="145" x2="115" y2="145" stroke="oklch(0.5 0.1 240)" strokeWidth="1" />
              <line x1="85" y1="160" x2="115" y2="160" stroke="oklch(0.5 0.1 240)" strokeWidth="1" />
            </g>
          )}

          {/* Calçado do Evangelho - 500 XP */}
          {pecasDesbloqueadas.some((p) => p.nome === "Calçado do Evangelho") && (
            <g>
              <path
                d="M 80 255 L 75 265 Q 75 268 78 268 L 92 268 Q 95 268 95 265 L 95 255 Z"
                fill="oklch(0.4 0.1 40)"
                stroke="oklch(0.3 0.1 40)"
                strokeWidth="2"
              />
              <path
                d="M 105 255 L 105 265 Q 105 268 108 268 L 122 268 Q 125 268 125 265 L 120 255 Z"
                fill="oklch(0.4 0.1 40)"
                stroke="oklch(0.3 0.1 40)"
                strokeWidth="2"
              />
            </g>
          )}

          {/* Escudo da Fé - 700 XP */}
          {pecasDesbloqueadas.some((p) => p.nome === "Escudo da Fé") && (
            <g>
              <path
                d="M 40 150 L 40 180 Q 40 185 45 185 L 55 185 Q 58 185 60 182 L 65 172 L 60 162 Q 58 159 55 159 L 45 159 Q 40 159 40 164 Z"
                fill="oklch(0.55 0.15 260)"
                stroke="oklch(0.4 0.15 260)"
                strokeWidth="2"
              />
              <path d="M 45 165 L 50 170 L 45 175" stroke="oklch(0.7 0.2 60)" strokeWidth="2" fill="none" />
            </g>
          )}

          {/* Capacete da Salvação - 900 XP */}
          {pecasDesbloqueadas.some((p) => p.nome === "Capacete da Salvação") && (
            <g>
              <path
                d="M 70 85 Q 70 65 100 65 Q 130 65 130 85 L 130 95 Q 130 100 125 100 L 75 100 Q 70 100 70 95 Z"
                fill="oklch(0.6 0.1 240)"
                stroke="oklch(0.45 0.1 240)"
                strokeWidth="2"
              />
              <ellipse cx="100" cy="65" rx="8" ry="6" fill="oklch(0.7 0.2 60)" />
            </g>
          )}

          {/* Espada do Espírito - 1000 XP */}
          {pecasDesbloqueadas.some((p) => p.nome === "Espada do Espírito") && (
            <g>
              <line x1="140" y1="150" x2="165" y2="125" stroke="oklch(0.5 0.1 240)" strokeWidth="4" />
              <line x1="165" y1="125" x2="180" y2="110" stroke="oklch(0.75 0.2 60)" strokeWidth="3" />
              <rect
                x="137"
                y="147"
                width="12"
                height="8"
                rx="2"
                fill="oklch(0.4 0.1 40)"
                stroke="oklch(0.3 0.1 40)"
                strokeWidth="1"
              />
            </g>
          )}
        </svg>

        {/* Indicador de progresso para próxima peça */}
        {proximaPeca && (
          <div className="mt-4 space-y-2">
            <div className="text-sm font-medium text-center">
              Próxima peça: {proximaPeca.nome}
              <span className="block text-xs text-muted-foreground">{proximaPeca.descricao}</span>
            </div>
            <div className="relative h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="absolute h-full bg-primary transition-all duration-500"
                style={{ width: `${progressoAtual}%` }}
              />
            </div>
            <div className="text-xs text-center text-muted-foreground">
              {xp} / {proximaPeca.xpNecessario} XP
            </div>
          </div>
        )}
      </div>

      {/* Lista de peças conquistadas */}
      <div className="w-full space-y-2">
        <h3 className="text-sm font-semibold text-center">Armadura de Deus</h3>
        <div className="grid grid-cols-2 gap-2">
          {PECAS_ARMADURA.map((peca) => {
            const desbloqueada = pecasDesbloqueadas.some((p) => p.nome === peca.nome)
            return (
              <div
                key={peca.nome}
                className={`text-xs p-2 rounded border ${
                  desbloqueada
                    ? "bg-primary/10 border-primary text-foreground"
                    : "bg-muted border-muted-foreground/20 text-muted-foreground"
                }`}
              >
                <div className="font-medium">{peca.nome}</div>
                <div className="text-[10px] opacity-70">{peca.descricao}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
