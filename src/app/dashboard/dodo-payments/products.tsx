"use client"

import { useState, useEffect } from "react"
import { Package, DollarSign, Users, TrendingUp, Loader2 } from "lucide-react"

type Product = {
  id: string
  name: string
  description?: string
  price: number
  currency: string
  interval?: string
  active_subscriptions?: number
  total_revenue?: number
  created_at?: string
}

export function Products({ userId }: { userId: string }) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return;

    const fetchProducts = async () => {
      try {
        const response = await fetch(`/api/dodo-payments/revenue?userId=${userId}`)
        if (response.ok) {
          const data = await response.json()
          
          // If real products exist, use them. Otherwise, show a message.
          if (data.products && data.products.length > 0) {
            setProducts(data.products)
          } else {
            // No products found in API, show empty state
            setProducts([])
          }
        } else {
          console.error('Failed to fetch products:', response.status)
        }
      } catch (error) {
        console.error('Failed to fetch products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [userId])

  if (loading) {
    return (
      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="space-y-4">
          <div className="h-4 bg-muted rounded w-32 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="p-4 rounded-xl bg-muted/30">
                <div className="h-6 bg-muted rounded w-24 animate-pulse mb-3" />
                <div className="h-4 bg-muted rounded w-16 animate-pulse mb-2" />
                <div className="h-8 bg-muted rounded w-20 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-2xl border border-border p-6 animate-fade-up" style={{ animationDelay: "450ms" }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-heading font-semibold">Products</h3>
          <p className="text-sm text-muted-foreground mt-1">Your Dodo Payments products and pricing</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <Package className="w-3 h-3 text-emerald-600" />
          <span className="text-xs font-semibold text-emerald-600">{products.length} products</span>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-2xl">
          <div className="w-16 h-16 bg-linear-to-br from-emerald-500/10 to-teal-500/10 flex items-center justify-center mx-auto mb-4 rounded-2xl">
            <Package className="w-8 h-8 text-emerald-600" />
          </div>
          <h4 className="text-lg font-semibold mb-1">No products found</h4>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto">
            It seems you haven't created any products in your Dodo Payments account yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <div key={product.id} className="bg-card border border-border rounded-2xl p-5 flex flex-col justify-between hover:shadow-lg hover:shadow-black/5 transition-shadow">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-linear-to-br from-emerald-500/10 to-teal-500/10 flex items-center justify-center">
                    <Package className="w-6 h-6 text-emerald-600" />
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                    product.active_subscriptions && product.active_subscriptions > 0 
                      ? "bg-emerald-500/10 text-emerald-600" 
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {product.active_subscriptions && product.active_subscriptions > 0 ? "Active" : "Inactive"}
                  </span>
                </div>
                
                <h4 className="font-heading font-semibold text-lg mb-1">{product.name}</h4>
                {product.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2 h-10">{product.description}</p>
                )}
              </div>
              
              <div className="space-y-3 pt-4 border-t border-border">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-muted-foreground">Price</span>
                  <span className="font-bold text-2xl font-heading">
                    ${(product.price / 100).toFixed(2)}
                    {product.interval && <span className="text-sm font-normal text-muted-foreground">/{product.interval}</span>}
                  </span>
                </div>
                
                {product.active_subscriptions !== undefined && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Active Subs
                    </span>
                    <span className="font-medium">{product.active_subscriptions}</span>
                  </div>
                )}
                
                {product.total_revenue !== undefined && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Total Revenue
                    </span>
                    <span className="font-medium">
                      ${product.total_revenue.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
