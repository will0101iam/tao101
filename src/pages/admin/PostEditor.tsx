import { useEffect, useMemo, useRef, useState } from "react";
import { ImageUp } from "lucide-react";
import RichTextEditor from "@/components/editor/RichTextEditor";
import { savePost, uploadImage } from "@/lib/cms";
import type { CmsPost, CoverSource } from "@/types/content";

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

function extractBodyImageUrls(content: string) {
  const matches = Array.from(content.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)).map((match) => match[1]?.replace(/&amp;/g, "&") ?? "");
  return Array.from(new Set(matches.filter(Boolean)));
}

export default function PostEditor({
  post,
  onSaved,
  onCancel,
  uploadImageFn = uploadImage,
}: {
  post?: CmsPost;
  onSaved: (post: CmsPost) => void;
  onCancel?: () => void;
  uploadImageFn?: (file: File) => Promise<string>;
}) {
  const [title, setTitle] = useState(post?.title ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [date, setDate] = useState(toDateInputValue(post?.date));
  const [coverImage, setCoverImage] = useState(post?.coverImage ?? "");
  const [coverSource, setCoverSource] = useState<CoverSource | undefined>(post?.coverSource);
  const [content, setContent] = useState(post?.content ?? "<p></p>");
  const [status, setStatus] = useState<CmsPost["status"]>(post?.status ?? "draft");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const selectedCoverRef = useRef<HTMLDivElement | null>(null);
  const lastSavedPostKeyRef = useRef<string | null>(null);

  const submitLabel = useMemo(() => (status === "published" ? "Publish" : "Save Draft"), [status]);
  const bodyImageOptions = useMemo(() => extractBodyImageUrls(content), [content]);

  useEffect(() => {
    const currentPostKey = post ? `${post.id}:${post.updatedAt}` : null;

    setTitle(post?.title ?? "");
    setExcerpt(post?.excerpt ?? "");
    setDate(toDateInputValue(post?.date));
    setCoverImage(post?.coverImage ?? "");
    setCoverSource(post?.coverSource);
    setContent(post?.content ?? "<p></p>");
    setStatus(post?.status ?? "draft");
    setError("");

    if (currentPostKey !== lastSavedPostKeyRef.current) {
      setSuccessMessage("");
    }
  }, [post]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccessMessage("");
    try {
      const saved = await savePost({
        id: post?.id,
        slug: post?.slug,
        title,
        excerpt,
        date,
        coverImage,
        coverSource,
        content,
        status,
        authorName: post?.authorName ?? "Guotao Tao",
      });
      lastSavedPostKeyRef.current = `${saved.id}:${saved.updatedAt}`;
      onSaved(saved);
      setSuccessMessage(saved.status === "published" ? "Post published." : "Draft saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save post.");
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
      setCoverSource("upload");
      requestAnimationFrame(() => {
        selectedCoverRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload cover image.");
    } finally {
      event.target.value = "";
    }
  }

  function handleSelectArticleCover(imageUrl: string) {
    setCoverImage(imageUrl);
    setCoverSource("article");
    requestAnimationFrame(() => {
      selectedCoverRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <label className="block">
        <span className="block mb-2 text-sm text-white/70">Title</span>
        <input aria-label="Title" className="w-full bg-black border border-white/10 px-4 py-3 outline-none focus:border-white/30" value={title} onChange={(event) => setTitle(event.target.value)} />
      </label>
      <label className="block">
        <span className="block mb-2 text-sm text-white/70">Excerpt</span>
        <textarea aria-label="Excerpt" className="w-full min-h-[100px] bg-black border border-white/10 px-4 py-3 outline-none focus:border-white/30" value={excerpt} onChange={(event) => setExcerpt(event.target.value)} />
      </label>
      <div className="grid md:grid-cols-2 gap-5">
        <label className="block">
          <span className="block mb-2 text-sm text-white/70">Publish Date</span>
          <input type="date" className="w-full bg-black border border-white/10 px-4 py-3 outline-none focus:border-white/30" value={date} onChange={(event) => setDate(event.target.value)} />
        </label>
        <label className="block">
          <span className="block mb-2 text-sm text-white/70">Status</span>
          <select className="w-full bg-black border border-white/10 px-4 py-3 outline-none focus:border-white/30" value={status} onChange={(event) => setStatus(event.target.value as CmsPost["status"])}>
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
              Cover image is the top hero image. Body images stay in the editor content below.
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
        <div
          ref={selectedCoverRef}
          className={`space-y-2 border bg-[#080808] p-3 transition-colors ${
            coverImage ? "border-white/10" : "border-dashed border-white/12"
          }`}
        >
          <div className="text-xs uppercase tracking-[0.2em] text-white/40">Selected Cover</div>
          {coverImage ? (
            <img src={coverImage} alt={title || "Selected cover preview"} className="w-full max-h-[280px] object-cover" />
          ) : (
            <div className="flex min-h-[180px] items-center justify-center text-sm text-white/35">
              Upload a cover or choose one from the article below.
            </div>
          )}
        </div>
        <div className="space-y-3">
          <div className="text-sm text-white/45">
            Select a cover from images already used in the article body.
          </div>
          {bodyImageOptions.length ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {bodyImageOptions.map((imageUrl, index) => (
                <button
                  key={imageUrl}
                  type="button"
                  aria-label={`Use body image ${index + 1} as cover`}
                  className={`overflow-hidden border bg-[#080808] text-left transition-colors ${
                    coverImage === imageUrl ? "border-[#e0c787]" : "border-white/10 hover:border-white/25"
                  }`}
                  onClick={() => handleSelectArticleCover(imageUrl)}
                >
                  <img src={imageUrl} alt="" className="h-28 w-full object-cover" />
                  <div className="border-t border-white/10 px-3 py-2 text-xs text-white/55">
                    Body image {index + 1}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-white/40">
              Insert an image into the article body to select it as a cover.
            </p>
          )}
        </div>
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
