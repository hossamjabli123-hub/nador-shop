import { Store, MapPin, Phone, Instagram, MessageCircle, Info } from "lucide-react";
import { useLanguageContext } from "@/context/LanguageContext";
import AdminLayout from "@/components/AdminLayout";

export default function AdminSettings() {
  const { tr } = useLanguageContext();

  const info = [
    { icon: Store, label: tr("storeName"), value: "Shop Nador" },
    { icon: MapPin, label: tr("location"), value: "Nador, Maroc" },
    { icon: Phone, label: tr("phone"), value: "+212 6XX XXX XXX" },
    { icon: Instagram, label: "Instagram", value: "@shopnador" },
    { icon: MessageCircle, label: "WhatsApp", value: "+212 6XX XXX XXX" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{tr("settings")}</h1>

        <div className="bg-card border border-card-border rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Info className="w-5 h-5 text-primary" />
            {tr("storeName")}
          </h2>
          <div className="space-y-4">
            {info.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-4 py-3 border-b border-border last:border-0">
                <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="font-medium">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-muted/30 border border-border rounded-2xl p-4 text-sm text-muted-foreground">
          <p className="font-medium mb-1">Shop Nador — Version 1.0</p>
          <p>لتعديل إعدادات المتجر، تواصل مع المطور.</p>
        </div>
      </div>
    </AdminLayout>
  );
}
