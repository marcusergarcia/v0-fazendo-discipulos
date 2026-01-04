"use client"

import { useEffect } from "react"

export function PWARegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("[PWA] Service Worker registrado com sucesso:", registration)

            // Verificar atualizações a cada 60 minutos
            setInterval(
              () => {
                registration.update()
              },
              60 * 60 * 1000,
            )
          })
          .catch((error) => {
            console.error("[PWA] Erro ao registrar Service Worker:", error)
          })
      })

      // Detectar quando uma nova versão estiver disponível
      let refreshing = false
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (refreshing) return
        refreshing = true
        window.location.reload()
      })
    }
  }, [])

  return null
}
