import { useState, useRef } from "react";
import { Pencil, Trash2, Plus, Package, ImagePlus, X } from "lucide-react";
import { useLanguageContext } from "@/context/LanguageContext";
import {
  useListProducts, useCreateProduct, useUpdateProduct, useDeleteProduct,
  useListCategories, useRequestUploadUrl,
  getListProductsQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getImageUrl } from "@/lib/api";

interface ProductForm {
  nameAr: string; nameEn: string; nameFr: string;
  descriptionAr: string; descriptionEn: string; descriptionFr: string;
  price: string; salePrice: string;
  stock: string; brand: string;
  categoryId: string;
  featured: boolean;
  images: string[];
}

const emptyForm: ProductForm = {
  nameAr: "", nameEn: "", nameFr: "",
  descriptionAr: "", descriptionEn: "", descriptionFr: "",
  price: "", salePrice: "",
  stock: "0", brand: "",
  categoryId: "",
  featured: false,
  images: [],
};

export default function AdminProducts() {
  const { tr, language } = useLanguageContext();
  const queryClient = useQueryClient();
  const { data, isLoading } = useListProducts({ limit: 100 });
  const { data: categories } = useListCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const requestUploadUrl = useRequestUploadUrl();

  const [showDialog, setShowDialog] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getName = (item: { nameAr: string; nameEn: string; nameFr: string }) => {
    if (language === "ar") return item.nameAr;
    if (language === "fr") return item.nameFr;
    return item.nameEn;
  };

  const openAdd = () => { setEditId(null); setForm(emptyForm); setShowDialog(true); };
  const openEdit = (p: any) => {
    setEditId(p.id);
    setForm({
      nameAr: p.nameAr, nameEn: p.nameEn, nameFr: p.nameFr,
      descriptionAr: p.descriptionAr, descriptionEn: p.descriptionEn, descriptionFr: p.descriptionFr,
      price: String(p.price), salePrice: p.salePrice ? String(p.salePrice) : "",
      stock: String(p.stock), brand: p.brand ?? "",
      categoryId: p.categoryId ? String(p.categoryId) : "",
      featured: p.featured,
      images: (p.images as string[]) ?? [],
    });
    setShowDialog(true);
  };

  const handleUploadImages = async (files: FileList) => {
    setUploading(true);
    const paths: string[] = [];
    for (const file of Array.from(files)) {
      try {
        const { uploadURL, objectPath } = await requestUploadUrl.mutateAsync({
          data: { name: file.name, size: file.size, contentType: file.type },
        });
        await fetch(uploadURL, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
        paths.push(objectPath);
      } catch {}
    }
    setForm(f => ({ ...f, images: [...f.images, ...paths] }));
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      nameAr: form.nameAr, nameEn: form.nameEn, nameFr: form.nameFr,
      descriptionAr: form.descriptionAr, descriptionEn: form.descriptionEn, descriptionFr: form.descriptionFr,
      price: Number(form.price),
      salePrice: form.salePrice ? Number(form.salePrice) : null,
      stock: Number(form.stock),
      brand: form.brand || null,
      categoryId: form.categoryId ? Number(form.categoryId) : null,
      featured: form.featured,
      images: form.images,
    };
    if (editId) {
      await updateProduct.mutateAsync({ params: { id: editId }, data: payload });
    } else {
      await createProduct.mutateAsync({ data: payload });
    }
    await queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
    setShowDialog(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm(tr("delete") + "?")) return;
    await deleteProduct.mutateAsync({ params: { id } });
    await queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
  };

  const products = data?.products ?? [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{tr("manageProducts")}</h1>
          <Button onClick={openAdd} className="gap-2"><Plus className="w-4 h-4" />{tr("addProduct")}</Button>
        </div>

        <div className="bg-card border border-card-border rounded-2xl overflow-hidden">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
            </div>
          ) : products.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>{tr("noProducts")}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr className="text-muted-foreground text-xs uppercase">
                    <th className="text-start py-3 px-4">{tr("products")}</th>
                    <th className="text-start py-3 px-4">{tr("price")}</th>
                    <th className="text-start py-3 px-4">{tr("stock")}</th>
                    <th className="text-start py-3 px-4">{tr("category")}</th>
                    <th className="text-end py-3 px-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => {
                    const imgUrl = getImageUrl((p.images as string[])?.[0]);
                    return (
                      <tr key={p.id} className="border-t border-border hover:bg-muted/30">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted shrink-0">
                              {imgUrl ? (
                                <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                                  <span className="text-sm font-bold text-primary/30">{getName(p).charAt(0)}</span>
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-semibold line-clamp-1">{getName(p)}</p>
                              {p.brand && <p className="text-xs text-muted-foreground">{p.brand}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <span className="font-bold text-primary">{Number(p.price).toFixed(2)} {tr("currency")}</span>
                            {p.salePrice && (
                              <span className="block text-xs text-green-600">{Number(p.salePrice).toFixed(2)} {tr("currency")}</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`font-medium ${p.stock === 0 ? "text-destructive" : p.stock < 5 ? "text-orange-500" : ""}`}>
                            {p.stock}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground text-xs">
                          {p.category ? getName(p.category) : "-"}
                        </td>
                        <td className="py-3 px-4 text-end">
                          <div className="flex gap-1 justify-end">
                            <button onClick={() => openEdit(p)} className="p-1.5 hover:text-primary transition-colors rounded-lg hover:bg-primary/10">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(p.id)} className="p-1.5 hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? tr("editProduct") : tr("addProduct")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Images */}
            <div>
              <label className="text-sm font-medium mb-2 block">{tr("images")}</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {form.images.map((img, i) => {
                  const url = getImageUrl(img) ?? img;
                  return (
                    <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-border">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setForm(f => ({ ...f, images: f.images.filter((_, j) => j !== i) }))}
                        className="absolute top-0.5 end-0.5 w-5 h-5 bg-destructive text-white rounded-full flex items-center justify-center text-xs"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-20 h-20 rounded-xl border-2 border-dashed border-border hover:border-primary flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-colors text-xs"
                >
                  <ImagePlus className="w-5 h-5" />
                  {uploading ? "..." : tr("uploadImages")}
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={e => e.target.files && handleUploadImages(e.target.files)}
              />
            </div>

            {/* Names */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">{tr("nameAr")}</label>
                <Input value={form.nameAr} onChange={e => setForm(f => ({ ...f, nameAr: e.target.value }))} required dir="rtl" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">{tr("nameEn")}</label>
                <Input value={form.nameEn} onChange={e => setForm(f => ({ ...f, nameEn: e.target.value }))} required dir="ltr" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">{tr("nameFr")}</label>
                <Input value={form.nameFr} onChange={e => setForm(f => ({ ...f, nameFr: e.target.value }))} required dir="ltr" />
              </div>
            </div>

            {/* Descriptions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">{tr("descAr")}</label>
                <Textarea value={form.descriptionAr} onChange={e => setForm(f => ({ ...f, descriptionAr: e.target.value }))} rows={2} dir="rtl" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">{tr("descEn")}</label>
                <Textarea value={form.descriptionEn} onChange={e => setForm(f => ({ ...f, descriptionEn: e.target.value }))} rows={2} dir="ltr" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">{tr("descFr")}</label>
                <Textarea value={form.descriptionFr} onChange={e => setForm(f => ({ ...f, descriptionFr: e.target.value }))} rows={2} dir="ltr" />
              </div>
            </div>

            {/* Price, Sale, Stock, Brand */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">{tr("price")} ({tr("currency")})</label>
                <Input type="number" min={0} step={0.01} value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">{tr("salePrice")}</label>
                <Input type="number" min={0} step={0.01} value={form.salePrice} onChange={e => setForm(f => ({ ...f, salePrice: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">{tr("stock")}</label>
                <Input type="number" min={0} value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} required />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">{tr("brand")}</label>
                <Input value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} />
              </div>
            </div>

            {/* Category + Featured */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">{tr("category")}</label>
                <Select value={form.categoryId || "none"} onValueChange={v => setForm(f => ({ ...f, categoryId: v === "none" ? "" : v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">-</SelectItem>
                    {categories?.map(c => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.nameEn}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer pb-2">
                  <input type="checkbox" checked={form.featured} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))} className="accent-primary w-4 h-4" />
                  <span className="text-sm font-medium">{tr("featured_label")}</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>{tr("cancel")}</Button>
              <Button type="submit" disabled={createProduct.isPending || updateProduct.isPending}>
                {(createProduct.isPending || updateProduct.isPending) ? tr("loading") : tr("save")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
