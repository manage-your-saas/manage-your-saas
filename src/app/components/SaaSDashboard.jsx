import React from "react";

export default function SaaSDashboard({ data }) {
  // Example "data" props structure:
  // {
  //   mrr: 1000,
  //   arr: 12000,
  //   activeCustomers: 23,
  //   nextBilling: "2026-01-07T14:15:05.000Z",
  //   subscriptions: [ ... ]
  // }

  return (
    <div className="text-black min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">SaaS Analytics Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="MRR" value={`$${data.mrr}`} />
        <Card title="ARR" value={`$${data.arr}`} />
        <Card title="Active Customers" value={data.activeCustomers} />
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-3">Upcoming Billing</h2>
        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-gray-700">Next billing date:</p>
          <p className="text-lg font-semibold">
            {new Date(data.nextBilling).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-3">Subscriptions</h2>
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-3">Customer</th>
                <th className="p-3">Email</th>
                <th className="p-3">Plan</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Interval</th>
                <th className="p-3">Next Billing</th>
              </tr>
            </thead>
            <tbody>
              {data.subscriptions.map((sub) => (
                <tr key={sub.subscription_id} className="border-b">
                  <td className="p-3">{sub.customer_id}</td>
                  <td className="p-3">{sub.email}</td>
                  <td className="p-3">{sub.product}</td>
                  <td className="p-3">${sub.unit_amount / 100}</td>
                  <td className="p-3">{sub.interval}</td>
                  <td className="p-3">
                    {new Date(sub.current_period_end).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h3 className="text-lg font-medium text-gray-700">{title}</h3>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  );
}
