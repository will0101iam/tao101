import { useEffect, useRef, useState } from "react";
import PostEditor from "@/pages/admin/PostEditor";
import { deletePost, getAdminPosts, listPosts } from "@/lib/cms";
import { useSyncedAdminListHeight } from "@/hooks/useSyncedAdminListHeight";
import type { CmsPost } from "@/types/content";

export default function PostList() {
  const [posts, setPosts] = useState<CmsPost[]>([]);
  const [editing, setEditing] = useState<CmsPost | null>(null);
  const [creating, setCreating] = useState(false);
  const listShellRef = useRef<HTMLDivElement | null>(null);
  const editorColumnRef = useRef<HTMLDivElement | null>(null);
  const syncedListHeight = useSyncedAdminListHeight(listShellRef, editorColumnRef, [
    creating,
    editing?.id ?? null,
    posts.length,
  ]);

  useEffect(() => {
    listPosts().then(setPosts).catch(() => setPosts(getAdminPosts()));
  }, []);

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this post?")) {
      return;
    }
    await deletePost(id);
    setPosts(getAdminPosts());
    if (editing?.id === id) {
      setEditing(null);
    }
  }

  return (
    <div className="grid lg:grid-cols-[360px_1fr] gap-10">
      <div data-testid="admin-list-column" className="lg:self-start">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-['Poppins'] text-[24px] font-[900]">Posts</h2>
          <button className="px-4 py-2 border border-white/10 text-white/70 hover:border-white/30 hover:text-white transition-colors" onClick={() => { setCreating(true); setEditing(null); }}>
            New Post
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
            {posts.map((post) => (
              <button key={post.id} className="w-full text-left border border-white/10 p-4 hover:border-white/30 transition-colors" onClick={() => { setEditing(post); setCreating(false); }}>
                <div className="flex items-center justify-between gap-3 mb-2">
                  <h3 className="font-['Poppins'] font-[700] text-[18px] leading-6">{post.title}</h3>
                  <span className="text-xs uppercase tracking-[4px] text-white/40">{post.status}</span>
                </div>
                <p className="text-sm text-white/60 line-clamp-2">{post.excerpt}</p>
                <div className="flex items-center justify-between mt-4 text-xs text-white/40">
                  <span>{post.date}</span>
                  <span onClick={(event) => { event.stopPropagation(); handleDelete(post.id); }} className="cursor-pointer hover:text-[#ff9d9d]">Delete</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
      <div ref={editorColumnRef} data-testid="admin-editor-column">
        {creating ? (
          <PostEditor onSaved={(post) => { setPosts(getAdminPosts()); setEditing(post); setCreating(false); }} onCancel={() => setCreating(false)} />
        ) : editing ? (
          <PostEditor post={editing} onSaved={(post) => { setPosts(getAdminPosts()); setEditing(post); }} onCancel={() => setEditing(null)} />
        ) : (
          <div className="border border-white/10 p-8 text-white/60">Select a post or create a new one.</div>
        )}
      </div>
    </div>
  );
}
