import { getSubscriptions } from "./getSubscriptions";

export async function getAnalytics() {
  const subs = await getSubscriptions();

  const active = subs.filter((s) => s.status === "active");

  const mrr = active.reduce((sum, s) => {
    const monthly =
      s.interval === "month"
        ? s.unit_amount / 100
        : (s.unit_amount / 100) / 12;

    return sum + monthly;
  }, 0);

  return {
    mrr,
    arr: mrr * 12,
    activeCustomers: active.length,
    subscriptions: subs,
    nextBilling: active[0]?.current_period_end || null,
  };
}
