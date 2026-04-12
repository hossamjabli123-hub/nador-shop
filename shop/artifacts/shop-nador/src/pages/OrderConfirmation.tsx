import { useParams, Link } from "wouter";
import { CheckCircle2, Package } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguageContext } from "@/context/LanguageContext";
import { useGetOrder } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function OrderConfirmation() {
  const { id } = useParams<{ id: string }>();
  const { tr, language } = useLanguageContext();
  const { data: order, isLoading } = useGetOrder(Number(id));

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-24 max-w-lg">
        <Skeleton className="h-16 w-16 rounded-full mx-auto mb-4" />
        <Skeleton className="h-8 w-3/4 mx-auto mb-2" />
        <Skeleton className="h-4 w-1/2 mx-auto" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <p className="text-muted-foreground">{tr("error")}</p>
      </div>
    );
  }

  const getItemName = (item: { productNameAr: string; productNameEn: string }) => {
    return language === "ar" ? item.productNameAr : item.productNameEn;
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-2xl font-bold mb-2">{tr("orderConfirmed")}</h1>
        <p className="text-muted-foreground mb-1">{tr("thankYou")}</p>
        <p className="text-sm font-medium text-primary mb-8">
          {tr("orderNumber")}: #{order.orderNumber}
        </p>
      </motion.div>

      <div className="bg-card border border-card-border rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-primary" />
          {tr("orderSummary")}
        </h2>
        <div className="space-y-3 mb-4">
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{getItemName(item)} × {item.quantity}</span>
              <span className="font-medium">{(Number(item.price) * item.quantity).toFixed(2)} {tr("currency")}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-border pt-3 space-y-2 text-sm">
          {Number(order.discount) > 0 && (
            <div className="flex justify-between text-green-600">
              <span>{tr("discount")}</span>
              <span>-{Number(order.discount).toFixed(2)} {tr("currency")}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-base">
            <span>{tr("total")}</span>
            <span className="text-primary">{Number(order.total).toFixed(2)} {tr("currency")}</span>
          </div>
        </div>
      </div>

      <div className="bg-card border border-card-border rounded-2xl p-6 mb-8 text-sm space-y-2">
        <p><span className="text-muted-foreground">{tr("customerName")}:</span> <span className="font-medium ms-2">{order.customerName}</span></p>
        <p><span className="text-muted-foreground">{tr("phone")}:</span> <span className="font-medium ms-2">{order.customerPhone}</span></p>
        <p><span className="text-muted-foreground">{tr("address")}:</span> <span className="font-medium ms-2">{order.customerAddress}</span></p>
        <p><span className="text-muted-foreground">{tr("status")}:</span> <span className="font-medium ms-2 text-primary">{tr(order.status as any)}</span></p>
      </div>

      <div className="flex gap-3 justify-center">
        <Link href={`${BASE}/products`}>
          <Button size="lg">{tr("continueShopping")}</Button>
        </Link>
      </div>
    </div>
  );
}
