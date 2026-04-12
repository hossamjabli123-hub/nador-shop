import { useState } from "react";
import { useLanguageContext } from "@/context/LanguageContext";
import { useListOrders, useUpdateOrderStatus, getListOrdersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/AdminLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STATUS_OPTIONS = ["pending", "confirmed", "shipped", "delivered", "cancelled"] as const;

const statusColors: Record<string, string> = {
  pending: "text-orange-500 bg-orange-500/10",
  confirmed: "text-blue-500 bg-blue-500/10",
  shipped: "text-purple-500 bg-purple-500/10",
  delivered: "text-green-500 bg-green-500/10",
  cancelled: "text-destructive bg-destructive/10",
};

export default function AdminOrders() {
  const { tr } = useLanguageContext();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const { data, isLoading } = useListOrders({ status: statusFilter as any, limit: 50 });
  const updateStatus = useUpdateOrderStatus();

  const handleStatusChange = async (orderId: number, status: string) => {
    await updateStatus.mutateAsync({ params: { id: orderId }, data: { status: status as any } });
    await queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{tr("manageOrders")}</h1>
          <div className="w-44">
            <Select value={statusFilter ?? "all"} onValueChange={v => setStatusFilter(v === "all" ? undefined : v)}>
              <SelectTrigger>
                <SelectValue placeholder={tr("status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{tr("allProducts")}</SelectItem>
                {STATUS_OPTIONS.map(s => (
                  <SelectItem key={s} value={s}>{tr(s as any)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="bg-card border border-card-border rounded-2xl overflow-hidden">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-xl" />)}
            </div>
          ) : !data?.orders || data.orders.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">{tr("noOrders")}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr className="text-muted-foreground text-xs uppercase">
                    <th className="text-start py-3 px-4">#</th>
                    <th className="text-start py-3 px-4">{tr("customer")}</th>
                    <th className="text-start py-3 px-4">{tr("phone")}</th>
                    <th className="text-start py-3 px-4">{tr("total")}</th>
                    <th className="text-start py-3 px-4">{tr("orderDate")}</th>
                    <th className="text-start py-3 px-4">{tr("status")}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.orders.map(order => (
                    <tr key={order.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-xs">#{order.orderNumber}</td>
                      <td className="py-3 px-4 font-medium">{order.customerName}</td>
                      <td className="py-3 px-4 text-muted-foreground">{order.customerPhone}</td>
                      <td className="py-3 px-4 font-bold text-primary">{Number(order.total).toFixed(2)} {tr("currency")}</td>
                      <td className="py-3 px-4 text-muted-foreground text-xs">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        <Select value={order.status} onValueChange={v => handleStatusChange(order.id, v)}>
                          <SelectTrigger className={`h-8 text-xs w-36 font-semibold ${statusColors[order.status] ?? ""}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map(s => (
                              <SelectItem key={s} value={s}>{tr(s as any)}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
