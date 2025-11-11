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
    <div className="flex flex-col items-center space-y-6">
      <div className="relative">
        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary shadow-2xl ring-4 ring-primary/20">
          {fotoUrl ? (
            <img src={fotoUrl || "/placeholder.svg"} alt="Foto de perfil" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
              <Shield className="w-16 h-16 text-primary" />
            </div>
          )}
        </div>
        {/* Badge de XP sobreposto */}
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-accent text-primary-foreground px-5 py-1.5 rounded-full text-sm font-bold shadow-lg border-2 border-background">
          {xp} XP
        </div>
      </div>

      <div className="relative w-full max-w-xs">
        <div className="relative">
          {/* Corpo do guerreiro */}
          <svg viewBox="0 0 200 300" className="w-full h-auto drop-shadow-xl">
            <defs>
              {/* Máscara circular para a foto do perfil no rosto do guerreiro */}
              <clipPath id="face-clip">
                <circle cx="100" cy="60" r="28" />
              </clipPath>
            </defs>

            {/* Cabeça com foto do perfil */}
            <g>
              {/* Círculo base da cabeça */}
              <circle cx="100" cy="60" r="30" fill="oklch(0.95 0.02 40)" stroke="oklch(0.7 0.05 40)" strokeWidth="2" />

              {/* Foto do perfil dentro da cabeça */}
              {fotoUrl ? (
                <image
                  href={fotoUrl || "/placeholder.svg"}
                  x="72"
                  y="32"
                  width="56"
                  height="56"
                  clipPath="url(#face-clip)"
                  preserveAspectRatio="xMidYMid slice"
                />
              ) : (
                <circle cx="100" cy="60" r="28" fill="oklch(0.85 0.02 40)" />
              )}
            </g>

            {/* Pescoço */}
            <rect
              x="90"
              y="85"
              width="20"
              height="15"
              fill="oklch(0.85 0.02 40)"
              stroke="oklch(0.7 0.05 40)"
              strokeWidth="1"
            />

            {/* Corpo base (túnica simples) */}
            <path
              d="M 70 100 L 65 180 Q 65 185 70 185 L 130 185 Q 135 185 135 180 L 130 100 Z"
              fill="oklch(0.75 0.05 200)"
              stroke="oklch(0.6 0.05 200)"
              strokeWidth="2"
            />

            {/* Braços */}
            <ellipse
              cx="58"
              cy="130"
              rx="12"
              ry="35"
              fill="oklch(0.85 0.02 40)"
              stroke="oklch(0.7 0.05 40)"
              strokeWidth="1"
            />
            <ellipse
              cx="142"
              cy="130"
              rx="12"
              ry="35"
              fill="oklch(0.85 0.02 40)"
              stroke="oklch(0.7 0.05 40)"
              strokeWidth="1"
            />

            {/* Pernas */}
            <rect
              x="80"
              y="185"
              width="18"
              height="70"
              rx="8"
              fill="oklch(0.75 0.05 200)"
              stroke="oklch(0.6 0.05 200)"
              strokeWidth="2"
            />
            <rect
              x="102"
              y="185"
              width="18"
              height="70"
              rx="8"
              fill="oklch(0.75 0.05 200)"
              stroke="oklch(0.6 0.05 200)"
              strokeWidth="2"
            />

            {/* Sapatos */}
            <ellipse
              cx="89"
              cy="255"
              rx="12"
              ry="8"
              fill="oklch(0.4 0.05 40)"
              stroke="oklch(0.3 0.05 40)"
              strokeWidth="1"
            />
            <ellipse
              cx="111"
              cy="255"
              rx="12"
              ry="8"
              fill="oklch(0.4 0.05 40)"
              stroke="oklch(0.3 0.05 40)"
              strokeWidth="1"
            />

            {pecasDesbloqueadas.some((p) => p.nome === "Cinturão da Verdade") && (
              <g className="animate-fade-in">
                <rect
                  x="65"
                  y="95"
                  width="70"
                  height="14"
                  rx="3"
                  fill="oklch(0.5 0.15 40)"
                  stroke="oklch(0.35 0.15 40)"
                  strokeWidth="2"
                />
                <rect x="95" y="98" width="10" height="8" rx="2" fill="oklch(0.7 0.2 50)" stroke="oklch(0.5 0.2 50)" />
                <circle cx="75" cy="102" r="2" fill="oklch(0.7 0.2 50)" />
                <circle cx="125" cy="102" r="2" fill="oklch(0.7 0.2 50)" />
              </g>
            )}

            {pecasDesbloqueadas.some((p) => p.nome === "Couraça da Justiça") && (
              <g className="animate-fade-in">
                <path
                  d="M 70 110 L 68 170 Q 68 175 73 175 L 127 175 Q 132 175 132 170 L 130 110 Z"
                  fill="oklch(0.55 0.1 240)"
                  stroke="oklch(0.4 0.1 240)"
                  strokeWidth="2.5"
                />
                {/* Detalhes da couraça */}
                <line x1="100" y1="110" x2="100" y2="175" stroke="oklch(0.45 0.1 240)" strokeWidth="2" />
                <line x1="80" y1="130" x2="120" y2="130" stroke="oklch(0.45 0.1 240)" strokeWidth="1.5" />
                <line x1="80" y1="150" x2="120" y2="150" stroke="oklch(0.45 0.1 240)" strokeWidth="1.5" />
                <circle cx="100" cy="120" r="4" fill="oklch(0.7 0.2 50)" stroke="oklch(0.5 0.2 50)" />
              </g>
            )}

            {pecasDesbloqueadas.some((p) => p.nome === "Calçado do Evangelho") && (
              <g className="animate-fade-in">
                <path
                  d="M 75 250 L 72 262 Q 72 265 76 265 L 94 265 Q 98 265 98 262 L 98 250 Z"
                  fill="oklch(0.35 0.1 30)"
                  stroke="oklch(0.25 0.1 30)"
                  strokeWidth="2"
                />
                <path
                  d="M 102 250 L 102 262 Q 102 265 106 265 L 124 265 Q 128 265 128 262 L 125 250 Z"
                  fill="oklch(0.35 0.1 30)"
                  stroke="oklch(0.25 0.1 30)"
                  strokeWidth="2"
                />
                {/* Cruz nos calçados */}
                <path
                  d="M 85 256 L 85 260 M 83 258 L 87 258"
                  stroke="oklch(0.7 0.2 50)"
                  strokeWidth="1.5"
                  fill="none"
                />
                <path
                  d="M 113 256 L 113 260 M 111 258 L 115 258"
                  stroke="oklch(0.7 0.2 50)"
                  strokeWidth="1.5"
                  fill="none"
                />
              </g>
            )}

            {pecasDesbloqueadas.some((p) => p.nome === "Escudo da Fé") && (
              <g className="animate-fade-in">
                <path
                  d="M 35 120 L 35 155 Q 35 160 40 162 L 52 168 Q 55 170 58 167 L 65 160 Q 68 157 68 152 L 68 120 Q 68 115 63 115 L 40 115 Q 35 115 35 120 Z"
                  fill="oklch(0.5 0.15 260)"
                  stroke="oklch(0.35 0.15 260)"
                  strokeWidth="2.5"
                />
                {/* Cruz no escudo */}
                <path
                  d="M 51.5 125 L 51.5 145 M 43 135 L 60 135"
                  stroke="oklch(0.8 0.2 50)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </g>
            )}

            {pecasDesbloqueadas.some((p) => p.nome === "Capacete da Salvação") && (
              <g className="animate-fade-in">
                <path
                  d="M 70 55 Q 70 35 100 35 Q 130 35 130 55 L 130 70 Q 130 75 125 75 L 75 75 Q 70 75 70 70 Z"
                  fill="oklch(0.55 0.1 240)"
                  stroke="oklch(0.4 0.1 240)"
                  strokeWidth="2.5"
                />
                {/* Crista do capacete */}
                <ellipse cx="100" cy="30" rx="10" ry="8" fill="oklch(0.65 0.2 10)" stroke="oklch(0.5 0.2 10)" />
                {/* Detalhes do capacete */}
                <path d="M 75 65 L 125 65" stroke="oklch(0.45 0.1 240)" strokeWidth="1.5" />
              </g>
            )}

            {pecasDesbloqueadas.some((p) => p.nome === "Espada do Espírito") && (
              <g className="animate-fade-in">
                {/* Punho */}
                <rect
                  x="145"
                  y="125"
                  width="8"
                  height="20"
                  rx="2"
                  fill="oklch(0.4 0.1 30)"
                  stroke="oklch(0.3 0.1 30)"
                  strokeWidth="1"
                />
                {/* Guarda */}
                <rect
                  x="137"
                  y="122"
                  width="24"
                  height="6"
                  rx="2"
                  fill="oklch(0.65 0.2 50)"
                  stroke="oklch(0.5 0.2 50)"
                  strokeWidth="1"
                />
                {/* Lâmina */}
                <path
                  d="M 147 122 L 149 85 L 151 122"
                  fill="oklch(0.85 0.02 240)"
                  stroke="oklch(0.7 0.05 240)"
                  strokeWidth="2"
                />
                {/* Brilho na lâmina */}
                <line
                  x1="148"
                  y1="120"
                  x2="148"
                  y2="90"
                  stroke="oklch(0.95 0.02 240)"
                  strokeWidth="0.5"
                  opacity="0.7"
                />
              </g>
            )}
          </svg>
        </div>

        {proximaPeca && (
          <div className="mt-6 space-y-3 px-2">
            <div className="text-center space-y-1">
              <div className="text-sm font-semibold text-foreground">Próxima peça: {proximaPeca.nome}</div>
              <div className="text-xs text-muted-foreground">{proximaPeca.descricao}</div>
            </div>
            <div className="relative h-3 bg-secondary rounded-full overflow-hidden shadow-inner">
              <div
                className="absolute h-full bg-gradient-to-r from-primary to-accent transition-all duration-700 ease-out"
                style={{ width: `${progressoAtual}%` }}
              />
            </div>
            <div className="text-xs text-center font-medium text-muted-foreground">
              {xp} / {proximaPeca.xpNecessario} XP ({Math.round(progressoAtual)}%)
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
