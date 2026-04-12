import { useState } from "react";
import { Pencil, Trash2, Plus, Tag } from "lucide-react";
import { useLanguageContext } from "@/context/LanguageContext";
import { useListCategories, useCreateCategory, useUpdateCategory, useDeleteCategory, getListCategoriesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface CatForm {
  nameAr: string;
  nameEn: string;
  nameFr: string;
  slug: string;
}

const emptyForm: CatForm = { nameAr: "", nameEn: "", nameFr: "", slug: "" };

export default function AdminCategories() {
  const { tr, language } = useLanguageContext();
  const queryClient = useQueryClient();
  const { data: categories, isLoading } = useListCategories();
  const createCat = useCreateCategory();
  const updateCat = useUpdateCategory();
  const deleteCat = useDeleteCategory();

  const [showDialog, setShowDialog] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<CatForm>(emptyForm);

  const getName = (item: { nameAr: string; nameEn: string; nameFr: string }) => {
    if (language === "ar") return item.nameAr;
    if (language === "fr") return item.nameFr;
    return item.nameEn;
  };

  const openAdd = () => { setEditId(null); setForm(emptyForm); setShowDialog(true); };
  const openEdit = (cat: any) => {
    setEditId(cat.id);
    setForm({ nameAr: cat.nameAr, nameEn: cat.nameEn, nameFr: cat.nameFr, slug: cat.slug });
    setShowDialog(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) {
      await updateCat.mutateAsync({ params: { id: editId }, data: form });
    } else {
      await createCat.mutateAsync({ data: form });
    }
    await queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
    setShowDialog(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm(tr("delete") + "?")) return;
    await deleteCat.mutateAsync({ params: { id } });
    await queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{tr("manageCategories")}</h1>
          <Button onClick={openAdd} className="gap-2"><Plus className="w-4 h-4" />{tr("addCategory")}</Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
          </div>
        ) : !categories || categories.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            <Tag className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p>{tr("noProducts")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {categories.map(cat => (
              <div key={cat.id} className="bg-card border border-card-border rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                  <span className="font-bold text-primary">{getName(cat).charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm line-clamp-1">{getName(cat)}</p>
                  <p className="text-xs text-muted-foreground">{cat.productCount} {tr("products")}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(cat)} className="p-1.5 hover:text-primary transition-colors rounded-lg hover:bg-primary/10">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(cat.id)} className="p-1.5 hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editId ? tr("edit") : tr("addCategory")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {(["nameAr", "nameEn", "nameFr", "slug"] as const).map(field => (
              <div key={field}>
                <label className="text-sm font-medium mb-1.5 block">{tr(field as any)}</label>
                <Input
                  value={form[field]}
                  onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                  required
                />
              </div>
            ))}
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>{tr("cancel")}</Button>
              <Button type="submit" disabled={createCat.isPending || updateCat.isPending}>
                {(createCat.isPending || updateCat.isPending) ? tr("loading") : tr("save")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
