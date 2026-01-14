"use client"

import { useEffect } from "react"

export function ConfettiCelebration() {
  useEffect(() => {
    const duration = 3000
    const animationEnd = Date.now() + duration
    const colors = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"]

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min
    }

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        clearInterval(interval)
        return
      }

      const particleCount = 3

      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement("div")
        particle.className = "confetti-particle"
        particle.style.cssText = `
          position: fixed;
          width: ${randomInRange(8, 12)}px;
          height: ${randomInRange(8, 12)}px;
          background-color: ${colors[Math.floor(Math.random() * colors.length)]};
          left: ${randomInRange(0, window.innerWidth)}px;
          top: -20px;
          border-radius: ${Math.random() > 0.5 ? "50%" : "0"};
          opacity: ${randomInRange(0.6, 1)};
          animation: confetti-fall ${randomInRange(2, 4)}s linear forwards;
          pointer-events: none;
          z-index: 9999;
          transform: rotate(${randomInRange(0, 360)}deg);
        `

        document.body.appendChild(particle)

        setTimeout(() => {
          particle.remove()
        }, 4000)
      }
    }, 50)

    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <style jsx global>{`
        @keyframes confetti-fall {
          to {
            transform: translateY(${window.innerHeight + 50}px) rotate(${Math.random() * 720}deg);
            opacity: 0;
          }
        }
      `}</style>
    </>
  )
}
