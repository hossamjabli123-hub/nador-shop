import { useState, useEffect } from "react";
import { useSearch } from "wouter";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguageContext } from "@/context/LanguageContext";
import { useListProducts, useListCategories } from "@workspace/api-client-react";
import ProductCard from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

export default function Products() {
  const { language, tr } = useLanguageContext();
  const search = useSearch();
  const params = new URLSearchParams(search);

  const [searchQuery, setSearchQuery] = useState(params.get("search") ?? "");
  const [selectedCategory, setSelectedCategory] = useState(params.get("categoryId") ? Number(params.get("categoryId")) : undefined);
  const [onSale, setOnSale] = useState(params.get("onSale") === "true");
  const [featured, setFeatured] = useState(params.get("featured") === "true");
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const { data: productsData, isLoading } = useListProducts({
    search: debouncedSearch || undefined,
    categoryId: selectedCategory,
    onSale: onSale || undefined,
    featured: featured || undefined,
    limit: 24,
  });

  const { data: categories } = useListCategories();

  const getName = (item: { nameAr: string; nameEn: string; nameFr: string }) => {
    if (language === "ar") return item.nameAr;
    if (language === "fr") return item.nameFr;
    return item.nameEn;
  };

  const products = productsData?.products ?? [];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{tr("allProducts")}</h1>
        <span className="text-sm text-muted-foreground">
          {productsData?.total ?? 0} {tr("products")}
        </span>
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder={tr("searchProducts")}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="ps-10"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery("")} className="absolute end-3 top-1/2 -translate-y-1/2">
            <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
          </button>
        )}
      </div>

      <div className="flex gap-6">
        {/* Filters Sidebar */}
        <aside className={`${showFilters ? "block" : "hidden"} md:block w-full md:w-56 shrink-0`}>
          <div className="bg-card border border-card-border rounded-2xl p-4 space-y-5 sticky top-20">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">{tr("filterBy")}</h3>

            {/* Sale / Featured */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={onSale} onChange={e => setOnSale(e.target.checked)} className="rounded accent-primary" />
                <span className="text-sm font-medium">{tr("onSale")}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={featured} onChange={e => setFeatured(e.target.checked)} className="rounded accent-primary" />
                <span className="text-sm font-medium">{tr("featured_label")}</span>
              </label>
            </div>

            {/* Categories */}
            {categories && categories.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2">{tr("categories")}</h4>
                <div className="space-y-1">
                  <button
                    onClick={() => setSelectedCategory(undefined)}
                    className={`w-full text-start px-3 py-2 rounded-lg text-sm transition-colors ${!selectedCategory ? "bg-primary text-white" : "hover:bg-muted"}`}
                  >
                    {tr("allCategories")}
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full text-start px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategory === cat.id ? "bg-primary text-white" : "hover:bg-muted"}`}
                    >
                      {getName(cat)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4 md:hidden">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-sm font-medium bg-muted px-3 py-2 rounded-lg"
            >
              <SlidersHorizontal className="w-4 h-4" />
              {tr("filterBy")}
            </button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-square rounded-2xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="py-24 text-center text-muted-foreground">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-lg font-medium">{tr("noProducts")}</p>
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
            >
              {products.map(p => (
                <motion.div key={p.id} variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}>
                  <ProductCard product={{
                    ...p,
                    price: Number(p.price),
                    salePrice: p.salePrice ? Number(p.salePrice) : null,
                    images: (p.images as string[]) ?? [],
                  }} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
