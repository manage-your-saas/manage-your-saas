"use client"

import { ArrowUpRight, ArrowDownLeft, CreditCard, RefreshCw } from "lucide-react"

interface Invoice {
  id: string;
  customer_name: string;
  customer_email: string;
  amount_paid: number;
  lines: { data: { plan?: { nickname: string } }[] };
  created: number;
  status: 'paid' | 'open' | 'uncollectible' | 'void' | 'draft';
  hosted_invoice_url?: string;
}

interface RecentTransactionsProps {
  invoices?: Invoice[];
}

const statusColors: Record<string, string> = {
  paid: "bg-emerald-500/10 text-emerald-600",
  open: "bg-amber-500/10 text-amber-600",
  uncollectible: "bg-red-500/10 text-red-500",
}

const typeIcons: Record<string, typeof ArrowUpRight> = {
  payment: ArrowUpRight,
  refund: ArrowDownLeft,
  renewal: RefreshCw,
}

function formatTimeAgo(timestamp: number) {
  const now = new Date();
  const past = new Date(timestamp * 1000);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
}

export function RecentTransactions({ invoices = [] }: RecentTransactionsProps) {
  return (
    <div className="bg-card rounded-2xl border border-border p-6 animate-fade-up" style={{ animationDelay: "350ms" }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-heading font-semibold">Recent Transactions</h3>
          <p className="text-sm text-muted-foreground mt-1">Latest payment activity</p>
        </div>
        <button className="text-sm text-violet-600 hover:underline flex items-center gap-1">
          View all <ArrowUpRight className="w-3 h-3" />
        </button>
      </div>

      <div className="space-y-3">
        {invoices.slice(0, 5).map((invoice) => {
          const TypeIcon = typeIcons['payment'] || CreditCard
          const isRefund = invoice.amount_paid < 0

          return (
            <a href={invoice.hosted_invoice_url || '#'} target="_blank" rel="noopener noreferrer" key={invoice.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  isRefund ? "bg-red-500/10" : "bg-emerald-500/10"
                }`}
              >
                <TypeIcon className={`w-5 h-5 ${isRefund ? "text-red-500" : "text-emerald-600"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate">{invoice.customer_name || invoice.customer_email}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[invoice.status]}`}>{invoice.status}</span>
                </div>
                <p className="text-xs text-muted-foreground truncate">{invoice.lines.data[0]?.plan?.nickname || 'One-time'}</p>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${isRefund ? "text-red-500" : "text-emerald-600"}`}>{`${isRefund ? '-' : ''}$${(Math.abs(invoice.amount_paid) / 100).toFixed(2)}`}</p>
                <p className="text-xs text-muted-foreground">{formatTimeAgo(invoice.created)}</p>
              </div>
            </a>
          )
        })} 
      </div>
    </div>
  )
}
