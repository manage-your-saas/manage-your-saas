"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function SearchConsoleSites() {
  const [sites, setSites] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getUser();

      if (!data?.user) {
        window.location.href = "/login";
        return;
      }

      setUserId(data.user.id);

      try {
        const res = await fetch(
          `/api/search-console/sites?userId=${data.user.id}`
        );

        const json = await res.json();
        if (!res.ok) throw new Error(json.error);

        setSites(json.sites);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  async function handleSelect(siteUrl) {
    const res = await fetch("/api/search-console/select-site", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, siteUrl }),
    });

    if (!res.ok) {
      alert("Failed to save site");
      return;
    }

    // 🚀 Go to SEO dashboard
    window.location.href = "/dashboard/seo";
  }

  if (loading) return <p>Loading Search Console sites…</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-6 space-y-4 text-black max-w-2xl">
      <h1 className="text-2xl font-bold">
        Select Search Console Site
      </h1>

      {sites.length === 0 && <p>No sites found.</p>}

      <ul className="space-y-3">
        {sites.map((site) => (
          <li
            key={site.siteUrl}
            className="border rounded-lg p-4 flex justify-between items-center"
          >
            <div>
              <p className="font-medium">{site.siteUrl}</p>
              <p className="text-xs text-gray-500">
                Permission: {site.permissionLevel}
              </p>
            </div>

            <button
              onClick={() => handleSelect(site.siteUrl)}
              className="px-4 py-2 border rounded hover:bg-black hover:text-white"
            >
              Use
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
