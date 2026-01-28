import { NextResponse } from "next/server";
import axios from "axios";
import { getDodoApiKey } from "@/lib/dodoAuth";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    const apiKey = await getDodoApiKey(userId);

    const [subsRes, customersRes, paymentsRes, productsRes] = await Promise.all([
      axios.get(`${process.env.DODO_PAYMENTS_BASE_URL}/subscriptions`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      }),
      axios.get(`${process.env.DODO_PAYMENTS_BASE_URL}/customers`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      }),
      axios.get(`${process.env.DODO_PAYMENTS_BASE_URL}/payments`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      }),
      axios.get(`${process.env.DODO_PAYMENTS_BASE_URL}/products`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      }),
    ]);

    const subscriptions = subsRes.data.items || [];
    const customers = customersRes.data.items || [];
    const payments = paymentsRes.data.items || [];
    const products = productsRes.data.items || [];

    // --- METRICS CALCULATION ---
    let mrr = 0;
    let newMrr = 0;
    let churnedMrr = 0;
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // --- CHART DATA CALCULATION ---
    const monthlyData = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = date.toLocaleString('default', { month: 'short', year: '2-digit' });
      let monthMrr = 0;
      let monthNewMrr = 0;
      let monthChurnMrr = 0;

      subscriptions.forEach(sub => {
        const subStartDate = new Date(sub.created_at);
        const subEndDate = sub.canceled_at ? new Date(sub.canceled_at) : null;

        // Check if subscription was active during this month
        if (subStartDate <= date && (!subEndDate || subEndDate > date)) {
          monthMrr += sub.price;
        }
        // Check for new MRR
        if (subStartDate.getFullYear() === date.getFullYear() && subStartDate.getMonth() === date.getMonth()) {
          monthNewMrr += sub.price;
        }
        // Check for churned MRR
        if (subEndDate && subEndDate.getFullYear() === date.getFullYear() && subEndDate.getMonth() === date.getMonth()) {
          monthChurnMrr += sub.price;
        }
      });

      monthlyData.push({ month: monthStr, mrr: monthMrr, newMrr: monthNewMrr, churnMrr: monthChurnMrr });
    }

    // Calculate current total MRR, new MRR, and churned MRR from the most recent month's data
    const latestMonthData = monthlyData[monthlyData.length - 1];
    mrr = latestMonthData.mrr;
    newMrr = latestMonthData.newMrr;
    churnedMrr = latestMonthData.churnMrr;

    const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;
    const arpu = activeSubscriptions > 0 ? (mrr / activeSubscriptions).toFixed(2) : 0;

    // --- CUSTOMER METRICS ---
    const totalCustomers = customers.length;
    let newThisMonth = 0;
    customers.forEach(cust => {
      const custDate = new Date(cust.created_at);
      if (custDate >= currentMonthStart) {
        newThisMonth++;
      }
    });

    const churned = Math.round(churnedMrr / (arpu > 0 ? arpu : 1)); // Estimate churned customers
    const netNew = newThisMonth - churned;

    // --- PREVIOUS MONTH METRICS ---
    let newLastMonth = 0;
    let churnedLastMonth = 0;
    customers.forEach(cust => {
      const custDate = new Date(cust.created_at);
      if (custDate >= lastMonthStart && custDate <= lastMonthEnd) {
        newLastMonth++;
      }
    });
    subscriptions.forEach(sub => {
      if (sub.status === 'canceled') {
        const cancelDate = new Date(sub.canceled_at);
        if (cancelDate >= lastMonthStart && cancelDate <= lastMonthEnd) {
          churnedLastMonth++;
        }
      }
    });
    const netNewLastMonth = newLastMonth - churnedLastMonth;
    const totalCustomersLastMonth = customers.filter(c => new Date(c.created_at) < currentMonthStart).length;

    // --- REVENUE METRICS ---
    let totalRevenue = 0;
    let netRevenue = 0;
    let totalRevenueLastMonth = 0;
    let netRevenueLastMonth = 0;

    payments.forEach(p => {
      const paymentDate = new Date(p.created_at);
      if (p.status === 'succeeded') {
        totalRevenue += p.amount;
        if (paymentDate < currentMonthStart && paymentDate >= lastMonthStart) {
          totalRevenueLastMonth += p.amount;
        }
      } else if (p.status === 'refunded') {
        totalRevenue -= p.amount; // Assuming refunds are subtracted from total revenue
        if (paymentDate < currentMonthStart && paymentDate >= lastMonthStart) {
          totalRevenueLastMonth -= p.amount;
        }
      }
    });
    netRevenue = totalRevenue; // Simplified for now
    netRevenueLastMonth = totalRevenueLastMonth;

    const totalSubscriptions = subscriptions.length;
    const totalSubscriptionsLastMonth = subscriptions.filter(s => new Date(s.created_at) < currentMonthStart).length;

    // --- SUBSCRIPTION HEALTH --- 
    const subscriptionHealth = subscriptions.reduce((acc, sub) => {
      acc[sub.status] = (acc[sub.status] || 0) + 1;
      return acc;
    }, {});

    const healthStats = Object.keys(subscriptionHealth).map(key => ({
      status: key,
      count: subscriptionHealth[key]
    }));

    // --- RECENT TRANSACTIONS ---
    const recentTransactions = payments
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5)
      .map(p => ({
        id: p.id,
        customer: p.customer_name,
        email: p.customer_email,
        amount: `$${(p.amount / 100).toFixed(2)}`,
        type: p.type,
        plan: p.metadata.plan_name || 'N/A',
        date: new Date(p.created_at).toLocaleDateString(),
        status: p.status,
      }));

    return NextResponse.json({
      success: true,
      metrics: {
        mrr,
        newMrr,
        churnedMrr,
        arr: mrr * 12,
        activeSubscriptions,
        arpu,
        totalRevenue: totalRevenue / 100,
        netRevenue: netRevenue / 100,
        totalSubscriptions,
        totalCustomers,
        newThisMonth,
        churned,
        netNew,
      },
      previousMetrics: {
        totalRevenue: totalRevenueLastMonth / 100,
        netRevenue: netRevenueLastMonth / 100,
        totalSubscriptions: totalSubscriptionsLastMonth,
        totalCustomers: totalCustomersLastMonth,
        newThisMonth: newLastMonth,
        churned: churnedLastMonth,
        netNew: netNewLastMonth,
      },
      monthlyData,
      recentTransactions,
      products,
      atRiskCustomers: subscriptions
        .filter(s => s.status === 'canceled' && new Date(s.canceled_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
        .map(s => ({
          name: s.customer_name,
          mrr: `$${s.price}`,
          lastActive: new Date(s.canceled_at).toLocaleDateString(),
          risk: 'high',
        })),
      subscriptionHealth: healthStats,
    });

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
