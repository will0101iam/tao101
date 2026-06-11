import { useEffect, useRef, useState } from "react";
import ProductEditor from "@/pages/admin/ProductEditor";
import { deleteProduct, getAdminProducts, getSiteSettingsInitial, listProducts, loadSiteSettings } from "@/lib/cms";
import { useSyncedAdminListHeight } from "@/hooks/useSyncedAdminListHeight";
import type { CmsProduct, SiteSettings } from "@/types/content";

export default function ProductList() {
  const [products, setProducts] = useState<CmsProduct[]>([]);
  const [editing, setEditing] = useState<CmsProduct | null>(null);
  const [creating, setCreating] = useState(false);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => getSiteSettingsInitial());
  const listShellRef = useRef<HTMLDivElement | null>(null);
  const editorColumnRef = useRef<HTMLDivElement | null>(null);
  const syncedListHeight = useSyncedAdminListHeight(listShellRef, editorColumnRef, [
    creating,
    editing?.id ?? null,
    products.length,
  ]);

  useEffect(() => {
    listProducts().then(setProducts).catch(() => setProducts(getAdminProducts()));
    loadSiteSettings().then(setSiteSettings).catch(() => setSiteSettings(getSiteSettingsInitial()));
  }, []);

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this product?")) {
      return;
    }
    await deleteProduct(id);
    setProducts(getAdminProducts());
    if (editing?.id == id) {
      setEditing(null);
    }
  }

  return (
    <div className="grid lg:grid-cols-[360px_1fr] gap-10">
      <div data-testid="admin-list-column" className="lg:self-start">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-['Poppins'] text-[24px] font-[900]">Products</h2>
          <button className="px-4 py-2 border border-white/10 text-white/70 hover:border-white/30 hover:text-white transition-colors" onClick={() => { setCreating(true); setEditing(null); }}>
            New Product
          </button>
        </div>
        <div
          ref={listShellRef}
          data-testid="admin-list-shell"
          className="border border-white/10 bg-[#050505] overflow-hidden"
          style={syncedListHeight ? { height: `${syncedListHeight}px` } : undefined}
        >
          <div
            data-testid="admin-list-scroll"
            className="h-full space-y-3 overflow-y-auto p-3"
            style={syncedListHeight ? { height: `${syncedListHeight}px` } : undefined}
          >
            {products.map((product) => (
              <button key={product.id} className="w-full text-left border border-white/10 p-4 hover:border-white/30 transition-colors" onClick={() => { setEditing(product); setCreating(false); }}>
                <div className="flex items-center justify-between gap-3 mb-2">
                  <h3 className="font-['Poppins'] font-[700] text-[18px] leading-6">{product.title}</h3>
                  <span className="text-xs uppercase tracking-[4px] text-white/40">{product.status}</span>
                </div>
                <p className="text-sm text-white/60 line-clamp-2">{product.excerpt}</p>
                <div className="flex items-center justify-between mt-4 text-xs text-white/40">
                  <span>{product.date || siteSettings.adminProductNoDateLabel}</span>
                  <span onClick={(event) => { event.stopPropagation(); handleDelete(product.id); }} className="cursor-pointer hover:text-[#ff9d9d]">Delete</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
      <div ref={editorColumnRef} data-testid="admin-editor-column">
        {creating ? (
          <ProductEditor onSaved={(product) => { setProducts(getAdminProducts()); setEditing(product); setCreating(false); }} onCancel={() => setCreating(false)} />
        ) : editing ? (
          <ProductEditor product={editing} onSaved={(product) => { setProducts(getAdminProducts()); setEditing(product); }} onCancel={() => setEditing(null)} />
        ) : (
          <div className="border border-white/10 p-8 text-white/60">{siteSettings.adminProductsEmptyState}</div>
        )}
      </div>
    </div>
  );
}
