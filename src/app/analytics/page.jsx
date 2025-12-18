"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function AnalyticsPage() {
  const [properties, setProperties] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        // 1️⃣ Check login
        const { data } = await supabase.auth.getUser();

        if (!data?.user) {
          window.location.href = "/login";
          return;
        }

        setUserId(data.user.id);

        // 2️⃣ Check integration + property status
        const statusRes = await fetch(
          `/api/google/status?userId=${data.user.id}`
        );
        const statusJson = await statusRes.json();

        if (statusJson.connected && statusJson.propertySelected) {
          // 🔥 Already setup → skip selection
          window.location.href = "/dashboard/analytics";
          return;
        }

        // 3️⃣ Fetch properties
        const res = await fetch(
          `/api/google/metrics?userId=${data.user.id}`
        );

        const json = await res.json();
        if (!res.ok) throw new Error(json.error);

        const props =
          json.accounts?.flatMap((account) =>
            account.propertySummaries?.map((p) => ({
              id: p.property.replace("properties/", ""),
              name: p.displayName,
              account: account.displayName,
            }))
          ) ?? [];

        setProperties(props);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  async function handleSelect(propertyId) {
    if (!userId) return;

    const res = await fetch("/api/google/select-property", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        propertyId,
      }),
    });

    if (!res.ok) {
      alert("Failed to save property");
      return;
    }

    // ✅ Go to metrics dashboard
    window.location.href = "/dashboard/analytics";
  }

  if (loading) return <p>Loading analytics properties...</p>;


  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-6 space-y-6 text-black max-w-3xl">
      <h1 className="text-2xl font-bold">
        Select your Google Analytics Property
      </h1>

      {properties.length === 0 && (
        <p>No Google Analytics properties found.</p>
      )}

      <ul className="space-y-3">
        {properties.map((prop) => (
          <li
            key={prop.id}
            className="border rounded-lg p-4 flex justify-between items-center"
          >
            <div>
              <p className="font-medium">{prop.name}</p>
              <p className="text-sm text-gray-500">{prop.account}</p>
              <p className="text-xs text-gray-400">
                Property ID: {prop.id}
              </p>
            </div>

            <button
              onClick={() => handleSelect(prop.id)}
              className="px-4 py-2 border rounded hover:bg-black hover:text-white transition"
            >
              Use
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
