import { useEffect, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, Package, Tag, ShoppingBag, Ticket, Settings, Store, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { useLanguageContext } from "@/context/LanguageContext";
import { useVerifyAdminToken } from "@workspace/api-client-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { tr } = useLanguageContext();
  const [, navigate] = useLocation();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const verifyToken = useVerifyAdminToken({ query: { retry: false } });

  useEffect(() => {
    const token = sessionStorage.getItem("adminToken");
    if (!token) {
      navigate(`${BASE}/admin`);
      return;
    }
  }, []);

  useEffect(() => {
    if (verifyToken.isError) {
      sessionStorage.removeItem("adminToken");
      navigate(`${BASE}/admin`);
    }
  }, [verifyToken.isError]);

  const handleLogout = () => {
    sessionStorage.removeItem("adminToken");
    navigate(`${BASE}/admin`);
  };

  const nav = [
    { href: `${BASE}/admin/dashboard`, icon: LayoutDashboard, label: tr("dashboard") },
    { href: `${BASE}/admin/products`, icon: Package, label: tr("manageProducts") },
    { href: `${BASE}/admin/categories`, icon: Tag, label: tr("manageCategories") },
    { href: `${BASE}/admin/orders`, icon: ShoppingBag, label: tr("manageOrders") },
    { href: `${BASE}/admin/promo-codes`, icon: Ticket, label: tr("managePromoCodes") },
    { href: `${BASE}/admin/settings`, icon: Settings, label: tr("settings") },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-sidebar-border">
        <Link href={`${BASE}/`} className="flex items-center gap-2 font-bold text-lg">
          <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center shrink-0">
            <Store className="w-4 h-4 text-white" />
          </div>
          <span className="text-sidebar-foreground">{tr("storeName")}</span>
        </Link>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {nav.map(item => {
          const active = location === item.href || location.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}>
              <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              }`}>
                <item.icon className="w-4 h-4 shrink-0" />
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-sidebar-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10 transition-colors w-full"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {tr("logout")}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-60 bg-sidebar border-e border-sidebar-border flex-col shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="w-60 bg-sidebar border-e border-sidebar-border flex flex-col">
            <SidebarContent />
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar (mobile) */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-card">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-muted">
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-bold text-sm">{tr("admin")}</span>
          <div className="w-9" />
        </div>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
