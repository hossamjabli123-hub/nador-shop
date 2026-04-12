import { useState } from "react";
import { Trash2, Plus, Ticket } from "lucide-react";
import { useLanguageContext } from "@/context/LanguageContext";
import { useListPromoCodes, useCreatePromoCode, useDeletePromoCode, getListPromoCodesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminPromoCodes() {
  const { tr } = useLanguageContext();
  const queryClient = useQueryClient();
  const { data: codes, isLoading } = useListPromoCodes();
  const createCode = useCreatePromoCode();
  const deleteCode = useDeletePromoCode();

  const [showDialog, setShowDialog] = useState(false);
  const [form, setForm] = useState({
    code: "",
    discountType: "percentage" as "percentage" | "fixed",
    discountValue: 10,
    active: true,
    maxUses: "",
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createCode.mutateAsync({
      data: {
        code: form.code.toUpperCase(),
        discountType: form.discountType,
        discountValue: form.discountValue,
        active: form.active,
        maxUses: form.maxUses ? Number(form.maxUses) : null,
      },
    });
    await queryClient.invalidateQueries({ queryKey: getListPromoCodesQueryKey() });
    setShowDialog(false);
    setForm({ code: "", discountType: "percentage", discountValue: 10, active: true, maxUses: "" });
  };

  const handleDelete = async (id: number) => {
    if (!confirm(tr("delete") + "?")) return;
    await deleteCode.mutateAsync({ params: { id } });
    await queryClient.invalidateQueries({ queryKey: getListPromoCodesQueryKey() });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{tr("managePromoCodes")}</h1>
          <Button onClick={() => setShowDialog(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            {tr("addPromoCode")}
          </Button>
        </div>

        <div className="bg-card border border-card-border rounded-2xl overflow-hidden">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-xl" />)}
            </div>
          ) : !codes || codes.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              <Ticket className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>{tr("noProducts")}</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="text-muted-foreground text-xs uppercase">
                  <th className="text-start py-3 px-4">{tr("code")}</th>
                  <th className="text-start py-3 px-4">{tr("discountType")}</th>
                  <th className="text-start py-3 px-4">{tr("discountValue")}</th>
                  <th className="text-start py-3 px-4">{tr("usedCount")}</th>
                  <th className="text-start py-3 px-4">{tr("active")}</th>
                  <th className="text-end py-3 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {codes.map(c => (
                  <tr key={c.id} className="border-t border-border hover:bg-muted/30">
                    <td className="py-3 px-4 font-mono font-bold text-primary">{c.code}</td>
                    <td className="py-3 px-4">{tr(c.discountType as any)}</td>
                    <td className="py-3 px-4 font-medium">
                      {c.discountType === "percentage" ? `${Number(c.discountValue)}%` : `${Number(c.discountValue)} ${tr("currency")}`}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{c.usedCount}{c.maxUses ? `/${c.maxUses}` : ""}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${c.active ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground"}`}>
                        {c.active ? "●" : "○"} {tr(c.active ? "active" : "cancelled")}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-end">
                      <button onClick={() => handleDelete(c.id)} className="p-1.5 hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{tr("addPromoCode")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">{tr("code")}</label>
              <Input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} placeholder="SUMMER20" required />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">{tr("discountType")}</label>
              <Select value={form.discountType} onValueChange={v => setForm(f => ({ ...f, discountType: v as any }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">{tr("percentage")}</SelectItem>
                  <SelectItem value="fixed">{tr("fixed")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">{tr("discountValue")}</label>
              <Input type="number" min={0} value={form.discountValue} onChange={e => setForm(f => ({ ...f, discountValue: Number(e.target.value) }))} required />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">{tr("maxUses")} ({tr("cancel")} = unlimited)</label>
              <Input type="number" min={1} value={form.maxUses} onChange={e => setForm(f => ({ ...f, maxUses: e.target.value }))} placeholder="∞" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>{tr("cancel")}</Button>
              <Button type="submit" disabled={createCode.isPending}>{createCode.isPending ? tr("loading") : tr("save")}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
