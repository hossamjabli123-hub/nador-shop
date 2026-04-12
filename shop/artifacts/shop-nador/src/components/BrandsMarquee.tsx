import { useLanguageContext } from "@/context/LanguageContext";

const brands = [
  { name: "Apple", color: "#555" },
  { name: "Samsung", color: "#1428A0" },
  { name: "HP", color: "#0096D6" },
  { name: "Dell", color: "#007DB8" },
  { name: "Asus", color: "#00439C" },
  { name: "Acer", color: "#83B81A" },
  { name: "MSI", color: "#E4002B" },
  { name: "Logitech", color: "#00B140" },
  { name: "Sony", color: "#000" },
  { name: "Huawei", color: "#CF0A2C" },
  { name: "Xiaomi", color: "#FF6900" },
  { name: "Lenovo", color: "#E2231A" },
];

export default function BrandsMarquee() {
  const { tr } = useLanguageContext();
  const doubled = [...brands, ...brands];

  return (
    <section className="py-8 border-y border-border bg-card overflow-hidden">
      <div className="container mx-auto px-4 mb-4">
        <h2 className="text-center text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          {tr("ourBrands")}
        </h2>
      </div>
      <div className="relative">
        <div className="flex animate-marquee whitespace-nowrap gap-8" style={{ width: "max-content" }}>
          {doubled.map((brand, i) => (
            <div
              key={i}
              className="inline-flex items-center justify-center px-6 py-3 bg-muted rounded-xl min-w-[100px] hover:bg-primary/10 transition-colors cursor-default"
            >
              <span className="font-bold text-base" style={{ color: brand.color }}>
                {brand.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
