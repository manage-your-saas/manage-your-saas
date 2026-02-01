"use client";

import { useEffect, useState } from "react";

type Alert = {
  sessionId: string;
  score: number;
  timestamp: string;
};

export function LiveUserIntent({ clientId }: { clientId: string }) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [status, setStatus] = useState<"scanning" | "live" | "error">("scanning");

  useEffect(() => {
    if (!clientId) return;

    const load = async () => {
      try {
        const res = await fetch(
          `/api/intent/alerts?clientId=${clientId}`
        );
        const data = await res.json();
        setAlerts(data);
        setStatus("live");
      } catch {
        setStatus("error");
      }
    };

    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, [clientId]);

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-lg">
        Live Purchase Intent
      </h3>

      {/* ERROR STATE */}
      {status === "error" && (
        <p className="text-sm text-muted-foreground">
          Unable to check visitor activity right now.
        </p>
      )}

      {/* NO VISITORS / NO INTENT */}
      {status === "live" && alerts.length === 0 && (
        <div className="text-sm text-muted-foreground">
          <p>No visitors on your website right now.</p>
          <p className="text-xs mt-1">
            We’ll notify you as soon as someone shows buying interest.
          </p>
        </div>
      )}

      {/* HIGH INTENT VISITORS */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((_, i) => (
            <div
              key={i}
              className="p-3 rounded-lg border bg-amber-500/10 border-amber-500/30"
            >
              <p className="font-medium text-amber-600">
                🔥 High-intent visitor on your website
              </p>
              <p className="text-xs text-muted-foreground">
                Likely to purchase • Active recently
              </p>
            </div>
          ))}
        </div>
      )}

      {/* SCANNING STATE (INITIAL LOAD) */}
      {status === "scanning" && (
        <p className="text-sm text-muted-foreground">
          Monitoring visitor activity…
        </p>
      )}
    </div>
  );
}
