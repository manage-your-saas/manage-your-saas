"use client"

import { useEffect, useState } from 'react';

export function LiveUserIntent() {
    const [alerts, setAlerts] = useState([]);
    const [connectionStatus, setConnectionStatus] = useState('connecting');

    useEffect(() => {
        const SERVICE_URL = process.env.NEXT_PUBLIC_INTENT_SERVICE_URL || 'http://localhost:3002';
        const eventSource = new EventSource(`${SERVICE_URL}/stream`);

        eventSource.onopen = () => {
            setConnectionStatus('connected');
        };

        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'INTENT_ALERT') {
                    setAlerts(prev => [data.payload, ...prev].slice(0, 5)); // Keep last 5
                }
            } catch (e) {
                console.error('Failed to parse intent alert', e);
            }
        };

        eventSource.onerror = () => {
            setConnectionStatus('error');
            eventSource.close();
        };

        return () => {
            eventSource.close();
        };
    }, []);

    return (
        <div className="bg-card rounded-xl border border-border p-6 h-full">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${connectionStatus === 'connected' ? 'bg-red-400' : 'bg-gray-400'}`}></span>
                        <span className={`relative inline-flex rounded-full h-3 w-3 ${connectionStatus === 'connected' ? 'bg-red-500' : 'bg-gray-500'}`}></span>
                    </span>
                    Live Intent Shift
                </h3>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                    {connectionStatus === 'connected' ? 'LIVE' : 'OFFLINE'}
                </span>
            </div>

            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {alerts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                        <p>Scanning user behavior...</p>
                        <p className="text-xs mt-1 opacity-70">No high intent shifts detected yet.</p>
                    </div>
                ) : (
                    alerts.map((alert, idx) => (
                        <div key={idx} className="p-3 bg-accent/50 border border-accent rounded-lg">
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-medium text-sm text-foreground">
                                    {alert.userId && alert.userId !== 'Anonymous' ? `User: ${alert.userId}` : `Anon: ${alert.sessionId}`}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {new Date(alert.timestamp).toLocaleTimeString()}
                                </span>
                            </div>
                            <p className="text-sm text-amber-500 font-medium mb-1">
                                High Purchase Intent Detected
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Score: {alert.score} • {alert.reason}
                            </p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
