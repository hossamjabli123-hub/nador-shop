import { Link } from "wouter";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguageContext } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";
import { getImageUrl } from "@/lib/api";
import { Button } from "@/components/ui/button";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function Cart() {
  const { tr, language, dir } = useLanguageContext();
  const { items, removeFromCart, updateQuantity, total } = useCart();
  const ArrowIcon = dir === "rtl" ? ArrowLeft : ArrowRight;

  const getItemName = (item: { nameAr: string; nameEn: string; nameFr: string }) => {
    if (language === "ar") return item.nameAr;
    if (language === "fr") return item.nameFr;
    return item.nameEn;
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
        <h2 className="text-xl font-bold mb-2">{tr("emptyCart")}</h2>
        <p className="text-muted-foreground mb-6">{tr("continueShopping")}</p>
        <Link href={`${BASE}/products`}>
          <Button size="lg">{tr("shopNow")}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">{tr("cart")} ({items.length})</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          <AnimatePresence>
            {items.map(item => {
              const image = getImageUrl(item.image);
              const price = item.salePrice ?? item.price;
              return (
                <motion.div
                  key={item.productId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-card border border-card-border rounded-2xl p-4 flex items-center gap-4"
                >
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-muted shrink-0">
                    {image ? (
                      <img src={image} alt={getItemName(item)} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                        <span className="text-xl font-bold text-primary/30">{getItemName(item).charAt(0)}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm line-clamp-2">{getItemName(item)}</h3>
                    <p className="text-primary font-bold mt-1">
                      {price.toFixed(2)} {tr("currency")}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center border border-border rounded-xl overflow-hidden">
                      <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="p-2 hover:bg-muted transition-colors">
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-3 py-2 font-semibold text-sm min-w-[2.5rem] text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="p-2 hover:bg-muted transition-colors">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Order Summary */}
        <div>
          <div className="bg-card border border-card-border rounded-2xl p-6 sticky top-20">
            <h2 className="text-lg font-bold mb-4">{tr("orderSummary")}</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{tr("subtotal")}</span>
                <span className="font-medium">{total.toFixed(2)} {tr("currency")}</span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between text-base font-bold">
                <span>{tr("total")}</span>
                <span className="text-primary">{total.toFixed(2)} {tr("currency")}</span>
              </div>
            </div>
            <Link href={`${BASE}/checkout`}>
              <Button className="w-full mt-6 py-3 text-base gap-2">
                {tr("checkout")}
                <ArrowIcon className="w-4 h-4" />
              </Button>
            </Link>
            <Link href={`${BASE}/products`}>
              <Button variant="outline" className="w-full mt-3">
                {tr("continueShopping")}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
