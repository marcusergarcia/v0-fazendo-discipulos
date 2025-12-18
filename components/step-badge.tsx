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
  size?: "sm" | "md" | "lg"
}

export function StepBadge({ stepNumber, status, size = "md" }: StepBadgeProps) {
  const badges = {
    1: { icon: Sparkles, color: "text-blue-500", bgColor: "bg-blue-100", name: "Criação" },
    2: { icon: Heart, color: "text-red-500", bgColor: "bg-red-100", name: "Amor Divino" },
    3: { icon: AlertTriangle, color: "text-orange-500", bgColor: "bg-orange-100", name: "Pecado" },
    4: { icon: Skull, color: "text-gray-600", bgColor: "bg-gray-100", name: "Consequência" },
    5: { icon: Cross, color: "text-purple-600", bgColor: "bg-purple-100", name: "Provisão Divina" },
    6: { icon: Church, color: "text-indigo-600", bgColor: "bg-indigo-100", name: "Ressurreição" },
    7: { icon: HandHeart, color: "text-pink-600", bgColor: "bg-pink-100", name: "Graça" },
    8: { icon: MessageCircleHeart, color: "text-teal-600", bgColor: "bg-teal-100", name: "Arrependimento" },
    9: { icon: UserCheck, color: "text-green-600", bgColor: "bg-green-100", name: "Confissão" },
    10: { icon: Baby, color: "text-amber-600", bgColor: "bg-amber-100", name: "Novo Nascimento" },
  }

  const badge = badges[stepNumber as keyof typeof badges] || badges[1]
  const Icon = badge.icon

  const sizeClasses = {
    sm: "w-8 h-8 p-1.5",
    md: "w-12 h-12 p-2",
    lg: "w-16 h-16 p-3",
  }

  const iconSizes = {
    sm: "w-5 h-5",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  }

  const getOpacity = () => {
    if (status === "locked") return "opacity-30"
    if (status === "current") return "opacity-100 ring-2 ring-primary ring-offset-2"
    return "opacity-100"
  }

  return (
    <div
      className={`
        ${sizeClasses[size]} 
        ${badge.bgColor} 
        ${getOpacity()}
        rounded-full 
        flex 
        items-center 
        justify-center 
        transition-all 
        duration-300
        border-2 border-white
        shadow-md
      `}
      title={badge.name}
    >
      <Icon className={`${iconSizes[size]} ${badge.color}`} />
    </div>
  )
}
