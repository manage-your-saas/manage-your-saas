"use client"

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export function IntentTracker() {
    const pathname = usePathname();
    const [userId, setUserId] = useState<string | null>(null);

    // Check for logged in user
    useEffect(() => {
        const checkUser = async () => {
            try {
                const { createClient } = await import('@supabase/supabase-js');
                const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
                const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

                if (supabaseUrl && supabaseKey) {
                    const supabase = createClient(supabaseUrl, supabaseKey);
                    const { data: { session } } = await supabase.auth.getSession();
                    if (session?.user) {
                        setUserId(session.user.id);
                    }
                }
            } catch (e) {
                // Ignore auth errors in tracker
            }
        };
        checkUser();
    }, []);

    useEffect(() => {
        // 1. Get or Create Session ID
        let sessionId = sessionStorage.getItem('mys_intent_sid');
        if (!sessionId) {
            sessionId = crypto.randomUUID();
            sessionStorage.setItem('mys_intent_sid', sessionId);
        }

        // 2. Track Page View
        const track = async () => {
            const SERVICE_URL = process.env.NEXT_PUBLIC_INTENT_SERVICE_URL || 'http://localhost:3002';

            try {
                await fetch(`${SERVICE_URL}/track`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        sessionId,
                        userId,
                        type: 'pageview',
                        path: pathname,
                        timestamp: Date.now()
                    })
                });
            } catch (err) {
                // Silently fail if service is down
            }
        };

        if (pathname) {
            track();
        }
    }, [pathname, userId]);

    return null; // Side-effect only component
}
