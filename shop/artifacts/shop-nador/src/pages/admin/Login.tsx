import { useState } from "react";
import { useLocation } from "wouter";
import { Lock, Store } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguageContext } from "@/context/LanguageContext";
import { useAdminLogin } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function AdminLogin() {
  const { tr } = useLanguageContext();
  const [, navigate] = useLocation();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const adminLogin = useAdminLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const result = await adminLogin.mutateAsync({ data: { password } });
      sessionStorage.setItem("adminToken", result.token);
      navigate(`${BASE}/admin/dashboard`);
    } catch {
      setError(tr("error"));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary/20 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-card-border rounded-2xl shadow-xl p-8 w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold">{tr("storeName")}</h1>
          <p className="text-muted-foreground text-sm mt-1">{tr("adminLogin")}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">{tr("password")}</label>
            <div className="relative">
              <Lock className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="ps-10"
                placeholder="••••••••"
                required
              />
            </div>
          </div>
          {error && <p className="text-destructive text-sm">{error}</p>}
          <Button type="submit" className="w-full" disabled={adminLogin.isPending}>
            {adminLogin.isPending ? tr("loading") : tr("login")}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
