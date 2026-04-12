import { useState } from "react";
import { useLocation } from "wouter";
import { CheckCircle2, Tag } from "lucide-react";
import { useLanguageContext } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";
import { useCreateOrder, useValidatePromoCode } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function Checkout() {
  const { tr, language } = useLanguageContext();
  const { items, total, clearCart } = useCart();
  const [, navigate] = useLocation();
  const createOrder = useCreateOrder();
  const validatePromo = useValidatePromoCode();

  const [form, setForm] = useState({ customerName: "", customerPhone: "", customerAddress: "" });
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discountType: string; discountValue: number } | null>(null);
  const [promoError, setPromoError] = useState("");
  const [placing, setPlacing] = useState(false);

  const getItemName = (item: { nameAr: string; nameEn: string; nameFr: string }) => {
    if (language === "ar") return item.nameAr;
    if (language === "fr") return item.nameFr;
    return item.nameEn;
  };

  const discount = appliedPromo
    ? appliedPromo.discountType === "percentage"
      ? total * (appliedPromo.discountValue / 100)
      : Math.min(appliedPromo.discountValue, total)
    : 0;

  const finalTotal = Math.max(0, total - discount);

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoError("");
    try {
      const result = await validatePromo.mutateAsync({ data: { code: promoCode.trim() } });
      setAppliedPromo({
        code: promoCode.trim(),
        discountType: result.discountType,
        discountValue: Number(result.discountValue),
      });
    } catch {
      setPromoError(tr("invalidCode"));
      setAppliedPromo(null);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    setPlacing(true);
    try {
      const order = await createOrder.mutateAsync({
        data: {
          ...form,
          items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
          promoCode: appliedPromo?.code ?? null,
        },
      });
      clearCart();
      navigate(`${BASE}/order-confirmation/${order.id}`);
    } catch {
      setPlacing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <p className="text-muted-foreground mb-4">{tr("emptyCart")}</p>
        <Button onClick={() => navigate(`${BASE}/products`)}>{tr("shopNow")}</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">{tr("checkout")}</h1>

      <form onSubmit={handlePlaceOrder}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Customer Info */}
          <div className="space-y-5">
            <div className="bg-card border border-card-border rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-4">{tr("customerName")}</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">{tr("customerName")}</label>
                  <Input
                    value={form.customerName}
                    onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">{tr("phone")}</label>
                  <Input
                    value={form.customerPhone}
                    onChange={e => setForm(f => ({ ...f, customerPhone: e.target.value }))}
                    type="tel"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">{tr("address")}</label>
                  <Textarea
                    value={form.customerAddress}
                    onChange={e => setForm(f => ({ ...f, customerAddress: e.target.value }))}
                    rows={3}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Promo Code */}
            <div className="bg-card border border-card-border rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5 text-secondary" />
                {tr("promoCode")}
              </h2>
              <div className="flex gap-2">
                <Input
                  value={promoCode}
                  onChange={e => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="PROMO2024"
                  disabled={!!appliedPromo}
                />
                <Button
                  type="button"
                  variant={appliedPromo ? "outline" : "default"}
                  onClick={appliedPromo ? () => { setAppliedPromo(null); setPromoCode(""); } : handleApplyPromo}
                >
                  {appliedPromo ? "×" : tr("apply")}
                </Button>
              </div>
              {promoError && <p className="text-destructive text-sm mt-2">{promoError}</p>}
              {appliedPromo && (
                <p className="text-green-600 text-sm mt-2 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  {tr("codeApplied")} — {appliedPromo.discountType === "percentage" ? `${appliedPromo.discountValue}%` : `${appliedPromo.discountValue} ${tr("currency")}`}
                </p>
              )}
            </div>
          </div>

          {/* Summary */}
          <div>
            <div className="bg-card border border-card-border rounded-2xl p-6 sticky top-20">
              <h2 className="text-lg font-semibold mb-4">{tr("orderSummary")}</h2>
              <div className="space-y-3 mb-4">
                {items.map(item => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span className="text-muted-foreground line-clamp-1 flex-1 me-2">
                      {getItemName(item)} × {item.quantity}
                    </span>
                    <span className="font-medium shrink-0">
                      {((item.salePrice ?? item.price) * item.quantity).toFixed(2)} {tr("currency")}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{tr("subtotal")}</span>
                  <span>{total.toFixed(2)} {tr("currency")}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>{tr("discount")}</span>
                    <span>-{discount.toFixed(2)} {tr("currency")}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold pt-2 border-t border-border">
                  <span>{tr("total")}</span>
                  <span className="text-primary">{finalTotal.toFixed(2)} {tr("currency")}</span>
                </div>
              </div>
              <Button type="submit" className="w-full mt-6 py-3 text-base" disabled={placing}>
                {placing ? tr("loading") : tr("placeOrder")}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
