import { useEffect, useMemo, useRef, useState } from "react";
import { ImageUp } from "lucide-react";
import RichTextEditor from "@/components/editor/RichTextEditor";
import { saveProduct, uploadImage } from "@/lib/cms";
import type { CmsProduct } from "@/types/content";

function toDateInputValue(value: string | undefined) {
  if (!value) {
    return new Date().toISOString().slice(0, 10);
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dedupeStrings(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

export default function ProductEditor({
  product,
  onSaved,
  onCancel,
  uploadImageFn = uploadImage,
}: {
  product?: CmsProduct;
  onSaved: (product: CmsProduct) => void;
  onCancel?: () => void;
  uploadImageFn?: (file: File) => Promise<string>;
}) {
  const [title, setTitle] = useState(product?.title ?? "");
  const [excerpt, setExcerpt] = useState(product?.excerpt ?? "");
  const [date, setDate] = useState(toDateInputValue(product?.date));
  const [coverImage, setCoverImage] = useState(product?.coverImage ?? "");
  const [screenshots, setScreenshots] = useState(product?.screenshots ?? []);
  const [content, setContent] = useState(product?.content ?? "<p></p>");
  const [ctaLabel, setCtaLabel] = useState(product?.ctaLabel ?? "");
  const [ctaUrl, setCtaUrl] = useState(product?.ctaUrl ?? "");
  const [status, setStatus] = useState<CmsProduct["status"]>(product?.status ?? "draft");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const screenshotInputRef = useRef<HTMLInputElement | null>(null);
  const lastSavedProductKeyRef = useRef<string | null>(null);

  const submitLabel = useMemo(() => (status === "published" ? "Publish" : "Save Draft"), [status]);

  useEffect(() => {
    const currentProductKey = product ? `${product.id}:${product.updatedAt}` : null;

    setTitle(product?.title ?? "");
    setExcerpt(product?.excerpt ?? "");
    setDate(toDateInputValue(product?.date));
    setCoverImage(product?.coverImage ?? "");
    setScreenshots(product?.screenshots ?? []);
    setContent(product?.content ?? "<p></p>");
    setCtaLabel(product?.ctaLabel ?? "");
    setCtaUrl(product?.ctaUrl ?? "");
    setStatus(product?.status ?? "draft");
    setError("");

    if (currentProductKey !== lastSavedProductKeyRef.current) {
      setSuccessMessage("");
    }
  }, [product]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccessMessage("");
    try {
      const saved = await saveProduct({
        id: product?.id,
        slug: product?.slug,
        title,
        excerpt,
        date,
        coverImage,
        screenshots,
        content,
        ctaLabel,
        ctaUrl,
        status,
      });
      lastSavedProductKeyRef.current = `${saved.id}:${saved.updatedAt}`;
      onSaved(saved);
      setSuccessMessage(saved.status === "published" ? "Product published." : "Draft saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save product.");
    } finally {
      setSaving(false);
    }
  }

  async function handleCoverImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setError("");
    try {
      const imageUrl = await uploadImageFn(file);
      setCoverImage(imageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload cover image.");
    } finally {
      event.target.value = "";
    }
  }

  async function handleScreenshotUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) {
      return;
    }

    setError("");
    try {
      const uploadedUrls = await Promise.all(files.map((file) => uploadImageFn(file)));
      setScreenshots((current) => dedupeStrings([...current, ...uploadedUrls]));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload screenshots.");
    } finally {
      event.target.value = "";
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <label className="block">
        <span className="block mb-2 text-sm text-white/70">Title</span>
        <input
          aria-label="Title"
          className="w-full bg-black border border-white/10 px-4 py-3 outline-none focus:border-white/30"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </label>
      <label className="block">
        <span className="block mb-2 text-sm text-white/70">Excerpt</span>
        <textarea
          aria-label="Excerpt"
          className="w-full min-h-[100px] bg-black border border-white/10 px-4 py-3 outline-none focus:border-white/30"
          value={excerpt}
          onChange={(event) => setExcerpt(event.target.value)}
        />
      </label>
      <div className="grid md:grid-cols-2 gap-5">
        <label className="block">
          <span className="block mb-2 text-sm text-white/70">Publish Date</span>
          <input
            type="date"
            className="w-full bg-black border border-white/10 px-4 py-3 outline-none focus:border-white/30"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </label>
        <label className="block">
          <span className="block mb-2 text-sm text-white/70">Status</span>
          <select className="w-full bg-black border border-white/10 px-4 py-3 outline-none focus:border-white/30" value={status} onChange={(event) => setStatus(event.target.value as CmsProduct["status"])}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </label>
      </div>
      <div className="space-y-4 border border-white/10 bg-[#050505] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-white">Cover Media</p>
            <p className="text-sm text-white/45">
              Cover image stays separate from the product screenshot gallery.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white/75 transition-colors hover:border-white/25 hover:text-white"
              onClick={() => coverInputRef.current?.click()}
            >
              <ImageUp size={15} />
              Upload Cover
            </button>
            <input
              ref={coverInputRef}
              aria-label="Upload cover image"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverImageUpload}
            />
          </div>
        </div>
        <div className={`space-y-2 border bg-[#080808] p-3 transition-colors ${coverImage ? "border-white/10" : "border-dashed border-white/12"}`}>
          <div className="text-xs uppercase tracking-[0.2em] text-white/40">Selected Cover</div>
          {coverImage ? (
            <img src={coverImage} alt={title || "Selected cover preview"} className="w-full max-h-[280px] object-cover" />
          ) : (
            <div className="flex min-h-[180px] items-center justify-center text-sm text-white/35">
              Upload a dedicated cover image for this product.
            </div>
          )}
        </div>
      </div>
      <div className="space-y-4 border border-white/10 bg-[#050505] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-white">Screenshot Gallery</p>
            <p className="text-sm text-white/45">
              Upload interface shots separately from the hero cover.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white/75 transition-colors hover:border-white/25 hover:text-white"
              onClick={() => screenshotInputRef.current?.click()}
            >
              <ImageUp size={15} />
              Upload Screenshots
            </button>
            <input
              ref={screenshotInputRef}
              aria-label="Upload screenshot images"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleScreenshotUpload}
            />
          </div>
        </div>
        {screenshots.length ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {screenshots.map((imageUrl, index) => (
              <div key={`${imageUrl}-${index}`} className="overflow-hidden border border-white/10 bg-[#080808]">
                <img src={imageUrl} alt={`Screenshot ${index + 1}`} className="h-36 w-full object-cover" />
                <div className="border-t border-white/10 px-3 py-2 text-xs text-white/55">
                  Screenshot {index + 1}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex min-h-[140px] items-center justify-center border border-dashed border-white/12 bg-[#080808] text-sm text-white/35">
            Upload product screenshots to build the gallery.
          </div>
        )}
      </div>
      <div className="grid md:grid-cols-2 gap-5">
        <label className="block">
          <span className="block mb-2 text-sm text-white/70">CTA Label</span>
          <input
            aria-label="CTA Label"
            className="w-full bg-black border border-white/10 px-4 py-3 outline-none focus:border-white/30"
            value={ctaLabel}
            onChange={(event) => setCtaLabel(event.target.value)}
          />
        </label>
        <label className="block">
          <span className="block mb-2 text-sm text-white/70">CTA URL</span>
          <input
            aria-label="CTA URL"
            className="w-full bg-black border border-white/10 px-4 py-3 outline-none focus:border-white/30"
            value={ctaUrl}
            onChange={(event) => setCtaUrl(event.target.value)}
          />
        </label>
      </div>
      <div>
        <span className="block mb-2 text-sm text-white/70">Body</span>
        <RichTextEditor value={content} onChange={setContent} onImageUpload={uploadImageFn} />
      </div>
      {successMessage ? <p className="text-sm text-[#d8c07d]">{successMessage}</p> : null}
      {error ? <p className="text-sm text-[#ff9d9d]">{error}</p> : null}
      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={saving} className="px-5 py-3 bg-[#efefef] text-black font-['Poppins'] font-[700] hover:bg-[#e0c787] transition-colors disabled:opacity-60">
          {saving ? "Saving…" : submitLabel}
        </button>
        {onCancel ? (
          <button type="button" className="px-5 py-3 border border-white/10 text-white/70 hover:border-white/30 hover:text-white transition-colors" onClick={onCancel}>
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}
