"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const DATE_PRESETS = [
  { label: "7D", value: "7daysAgo" },
  { label: "14D", value: "14daysAgo" },
  { label: "30D", value: "30daysAgo" },
  { label: "90D", value: "90daysAgo" },
];

export default function AnalyticsDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [range, setRange] = useState("7daysAgo");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);

      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        setError("User not logged in");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `/api/google/analytics?userId=${data.user.id}&startDate=${range}`
        );

        const json = await res.json();
        if (!res.ok) throw new Error(json.error);

        setMetrics(json.metrics);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [range]);

  if (loading) return <p>Loading analytics…</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-6 space-y-6 text-black">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Analytics Overview</h1>

        <div className="flex gap-2">
          {DATE_PRESETS.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={`px-3 py-1 border rounded ${
                range === r.value ? "bg-black text-white" : ""
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Metric title="Active Users" value={metrics.activeUsers} />
        <Metric title="New Users" value={metrics.newUsers} />
        <Metric title="Sessions" value={metrics.sessions} />
        <Metric title="Page Views" value={metrics.pageViews} />
        <Metric title="Engagement Rate" value={metrics.engagementRate} />
        <Metric
          title="Avg Session Duration"
          value={metrics.avgSessionDuration}
        />
      </div>
    </div>
  );
}

function Metric({ title, value }) {
  return (
    <div className="border rounded-xl p-4">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}
