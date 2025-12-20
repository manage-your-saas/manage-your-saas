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
  const [slec,setSlec] = useState("")


  const test = [{
  "connected": true,
  "siteUrl": {
    "available_sites": [
      "sc-domain:interfreight.in",
      "https://interfreight.in/"
    ]
  }
}]

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

        setSites(json.siteUrl.available_sites);

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
      
      
      const res = await fetch( "api/search-console/select-site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId: userId, 
          siteUrl: siteUrl // Pass only the selected site URL
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to save site');
      }

      setSlec(siteUrl)

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
  <li key={i} className="border rounded-lg p-4 flex justify-between">
    <p>{site}</p>
    <button onClick={() => handleSelect(site)}>Use</button>
  </li>
))}



        </ul>
      )}
<h2>Selected Site: {slec}</h2>
<h2>{userId}</h2>

    </div>
  );
}
