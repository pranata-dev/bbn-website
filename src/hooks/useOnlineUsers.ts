"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export function useOnlineUsers() {
    const [onlineUserIds, setOnlineUserIds] = useState<string[]>([])

    useEffect(() => {
        const supabase = createClient()
        const channel = supabase.channel("room-online-users")

        channel.on("presence", { event: "sync" }, () => {
            const state = channel.presenceState()
            const ids: string[] = []

            for (const key of Object.keys(state)) {
                const presences = state[key] as unknown as { user_id: string }[]
                for (const presence of presences) {
                    if (presence.user_id && !ids.includes(presence.user_id)) {
                        ids.push(presence.user_id)
                    }
                }
            }

            setOnlineUserIds(ids)
        })

        channel.subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    return onlineUserIds
}
