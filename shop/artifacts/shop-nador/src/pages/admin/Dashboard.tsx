import { Link } from "wouter";
import { Package, ShoppingBag, TrendingUp, Clock, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguageContext } from "@/context/LanguageContext";
import { useGetStatsSummary, useGetRecentOrders } from "@workspace/api-client-react";
import AdminLayout from "@/components/AdminLayout";
import { Skeleton } from "@/components/ui/skeleton";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function AdminDashboard() {
  const { tr, language } = useLanguageContext();
  const { data: stats, isLoading: loadingStats } = useGetStatsSummary();
  const { data: recentOrders, isLoading: loadingOrders } = useGetRecentOrders({ limit: 5 });

  const statCards = stats ? [
    { label: tr("totalRevenue"), value: `${Number(stats.totalRevenue).toFixed(2)} ${tr("currency")}`, icon: TrendingUp, color: "text-green-500", bg: "bg-green-500/10" },
    { label: tr("totalOrders"), value: stats.totalOrders, icon: ShoppingBag, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: tr("totalProducts"), value: stats.totalProducts, icon: Package, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: tr("pendingOrders"), value: stats.pendingOrders, icon: Clock, color: "text-orange-500", bg: "bg-orange-500/10" },
  ] : [];

  const statusColors: Record<string, string> = {
    pending: "text-orange-500 bg-orange-500/10",
    confirmed: "text-blue-500 bg-blue-500/10",
    shipped: "text-purple-500 bg-purple-500/10",
    delivered: "text-green-500 bg-green-500/10",
    cancelled: "text-destructive bg-destructive/10",
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{tr("dashboard")}</h1>

        {/* Stats */}
        {loadingStats ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statCards.map((card, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                className="bg-card border border-card-border rounded-2xl p-4">
                <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center mb-3`}>
                  <card.icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <p className="text-2xl font-black">{card.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{card.label}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Low Stock Warning */}
        {stats && stats.lowStockProducts > 0 && (
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0" />
            <span className="text-sm font-medium">{stats.lowStockProducts} {tr("lowStock")}</span>
          </div>
        )}

        {/* Recent Orders */}
        <div className="bg-card border border-card-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">{tr("recentOrders")}</h2>
            <Link href={`${BASE}/admin/orders`} className="text-primary text-sm hover:underline">{tr("viewAll")}</Link>
          </div>
          {loadingOrders ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-xl" />)}
            </div>
          ) : !recentOrders || recentOrders.length === 0 ? (
            <p className="text-muted-foreground text-sm py-8 text-center">{tr("noOrders")}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground text-xs uppercase border-b border-border">
                    <th className="text-start py-2 px-3">{tr("orderNumber")}</th>
                    <th className="text-start py-2 px-3">{tr("customer")}</th>
                    <th className="text-start py-2 px-3">{tr("total")}</th>
                    <th className="text-start py-2 px-3">{tr("status")}</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(order => (
                    <tr key={order.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-3 font-mono font-medium">#{order.orderNumber}</td>
                      <td className="py-3 px-3">{order.customerName}</td>
                      <td className="py-3 px-3 font-semibold text-primary">{Number(order.total).toFixed(2)} {tr("currency")}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${statusColors[order.status] ?? ""}`}>
                          {tr(order.status as any)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
