"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { UsersRound } from 'lucide-react'
import Link from "next/link"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export function DiscipuladorButton({ userId, initialCount }: { userId: string; initialCount: number }) {
  const [notificationCount, setNotificationCount] = useState(initialCount)
  const supabase = createClient()

  useEffect(() => {
    async function fetchCount() {
      const { count } = await supabase
        .from("notificacoes")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
      
      setNotificationCount(count || 0)
    }
    
    fetchCount()

    const channel = supabase
      .channel("notificacoes-count")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notificacoes",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchCount()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  return (
    <Link href="/discipulador">
      <Button variant="ghost" size="sm" className="gap-2 relative">
        <UsersRound className="w-4 h-4" />
        <span className="hidden sm:inline">Discipulador</span>
        {notificationCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
            {notificationCount > 9 ? "9+" : notificationCount}
          </Badge>
        )}
      </Button>
    </Link>
  )
}
