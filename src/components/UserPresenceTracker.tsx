"use client"

import { useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export default function UserPresenceTracker() {
    useEffect(() => {
        const supabase = createClient()
        let channel: ReturnType<typeof supabase.channel> | null = null

        const trackPresence = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            channel = supabase.channel("room-online-users")

            channel.subscribe(async (status) => {
                if (status === "SUBSCRIBED") {
                    await channel!.track({
                        user_id: user.id,
                        online_at: new Date().toISOString(),
                    })
                }
            })
        }

        trackPresence()

        return () => {
            if (channel) {
                supabase.removeChannel(channel)
            }
        }
    }, [])

    return null
}
