import { useState, useRef, useCallback, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { getImageUrl } from "@/lib/api";

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
}

export default function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const [selected, setSelected] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [magnifierPos, setMagnifierPos] = useState({ x: 0, y: 0 });
  const [showMagnifier, setShowMagnifier] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const imageUrls = images.length > 0 ? images.map(img => getImageUrl(img) ?? img) : [null];
  const currentUrl = imageUrls[selected];

  const prev = () => {
    setSelected(i => (i > 0 ? i - 1 : images.length - 1));
    setPan({ x: 0, y: 0 });
    setZoom(1);
  };

  const next = () => {
    setSelected(i => (i < images.length - 1 ? i + 1 : 0));
    setPan({ x: 0, y: 0 });
    setZoom(1);
  };

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!mainRef.current || !imgRef.current) return;
    const rect = mainRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMagnifierPos({ x, y });
  }, []);

  // Lightbox wheel zoom
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    setZoom(prev => Math.min(5, Math.max(1, prev - e.deltaY * 0.002)));
  }, []);

  useEffect(() => {
    if (lightboxOpen) {
      window.addEventListener("wheel", handleWheel, { passive: false });
      return () => window.removeEventListener("wheel", handleWheel);
    }
  }, [lightboxOpen, handleWheel]);

  // Keyboard nav
  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setLightboxOpen(false); setZoom(1); setPan({ x: 0, y: 0 }); }
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen]);

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl flex items-center justify-center">
        <span className="text-6xl font-bold text-primary/20">{productName.charAt(0)}</span>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {/* Main Image with Magnifier */}
        <div
          ref={mainRef}
          className="magnifier-container aspect-square bg-muted rounded-2xl overflow-hidden border border-card-border"
          onMouseEnter={() => setShowMagnifier(true)}
          onMouseLeave={() => setShowMagnifier(false)}
          onMouseMove={handleMouseMove}
          onClick={() => setLightboxOpen(true)}
        >
          {currentUrl ? (
            <img
              ref={imgRef}
              src={currentUrl}
              alt={productName}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-6xl font-bold text-primary/20">{productName.charAt(0)}</span>
            </div>
          )}
          {/* Magnifier overlay */}
          {showMagnifier && currentUrl && (
            <div
              className="absolute w-36 h-36 rounded-full border-2 border-white/50 shadow-xl pointer-events-none overflow-hidden"
              style={{
                left: `${magnifierPos.x}%`,
                top: `${magnifierPos.y}%`,
                transform: "translate(-50%, -50%)",
                backgroundImage: `url(${currentUrl})`,
                backgroundSize: "300%",
                backgroundPosition: `${magnifierPos.x}% ${magnifierPos.y}%`,
                backgroundRepeat: "no-repeat",
                zIndex: 10,
              }}
            />
          )}
          {/* Zoom hint */}
          <div className="absolute bottom-3 end-3 bg-background/80 backdrop-blur-sm text-xs px-2 py-1 rounded-lg flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <ZoomIn className="w-3 h-3" />
          </div>
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {imageUrls.map((url, i) => (
              <button
                key={i}
                onClick={() => setSelected(i)}
                className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                  i === selected ? "border-primary shadow-md" : "border-transparent hover:border-primary/40"
                }`}
              >
                {url ? (
                  <img src={url} alt={`${productName} ${i + 1}`} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-muted" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="lightbox-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) { setLightboxOpen(false); setZoom(1); setPan({ x: 0, y: 0 }); } }}
        >
          <div className="relative w-full h-full flex items-center justify-center p-4">
            {/* Close */}
            <button
              onClick={() => { setLightboxOpen(false); setZoom(1); setPan({ x: 0, y: 0 }); }}
              className="absolute top-4 end-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Nav arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute start-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-10"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={next}
                  className="absolute end-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-10"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Image */}
            <div
              className="overflow-hidden rounded-xl cursor-grab active:cursor-grabbing"
              onMouseDown={(e) => setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })}
              onMouseMove={(e) => { if (dragStart) setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }); }}
              onMouseUp={() => setDragStart(null)}
              onMouseLeave={() => setDragStart(null)}
            >
              {currentUrl && (
                <img
                  src={currentUrl}
                  alt={productName}
                  className="max-w-[90vw] max-h-[80vh] object-contain select-none"
                  style={{
                    transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                    transition: dragStart ? "none" : "transform 0.1s ease",
                  }}
                  draggable={false}
                />
              )}
            </div>

            {/* Zoom indicator */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full">
              {Math.round(zoom * 100)}% — {images.length > 1 ? `${selected + 1}/${images.length}` : ""}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
