import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { PWARegister } from "./pwa-register"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Ministério Fazendo Discípulos",
  description: "Gente cuidando de gente - Uma jornada gamificada de crescimento espiritual",
  generator: "v0.app",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Fazendo Discípulos",
  },
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        sizes: "32x32",
      },
      {
        url: "/icon-192.png",
        sizes: "192x192",
      },
      {
        url: "/icon-512.png",
        sizes: "512x512",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="application-name" content="Fazendo Discípulos" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Fazendo Discípulos" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#7c2d12" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover"
        />
      </head>
      <body className={`font-sans antialiased`}>
        <PWARegister />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
