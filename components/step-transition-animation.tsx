'use client'

import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useEffect, useState } from 'react'
import { Trophy, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getBadgeForStep } from '@/lib/gamification'

interface StepTransitionAnimationProps {
  isOpen: boolean
  onClose: () => void
  completedStep: number
  newStep: number
  earnedXP: number
  badgeEarned?: boolean
}

export function StepTransitionAnimation({
  isOpen,
  onClose,
  completedStep,
  newStep,
  earnedXP,
  badgeEarned = true
}: StepTransitionAnimationProps) {
  const [showConfetti, setShowConfetti] = useState(false)
  const badge = getBadgeForStep(completedStep)

  useEffect(() => {
    if (isOpen && !showConfetti) {
      setShowConfetti(true)
      
      // Confetti explosion
      const duration = 3000
      const animationEnd = Date.now() + duration
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 }

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min
      }

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now()

        if (timeLeft <= 0) {
          return clearInterval(interval)
        }

        const particleCount = 50 * (timeLeft / duration)
        
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        })
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        })
      }, 250)

      return () => clearInterval(interval)
    }
  }, [isOpen, showConfetti])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 100 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.5, opacity: 0, y: -100 }}
          transition={{ type: 'spring', damping: 15, stiffness: 100 }}
          className="relative max-w-lg w-full mx-4 bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-primary/50 rounded-2xl p-8 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Avatar subindo degraus */}
          <motion.div
            initial={{ y: 50 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            className="flex justify-center mb-6"
          >
            <div className="relative">
              {/* Degraus */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col-reverse gap-1">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * i }}
                    className="h-8 bg-primary/20 border-2 border-primary/30 rounded"
                    style={{ width: `${100 - i * 20}px` }}
                  />
                ))}
              </div>
              
              {/* Avatar */}
              <motion.div
                initial={{ y: 100 }}
                animate={{ y: -20 }}
                transition={{ delay: 0.5, type: 'spring', stiffness: 150 }}
                className="relative z-10 w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-5xl shadow-lg"
              >
                🎓
              </motion.div>
            </div>
          </motion.div>

          {/* Conteúdo */}
          <div className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8, type: 'spring' }}
            >
              <h2 className="text-3xl font-bold text-primary flex items-center justify-center gap-2">
                <Trophy className="w-8 h-8" />
                Parabéns!
              </h2>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="text-lg text-foreground"
            >
              Você completou o <span className="font-bold text-primary">Passo {completedStep}</span>!
            </motion.p>

            {/* XP Ganho */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 1.2, type: 'spring' }}
              className="inline-flex items-center gap-2 bg-primary/10 border-2 border-primary/30 rounded-full px-6 py-3"
            >
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-2xl font-bold text-primary">+{earnedXP} XP</span>
            </motion.div>

            {/* Badge Conquistada */}
            {badgeEarned && badge && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 1.4, type: 'spring', stiffness: 200 }}
                className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-accent/20 to-primary/20 border-2 border-accent/50 rounded-xl"
              >
                <div className="text-5xl">{badge.icon}</div>
                <Badge className={`${badge.color} text-white`}>{badge.rarity.toUpperCase()}</Badge>
                <h3 className="font-bold text-lg">{badge.name}</h3>
                <p className="text-sm text-muted-foreground">{badge.description}</p>
              </motion.div>
            )}

            {/* Próximo Passo */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.6 }}
              className="pt-4"
            >
              <p className="text-muted-foreground mb-4">
                Pronto para o <span className="font-bold text-primary">Passo {newStep}</span>?
              </p>
              <Button onClick={onClose} size="lg" className="w-full">
                Continuar Jornada
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
