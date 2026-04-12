import { Shield, Headphones, Truck, BadgeCheck } from "lucide-react";
import { useLanguageContext } from "@/context/LanguageContext";

export default function TrustBadges() {
  const { tr } = useLanguageContext();

  const badges = [
    { icon: Shield, label: tr("securePayment"), color: "text-blue-500", bg: "bg-blue-500/10" },
    { icon: Headphones, label: tr("support"), color: "text-purple-500", bg: "bg-purple-500/10" },
    { icon: Truck, label: tr("fastDelivery"), color: "text-green-500", bg: "bg-green-500/10" },
    { icon: BadgeCheck, label: tr("authentic"), color: "text-secondary", bg: "bg-secondary/10" },
  ];

  return (
    <section className="py-6 bg-card border-b border-border">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {badges.map(({ icon: Icon, label, color, bg }) => (
            <div key={label} className="flex flex-col sm:flex-row items-center gap-3 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
              <div className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center shrink-0`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <span className="text-sm font-semibold text-center sm:text-start">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
