import { Link } from "wouter";
import { ShoppingCart, Star } from "lucide-react";
import { useLanguageContext } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";
import { getImageUrl } from "@/lib/api";
import type { Language } from "@/lib/translations";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

interface Product {
  id: number;
  nameAr: string;
  nameEn: string;
  nameFr: string;
  price: number;
  salePrice: number | null;
  images: string[];
  stock: number;
  brand: string | null;
  averageRating: number;
  reviewCount: number;
  featured?: boolean;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { language, tr } = useLanguageContext();
  const { addToCart } = useCart();

  const getName = () => {
    if (language === "ar") return product.nameAr;
    if (language === "fr") return product.nameFr;
    return product.nameEn;
  };

  const image = getImageUrl(product.images?.[0]);
  const isOnSale = product.salePrice !== null && product.salePrice < product.price;
  const displayPrice = isOnSale ? product.salePrice! : product.price;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart({
      productId: product.id,
      quantity: 1,
      nameAr: product.nameAr,
      nameEn: product.nameEn,
      nameFr: product.nameFr,
      price: product.price,
      salePrice: product.salePrice,
      image: product.images?.[0] ?? null,
    });
  };

  return (
    <Link href={`${BASE}/products/${product.id}`}>
      <div className="product-card group bg-card border border-card-border rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1">
        {/* Image */}
        <div className="relative aspect-square bg-muted overflow-hidden">
          {image ? (
            <img
              src={image}
              alt={getName()}
              className="product-img-zoom w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
              <span className="text-4xl font-bold text-primary/30">{getName().charAt(0)}</span>
            </div>
          )}
          {isOnSale && (
            <div className="absolute top-2 start-2 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded-lg">
              {tr("onSale")}
            </div>
          )}
          {product.featured && (
            <div className="absolute top-2 end-2 bg-secondary text-secondary-foreground text-xs font-bold px-2 py-1 rounded-lg">
              {tr("featured_label")}
            </div>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center">
              <span className="bg-muted text-muted-foreground text-sm font-semibold px-3 py-1.5 rounded-lg">
                {tr("outOfStock")}
              </span>
            </div>
          )}
          {/* Quick Add */}
          {product.stock > 0 && (
            <button
              onClick={handleAddToCart}
              className="absolute bottom-2 end-2 w-9 h-9 bg-primary text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-primary/90 shadow-md"
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          {product.brand && (
            <span className="text-xs text-muted-foreground font-medium">{product.brand}</span>
          )}
          <h3 className="font-semibold text-sm mt-1 line-clamp-2 leading-snug">{getName()}</h3>
          
          {/* Rating */}
          {product.reviewCount > 0 && (
            <div className="flex items-center gap-1 mt-1.5">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} className={`w-3 h-3 ${i < Math.round(product.averageRating) ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted-foreground/30"}`} />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
            </div>
          )}

          {/* Price */}
          <div className="mt-2 flex items-center gap-2">
            <span className="font-bold text-primary text-base">
              {displayPrice.toFixed(2)} {tr("currency")}
            </span>
            {isOnSale && (
              <span className="text-xs text-muted-foreground line-through">
                {product.price.toFixed(2)} {tr("currency")}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
