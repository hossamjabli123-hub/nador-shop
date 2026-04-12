import { Link } from "wouter";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguageContext } from "@/context/LanguageContext";
import { useListProducts, useListCategories } from "@workspace/api-client-react";
import ProductCard from "@/components/ProductCard";
import BrandsMarquee from "@/components/BrandsMarquee";
import TrustBadges from "@/components/TrustBadges";
import { Skeleton } from "@/components/ui/skeleton";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const heroImages = [
  "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1200&q=80",
  "https://images.unsplash.com/photo-1607082349566-187342175e2f?w=1200&q=80",
];

export default function Home() {
  const { language, tr, dir } = useLanguageContext();

  const { data: featuredData, isLoading: loadingFeatured } = useListProducts({ featured: true, limit: 8 });
  const { data: categories, isLoading: loadingCats } = useListCategories();
  const { data: saleData } = useListProducts({ onSale: true, limit: 4 });

  const getName = (item: { nameAr: string; nameEn: string; nameFr: string }) => {
    if (language === "ar") return item.nameAr;
    if (language === "fr") return item.nameFr;
    return item.nameEn;
  };

  const ArrowIcon = dir === "rtl" ? ArrowLeft : ArrowRight;

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[520px] bg-gradient-to-br from-slate-900 via-primary/90 to-slate-800 overflow-hidden flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${heroImages[0]})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/50 to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-2xl"
          >
            <h1 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight">
              {tr("storeName")}
            </h1>
            <p className="text-xl md:text-2xl text-white/80 mb-8 font-medium">
              {tr("storeTagline")}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href={`${BASE}/products`}
                className="inline-flex items-center gap-2 px-8 py-4 bg-secondary hover:bg-secondary/90 text-white font-bold rounded-xl text-base transition-all hover:scale-105 shadow-lg"
              >
                {tr("shopNow")}
                <ArrowIcon className="w-5 h-5" />
              </Link>
              <Link
                href={`${BASE}/products?onSale=true`}
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-base backdrop-blur transition-all"
              >
                {tr("onSale")}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Badges */}
      <TrustBadges />

      {/* Brands Marquee */}
      <BrandsMarquee />

      {/* Categories */}
      {!loadingCats && categories && categories.length > 0 && (
        <section className="py-12 container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">{tr("categories")}</h2>
            <Link href={`${BASE}/products`} className="text-primary hover:text-primary/80 text-sm font-medium flex items-center gap-1">
              {tr("viewAll")} <ArrowIcon className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {categories.slice(0, 6).map((cat) => (
              <Link key={cat.id} href={`${BASE}/products?categoryId=${cat.id}`}>
                <motion.div
                  whileHover={{ scale: 1.04 }}
                  className="bg-card border border-card-border rounded-2xl p-4 text-center cursor-pointer hover:border-primary hover:shadow-md transition-all"
                >
                  {cat.image ? (
                    <div className="w-14 h-14 rounded-2xl mx-auto mb-2 overflow-hidden">
                      <img src={cat.image} alt={getName(cat)} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl mx-auto mb-2 flex items-center justify-center">
                      <span className="text-2xl font-bold text-primary">{getName(cat).charAt(0)}</span>
                    </div>
                  )}
                  <p className="text-sm font-semibold line-clamp-2">{getName(cat)}</p>
                  <p className="text-xs text-muted-foreground mt-1">{cat.productCount}</p>
                </motion.div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="py-12 container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{tr("featured")}</h2>
          <Link href={`${BASE}/products?featured=true`} className="text-primary hover:text-primary/80 text-sm font-medium flex items-center gap-1">
            {tr("viewAll")} <ArrowIcon className="w-4 h-4" />
          </Link>
        </div>
        {loadingFeatured ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square rounded-2xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : featuredData?.products && featuredData.products.length > 0 ? (
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
          >
            {featuredData.products.map(p => (
              <motion.div key={p.id} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                <ProductCard product={{
                  ...p,
                  price: Number(p.price),
                  salePrice: p.salePrice ? Number(p.salePrice) : null,
                  images: (p.images as string[]) ?? [],
                }} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg">{tr("noProducts")}</p>
          </div>
        )}
      </section>

      {/* Sale Products */}
      {saleData?.products && saleData.products.length > 0 && (
        <section className="py-12 bg-gradient-to-r from-destructive/5 via-secondary/5 to-destructive/5">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <span className="px-2 py-0.5 bg-destructive text-destructive-foreground text-sm rounded-lg">{tr("onSale")}</span>
              </h2>
              <Link href={`${BASE}/products?onSale=true`} className="text-primary hover:text-primary/80 text-sm font-medium flex items-center gap-1">
                {tr("viewAll")} <ArrowIcon className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {saleData.products.map(p => (
                <ProductCard key={p.id} product={{
                  ...p,
                  price: Number(p.price),
                  salePrice: p.salePrice ? Number(p.salePrice) : null,
                  images: (p.images as string[]) ?? [],
                }} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
