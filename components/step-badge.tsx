import {
  Sparkles,
  Heart,
  AlertTriangle,
  Skull,
  Cross,
  Church,
  HandHeart,
  MessageCircleHeart,
  UserCheck,
  Baby,
} from "lucide-react"

interface StepBadgeProps {
  stepNumber: number
  status: "completed" | "current" | "locked"
  size?: "sm" | "md" | "lg" | "xl"
}

export function StepBadge({ stepNumber, status, size = "md" }: StepBadgeProps) {
  const badges = {
    1: { icon: Sparkles, color: "text-blue-600", bgGradient: "from-blue-400 to-blue-600", name: "Criação" },
    2: { icon: Heart, color: "text-red-600", bgGradient: "from-red-400 to-red-600", name: "Amor Divino" },
    3: { icon: AlertTriangle, color: "text-orange-600", bgGradient: "from-orange-400 to-orange-600", name: "Pecado" },
    4: { icon: Skull, color: "text-gray-700", bgGradient: "from-gray-500 to-gray-700", name: "Consequência" },
    5: { icon: Cross, color: "text-purple-700", bgGradient: "from-purple-500 to-purple-700", name: "Provisão Divina" },
    6: { icon: Church, color: "text-indigo-700", bgGradient: "from-indigo-500 to-indigo-700", name: "Ressurreição" },
    7: { icon: HandHeart, color: "text-pink-700", bgGradient: "from-pink-500 to-pink-700", name: "Graça e Fé" },
    8: { icon: MessageCircleHeart, color: "text-teal-700", bgGradient: "from-teal-500 to-teal-700", name: "Compaixão" },
    9: { icon: UserCheck, color: "text-green-700", bgGradient: "from-green-500 to-green-700", name: "Confessar Jesus" },
    10: { icon: Baby, color: "text-amber-700", bgGradient: "from-amber-500 to-amber-700", name: "Novo Nascimento" },
  }

  const badge = badges[stepNumber as keyof typeof badges] || badges[1]
  const Icon = badge.icon

  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-14 h-14",
    lg: "w-20 h-20",
    xl: "w-32 h-32",
  }

  const iconSizes = {
    sm: "w-5 h-5",
    md: "w-7 h-7",
    lg: "w-10 h-10",
    xl: "w-16 h-16",
  }

  const getStatusStyles = () => {
    if (status === "locked") {
      return "opacity-40 grayscale"
    }
    if (status === "current") {
      return "ring-4 ring-primary ring-offset-4 ring-offset-background animate-pulse"
    }
    return "opacity-100 hover:scale-105"
  }

  return (
    <div
      className={`
        relative
        ${sizeClasses[size]} 
        ${getStatusStyles()}
        rounded-full 
        flex 
        items-center 
        justify-center 
        transition-all 
        duration-300
        cursor-pointer
        group
      `}
      title={badge.name}
    >
      {/* Outer glow */}
      <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${badge.bgGradient} opacity-20 blur-md`} />

      {/* Shadow layer */}
      <div className="absolute inset-0 rounded-full bg-black/10 translate-y-1" />

      {/* Main badge circle with gradient */}
      <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${badge.bgGradient} shadow-xl`} />

      {/* Highlight shine effect */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/40 via-transparent to-transparent" />

      {/* Border ring */}
      <div className="absolute inset-0 rounded-full border-4 border-white/30" />

      {/* Inner border */}
      <div className="absolute inset-2 rounded-full border-2 border-white/20" />

      {/* Icon container */}
      <div className="relative z-10 flex items-center justify-center">
        <Icon className={`${iconSizes[size]} text-white drop-shadow-lg`} strokeWidth={2.5} />
      </div>

      {/* Tooltip on hover */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        <div className="bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">{badge.name}</div>
      </div>
    </div>
  )
}
