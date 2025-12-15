// src/app/analytics/page.jsx

export default async function AnalyticsPage() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const res = await fetch(`${baseUrl}/api/google/metrics`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch analytics data");
  }

  const data = await res.json();
  console.log(data)

  return (
    <div style={{ fontFamily: "var(--font-story-script)" }} className="tracking-wider p-10 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900">
          Google Analytics Overview
        </h1>
        <p className="text-gray-600 mt-1">
          Essential analytics for SaaS founders: Clean & simple.
        </p>
      </div>

      {/* Metric Cards */}
      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Key Metrics (Last 7 Days)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {/* Traffic */}
          <MetricCard 
            label="Users" 
            value={data.users || 0} 
            desc="Total unique visitors" 
          />

          {/* Sessions */}
          <MetricCard 
            label="Sessions" 
            value={data.sessions || 0} 
            desc="Total website sessions" 
          />

          {/* Pageviews */}
          <MetricCard 
            label="Pageviews" 
            value={data.pageviews || 0} 
            desc="Total pages viewed" 
          />

          {/* Engagement */}
          <MetricCard 
            label="Avg. Engagement" 
            value={data.avgEngagement || "0s"} 
            desc="Average engagement time" 
          />

          {/* Returning Users */}
          <MetricCard 
            label="Returning Users" 
            value={data.returningUsers || 0} 
            desc="Users who came back again" 
          />
        </div>
      </section>

      {/* Traffic sources */}
      <section className="mt-14">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Top Traffic Sources
        </h2>

        <div className="bg-white rounded-xl shadow p-6">
          {data.sources?.length > 0 ? (
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-500 border-b">
                  <th className="py-2">Source</th>
                  <th className="py-2">Users</th>
                  <th className="py-2">Sessions</th>
                </tr>
              </thead>
              <tbody>
                {data.sources.map((src, i) => (
                  <tr key={i} className="border-b last:border-b-0">
                    <td className="py-2 font-medium">{src.source}</td>
                    <td className="py-2">{src.users}</td>
                    <td className="py-2">{src.sessions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500">No traffic source data available.</p>
          )}
        </div>
      </section>

      {/* Top pages */}
      <section className="mt-14">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Top Pages
        </h2>

        <div className="bg-white rounded-xl shadow p-6">
          {data.pages?.length > 0 ? (
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-500 border-b">
                  <th className="py-2">Page</th>
                  <th className="py-2">Views</th>
                  <th className="py-2">Avg. Engagement</th>
                </tr>
              </thead>
              <tbody>
                {data.pages.map((p, i) => (
                  <tr key={i} className="border-b last:border-b-0">
                    <td className="py-2 font-medium">{p.page}</td>
                    <td className="py-2">{p.views}</td>
                    <td className="py-2">{p.engagement}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500">No page performance data available.</p>
          )}
        </div>
      </section>
    </div>
  );
}

/* ========== Reusable Metric Card Component ========== */
function MetricCard({ label, value, desc }) {
  return (
    <div className="bg-white rounded-xl shadow p-6 hover:shadow-md transition">
      <p className="text-gray-500 text-sm">{label}</p>
      <h3 className="text-3xl font-semibold mt-1">{value}</h3>
      <p className="text-gray-400 text-xs mt-1">{desc}</p>
    </div>
  );
}
