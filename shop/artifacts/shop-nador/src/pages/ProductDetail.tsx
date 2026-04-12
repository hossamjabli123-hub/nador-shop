import { useState } from "react";
import { useParams, Link } from "wouter";
import { ShoppingCart, Star, Package, Tag, ArrowLeft, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguageContext } from "@/context/LanguageContext";
import { useGetProduct, useListProductReviews, useCreateReview } from "@workspace/api-client-react";
import { useCart } from "@/context/CartContext";
import ProductImageGallery from "@/components/ProductImageGallery";
import StarRating from "@/components/StarRating";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { language, tr, dir } = useLanguageContext();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data: product, isLoading } = useGetProduct(Number(id));
  const { data: reviews, refetch: refetchReviews } = useListProductReviews(Number(id));
  const createReview = useCreateReview();

  const BackIcon = dir === "rtl" ? ArrowRight : ArrowLeft;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground text-lg">{tr("error")}</p>
        <Link href={`${BASE}/products`} className="text-primary mt-4 inline-block">{tr("continueShopping")}</Link>
      </div>
    );
  }

  const getName = () => language === "ar" ? product.nameAr : language === "fr" ? product.nameFr : product.nameEn;
  const getDesc = () => language === "ar" ? product.descriptionAr : language === "fr" ? product.descriptionFr : product.descriptionEn;

  const isOnSale = product.salePrice !== null && Number(product.salePrice) < Number(product.price);
  const displayPrice = isOnSale ? Number(product.salePrice) : Number(product.price);

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      quantity,
      nameAr: product.nameAr,
      nameEn: product.nameEn,
      nameFr: product.nameFr,
      price: Number(product.price),
      salePrice: product.salePrice ? Number(product.salePrice) : null,
      image: (product.images as string[])?.[0] ?? null,
    });
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim()) return;
    setSubmitting(true);
    try {
      await createReview.mutateAsync({
        params: { productId: product.id },
        data: { customerName: reviewName, rating: reviewRating, comment: reviewComment || undefined },
      });
      setReviewName("");
      setReviewRating(5);
      setReviewComment("");
      await refetchReviews();
    } catch {}
    setSubmitting(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back */}
      <Link href={`${BASE}/products`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <BackIcon className="w-4 h-4" />
        {tr("products")}
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Gallery */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <ProductImageGallery images={(product.images as string[]) ?? []} productName={getName()} />
        </motion.div>

        {/* Info */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
          {product.brand && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Tag className="w-4 h-4" />
              {product.brand}
            </div>
          )}
          <h1 className="text-2xl md:text-3xl font-bold leading-tight">{getName()}</h1>

          {/* Rating Summary */}
          {product.reviewCount > 0 && (
            <div className="flex items-center gap-2">
              <StarRating rating={product.averageRating} size="md" />
              <span className="text-sm text-muted-foreground">({product.reviewCount})</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-black text-primary">
              {displayPrice.toFixed(2)} {tr("currency")}
            </span>
            {isOnSale && (
              <span className="text-lg text-muted-foreground line-through">
                {Number(product.price).toFixed(2)} {tr("currency")}
              </span>
            )}
            {isOnSale && (
              <span className="px-2 py-0.5 bg-destructive text-destructive-foreground text-xs font-bold rounded-lg">
                {tr("onSale")}
              </span>
            )}
          </div>

          {/* Description */}
          {getDesc() && (
            <p className="text-muted-foreground leading-relaxed">{getDesc()}</p>
          )}

          {/* Stock */}
          <div className="flex items-center gap-2 text-sm">
            <Package className="w-4 h-4 text-muted-foreground" />
            {product.stock > 0 ? (
              <span className="text-green-600 font-medium">{tr("inStock")} ({product.stock})</span>
            ) : (
              <span className="text-destructive font-medium">{tr("outOfStock")}</span>
            )}
          </div>

          {/* Quantity + Cart */}
          {product.stock > 0 && (
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center border border-border rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-4 py-3 hover:bg-muted transition-colors font-bold"
                >-</button>
                <span className="px-4 py-3 font-semibold min-w-[3rem] text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                  className="px-4 py-3 hover:bg-muted transition-colors font-bold"
                >+</button>
              </div>
              <Button onClick={handleAddToCart} className="flex-1 gap-2 py-3 text-base">
                <ShoppingCart className="w-5 h-5" />
                {tr("addToCart")}
              </Button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Reviews */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6">{tr("reviews")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Review List */}
          <div>
            {!reviews || reviews.length === 0 ? (
              <p className="text-muted-foreground py-8">{tr("noReviews")}</p>
            ) : (
              <div className="space-y-4">
                {reviews.map(r => (
                  <div key={r.id} className="bg-card border border-card-border rounded-xl p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold">{r.customerName}</p>
                        <StarRating rating={r.rating} size="sm" />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {r.comment && <p className="text-sm text-muted-foreground mt-2">{r.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Write Review */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{tr("writeReview")}</h3>
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">{tr("yourName")}</label>
                <Input value={reviewName} onChange={e => setReviewName(e.target.value)} required />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">{tr("yourRating")}</label>
                <StarRating rating={reviewRating} size="lg" interactive onRate={setReviewRating} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">{tr("yourComment")}</label>
                <Textarea value={reviewComment} onChange={e => setReviewComment(e.target.value)} rows={3} />
              </div>
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? tr("loading") : tr("submit")}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
