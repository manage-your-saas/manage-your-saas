import { NextResponse } from "next/server";
import axios from "axios";
import { getDodoApiKey } from "@/lib/dodoAuth";
import { getDateRange } from "@/lib/dateFilter";

// Currency conversion rates (you can update these or use a real API)
const CURRENCY_RATES = {
  INR: 0.0115, // 1 INR = 0.0115 USD (approximate)
  USD: 1.0,
  EUR: 1.08,
  GBP: 1.27,
  // Add more currencies as needed
};

function convertToUSD(amount, currency) {
  const rate = CURRENCY_RATES[currency] || 1.0;
  return amount * rate;
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const dateFilter = searchParams.get("dateFilter") || "This Month";

    const apiKey = await getDodoApiKey(userId);
    const dateRange = getDateRange(dateFilter);

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

    // Filter payments by date range
    const filteredPayments = payments.filter(p => {
      const paymentDate = new Date(p.created_at);
      return paymentDate >= dateRange.start && paymentDate <= dateRange.end;
    });

    // Filter subscriptions by date range
    const filteredSubscriptions = subscriptions.filter(sub => {
      const subDate = new Date(sub.created_at);
      return subDate >= dateRange.start && subDate <= dateRange.end;
    });

    // --- METRICS CALCULATION ---
    let mrr = 0;
    let newMrr = 0;
    let churnedMrr = 0;
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Calculate MRR from payments with subscription_id
    const currentMonthPayments = filteredPayments.filter(p => 
      p.status === 'succeeded' && 
      p.subscription_id && 
      p.subscription_id.startsWith('sub_') &&
      new Date(p.created_at) >= currentMonthStart
    );

    // Sum MRR from current month subscription payments
    currentMonthPayments.forEach(p => {
      const usdAmount = convertToUSD(p.total_amount, p.currency);
      mrr += usdAmount / 100; // Convert cents to dollars
    });

    // Calculate new MRR from new subscriptions this month
    const newSubscriptionsThisMonth = filteredSubscriptions.filter(sub => {
      const subDate = new Date(sub.created_at);
      return subDate >= currentMonthStart;
    });

    newSubscriptionsThisMonth.forEach(sub => {
      const usdPrice = convertToUSD(sub.recurring_pre_tax_amount, sub.currency) / 100;
      newMrr += usdPrice;
    });

    // Calculate churned MRR from cancelled subscriptions this month
    const churnedSubscriptionsThisMonth = filteredSubscriptions.filter(sub => {
      if (!sub.canceled_at) return false;
      const cancelDate = new Date(sub.canceled_at);
      return cancelDate >= currentMonthStart;
    });

    churnedSubscriptionsThisMonth.forEach(sub => {
      const usdPrice = convertToUSD(sub.recurring_pre_tax_amount, sub.currency) / 100;
      churnedMrr += usdPrice;
    });

    // --- CHART DATA CALCULATION ---
    const monthlyData = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const monthStr = date.toLocaleString('default', { month: 'short', year: '2-digit' });
      let monthMrr = 0;
      let monthNewMrr = 0;
      let monthChurnMrr = 0;

      // Calculate MRR from payments for this month
      const monthPayments = filteredPayments.filter(p => 
        p.status === 'succeeded' && 
        p.subscription_id && 
        p.subscription_id.startsWith('sub_') &&
        new Date(p.created_at) >= date &&
        new Date(p.created_at) <= monthEnd
      );

      monthPayments.forEach(p => {
        const usdAmount = convertToUSD(p.total_amount, p.currency);
        monthMrr += usdAmount / 100;
      });

      // Calculate new MRR from new subscriptions this month
      const monthNewSubs = filteredSubscriptions.filter(sub => {
        const subDate = new Date(sub.created_at);
        return subDate.getFullYear() === date.getFullYear() && subDate.getMonth() === date.getMonth();
      });

      monthNewSubs.forEach(sub => {
        const usdPrice = convertToUSD(sub.recurring_pre_tax_amount, sub.currency) / 100;
        monthNewMrr += usdPrice;
      });

      // Calculate churned MRR from cancelled subscriptions this month
      const monthChurnedSubs = filteredSubscriptions.filter(sub => {
        if (!sub.canceled_at) return false;
        const cancelDate = new Date(sub.canceled_at);
        return cancelDate.getFullYear() === date.getFullYear() && cancelDate.getMonth() === date.getMonth();
      });

      monthChurnedSubs.forEach(sub => {
        const usdPrice = convertToUSD(sub.recurring_pre_tax_amount, sub.currency) / 100;
        monthChurnMrr += usdPrice;
      });

      monthlyData.push({ month: monthStr, mrr: monthMrr, newMrr: monthNewMrr, churnMrr: monthChurnMrr });
    }

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

    filteredPayments.forEach(p => {
      const paymentDate = new Date(p.created_at);
      if (p.status === 'succeeded') {
        // Convert amount to USD first, then add to revenue
        const usdAmount = convertToUSD(p.total_amount, p.currency);
        totalRevenue += usdAmount;
        if (paymentDate < currentMonthStart && paymentDate >= lastMonthStart) {
          totalRevenueLastMonth += usdAmount;
        }
      } else if (p.status === 'refunded') {
        // Convert refund amount to USD
        const usdAmount = convertToUSD(p.total_amount, p.currency);
        totalRevenue -= usdAmount; // Assuming refunds are subtracted from total revenue
        if (paymentDate < currentMonthStart && paymentDate >= lastMonthStart) {
          totalRevenueLastMonth -= usdAmount;
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
    const recentTransactions = filteredPayments
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5)
      .map(p => {
        const usdAmount = convertToUSD(p.total_amount, p.currency);
        return {
          id: p.payment_id,
          customer: p.customer?.name || 'Unknown',
          email: p.customer?.email || '',
          amount: `$${(usdAmount / 100).toFixed(2)} USD`,
          originalAmount: `${(p.total_amount / 100).toFixed(2)} ${p.currency}`,
          type: p.subscription_id && p.subscription_id.startsWith('sub_') ? 'subscription' : 'payment',
          plan: p.subscription_id ? `Subscription` : 'One-time Payment',
          date: new Date(p.created_at).toLocaleDateString(),
          status: p.status,
          currency: p.currency || 'USD'
        };
      });

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
