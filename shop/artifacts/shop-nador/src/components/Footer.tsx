import { Link } from "wouter";
import { Instagram, MessageCircle, MapPin, Phone, Mail, Store } from "lucide-react";
import { useLanguageContext } from "@/context/LanguageContext";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function Footer() {
  const { tr } = useLanguageContext();

  return (
    <footer className="bg-sidebar text-sidebar-foreground border-t border-sidebar-border mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Store Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-secondary rounded-lg flex items-center justify-center">
                <Store className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl">{tr("storeName")}</span>
            </div>
            <p className="text-sidebar-foreground/70 text-sm leading-relaxed">
              {tr("storeDescription")}
            </p>
            <div className="flex items-center gap-2 mt-4 text-sm text-sidebar-foreground/70">
              <MapPin className="w-4 h-4 text-secondary shrink-0" />
              <span>{tr("location")}</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">{tr("categories")}</h3>
            <div className="space-y-2">
              <Link href={`${BASE}/products`} className="block text-sm text-sidebar-foreground/70 hover:text-secondary transition-colors">
                {tr("allProducts")}
              </Link>
              <Link href={`${BASE}/products?onSale=true`} className="block text-sm text-sidebar-foreground/70 hover:text-secondary transition-colors">
                {tr("onSale")}
              </Link>
            </div>
          </div>

          {/* Contact & Maps */}
          <div>
            <h3 className="font-semibold text-lg mb-4">{tr("contactUs")}</h3>
            <div className="space-y-3">
              <a
                href="https://wa.me/+212600000000"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-sidebar-foreground/70 hover:text-secondary transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-green-400" />
                WhatsApp
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-sidebar-foreground/70 hover:text-secondary transition-colors"
              >
                <Instagram className="w-4 h-4 text-pink-400" />
                Instagram
              </a>
              <div className="flex gap-2 pt-2">
                <a
                  href="https://maps.google.com/?q=Nador+Maroc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-sidebar-accent hover:bg-sidebar-accent/80 rounded-lg text-xs font-medium transition-colors"
                >
                  <MapPin className="w-3 h-3" />
                  {tr("viewOnGoogleMaps")}
                </a>
                <a
                  href="https://maps.apple.com/?q=Nador+Maroc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-sidebar-accent hover:bg-sidebar-accent/80 rounded-lg text-xs font-medium transition-colors"
                >
                  <MapPin className="w-3 h-3" />
                  {tr("viewOnAppleMaps")}
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-sidebar-border mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-sidebar-foreground/50">
          <span>© {new Date().getFullYear()} {tr("storeName")}. {tr("allRightsReserved")}.</span>
          <Link href={`${BASE}/admin`} className="hover:text-sidebar-foreground/70 transition-colors">{tr("admin")}</Link>
        </div>
      </div>
    </footer>
  );
}
