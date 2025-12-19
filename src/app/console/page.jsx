"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function SearchConsoleSites() {
  const [sites, setSites] = useState([]); // ✅ array
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

        // Ensure we have an array of site URLs
          
        setSites(json);

        // console.log(sites);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  async function handleSelect(siteUrl) {
    try {
      // Ensure we only pass a single site URL
      const selectedSite = Array.isArray(siteUrl) ? siteUrl[0] : siteUrl;
      
      const res = await fetch("/api/search-console/select-site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId, 
          siteUrl: selectedSite // Pass only the selected site URL
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to save site');
      }

      window.location.href = "/dashboard/seo";
    } catch (err) {
      console.error('Error selecting site:', err);
      alert(`Failed to save site: ${err.message}`);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading Search Console sites…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500 text-lg">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4 text-black max-w-2xl mx-auto min-h-screen flex flex-col justify-center">
      <h1 className="text-2xl font-bold mb-6">
        Select Search Console Site
      </h1>

      {sites.length === 0 ? (
        <p className="text-gray-600">
          No sites found. Please make sure your Google account has access.
        </p>
      ) : (
        <ul className="space-y-3">
          {sites.map((site, i) => (
            <li
              key={i+1}
              className="border rounded-lg p-4 flex justify-between items-center"
            >
              <p className="font-medium">{site.siteUrl}</p>

              <button
                onClick={() => handleSelect(site.siteUrl)}
                className="px-4 py-2 border rounded hover:bg-black hover:text-white"
              >
                Use
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
