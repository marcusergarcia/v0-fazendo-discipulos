// Service Worker para PWA - Fazendo Discípulos
const CACHE_NAME = "fazendo-discipulos-v1"
const RUNTIME_CACHE = "fazendo-discipulos-runtime"

// Recursos essenciais para cache inicial
const PRECACHE_URLS = ["/", "/dashboard", "/manifest.json", "/icon.svg", "/logo-fazendo-discipulos.png"]

// Instalação do Service Worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS)
    }),
  )
  self.skipWaiting()
})

// Ativação e limpeza de caches antigos
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
  self.clients.claim()
})

// Estratégia de cache: Network First com fallback para cache
self.addEventListener("fetch", (event) => {
  // Apenas cache para GET requests
  if (event.request.method !== "GET") return

  // Ignora requests para APIs externas e Supabase
  if (
    event.request.url.includes("/api/") ||
    event.request.url.includes("supabase") ||
    event.request.url.includes("vercel")
  ) {
    return
  }

  event.respondWith(
    caches.open(RUNTIME_CACHE).then((cache) => {
      return fetch(event.request)
        .then((response) => {
          // Cacheia a resposta se for bem-sucedida
          if (response.status === 200) {
            cache.put(event.request, response.clone())
          }
          return response
        })
        .catch(() => {
          // Fallback para cache se offline
          return caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || caches.match("/dashboard")
          })
        })
    }),
  )
})

// Sincronização em background (quando voltar online)
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-data") {
    event.waitUntil(syncUserData())
  }
})

async function syncUserData() {
  // Implementar lógica de sincronização quando necessário
  console.log("[SW] Sincronizando dados do usuário...")
}
