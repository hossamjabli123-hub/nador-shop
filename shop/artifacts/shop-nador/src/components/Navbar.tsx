import { Link, useLocation } from "wouter";
import { ShoppingCart, Sun, Moon, Menu, X, Search, Store, Settings2 } from "lucide-react";
import { useState } from "react";
import { useTheme } from "next-themes";
import { useLanguageContext } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";
import type { Language } from "@/lib/translations";
import { Button } from "@/components/ui/button";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function Navbar() {
  const { language, setLanguage, tr, dir } = useLanguageContext();
  const { count } = useCart();
  const { theme, setTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [, navigate] = useLocation();

  const langs: { code: Language; label: string }[] = [
    { code: "ar", label: "ع" },
    { code: "en", label: "EN" },
    { code: "fr", label: "FR" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href={`${BASE}/`} className="flex items-center gap-2 font-bold text-xl text-primary shrink-0">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
              <Store className="w-5 h-5 text-white" />
            </div>
            <span className="hidden sm:block">{tr("storeName")}</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href={`${BASE}/`} className="hover:text-primary transition-colors">{tr("home")}</Link>
            <Link href={`${BASE}/products`} className="hover:text-primary transition-colors">{tr("products")}</Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Lang Toggle */}
            <div className="hidden sm:flex items-center gap-1 bg-muted rounded-lg p-1">
              {langs.map(l => (
                <button
                  key={l.code}
                  onClick={() => setLanguage(l.code)}
                  className={`px-2 py-1 rounded-md text-xs font-semibold transition-all ${
                    language === l.code
                      ? "bg-primary text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Cart */}
            <Link href={`${BASE}/cart`} className="relative p-2 rounded-lg hover:bg-muted transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-secondary text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </Link>

            {/* Admin Link */}
            <Link
              href={`${BASE}/admin`}
              className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              title={tr("admin")}
            >
              <Settings2 className="w-5 h-5" />
            </Link>

            {/* Mobile Menu */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-border space-y-3">
            <Link href={`${BASE}/`} className="block py-2 hover:text-primary transition-colors font-medium" onClick={() => setMenuOpen(false)}>{tr("home")}</Link>
            <Link href={`${BASE}/products`} className="block py-2 hover:text-primary transition-colors font-medium" onClick={() => setMenuOpen(false)}>{tr("products")}</Link>
            <div className="flex items-center gap-2 pt-2">
              {langs.map(l => (
                <button
                  key={l.code}
                  onClick={() => { setLanguage(l.code); setMenuOpen(false); }}
                  className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-all ${
                    language === l.code ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
