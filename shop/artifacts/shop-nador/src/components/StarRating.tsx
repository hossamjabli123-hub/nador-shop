import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRate?: (rating: number) => void;
}

export default function StarRating({ rating, maxStars = 5, size = "md", interactive = false, onRate }: StarRatingProps) {
  const sizes = { sm: "w-3.5 h-3.5", md: "w-5 h-5", lg: "w-6 h-6" };
  const cls = sizes[size];

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: maxStars }, (_, i) => {
        const filled = i + 1 <= Math.round(rating);
        return (
          <button
            key={i}
            type={interactive ? "button" : undefined}
            onClick={interactive && onRate ? () => onRate(i + 1) : undefined}
            className={interactive ? "cursor-pointer hover:scale-110 transition-transform" : "cursor-default"}
            disabled={!interactive}
          >
            <Star
              className={`${cls} ${filled ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted-foreground/40"} transition-colors`}
            />
          </button>
        );
      })}
    </div>
  );
}
