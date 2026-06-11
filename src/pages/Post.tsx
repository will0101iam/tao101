import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import SiteLayout from "@/components/SiteLayout";
import {
  findPublishedPost,
  getPublishedPostInitial,
  getPublishedSiteSettingsInitial,
  readPublishedSiteSettings,
} from "@/lib/publicContent";
import type { CmsPost, SiteSettings } from "@/types/content";

export default function Post() {
  const { id } = useParams();
  const [post, setPost] = useState<CmsPost | null>(() => getPublishedPostInitial(id) ?? null);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => getPublishedSiteSettingsInitial());
  const [loading, setLoading] = useState(post === null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    let active = true;

    async function loadSiteSettings() {
      try {
        const nextSiteSettings = await readPublishedSiteSettings();
        if (active) {
          setSiteSettings(nextSiteSettings);
        }
      } catch {
        if (active) {
          setSiteSettings(getPublishedSiteSettingsInitial());
        }
      }
    }

    async function loadPost() {
      try {
        const nextPost = await findPublishedPost(id);
        if (!active) {
          return;
        }
        setPost(nextPost ?? null);
      } catch {
        if (!active) {
          return;
        }
        setPost(null);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadSiteSettings();
    loadPost();

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <SiteLayout siteSettings={siteSettings}>
        <div className="min-h-[50vh] flex items-center justify-center text-white/60 px-6">
          {siteSettings.postLoadingLabel}
        </div>
      </SiteLayout>
    );
  }

  if (!post) {
    return (
      <SiteLayout siteSettings={siteSettings}>
        <div className="min-h-[50vh] flex flex-col items-center justify-center text-white px-6">
          <h1 className="text-4xl font-['Poppins'] font-black mb-4">{siteSettings.postNotFoundTitle}</h1>
          <Link to="/" className="text-[#e8e8e8] hover:text-white transition-colors underline">
            {siteSettings.returnHomeLabel}
          </Link>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout siteSettings={siteSettings}>
      <article className="pt-20 pb-32 px-6">
        <div className="max-w-[600px] mx-auto">
          {/* Guotao Tao Style Header */}
          <div className="mb-12">
            <h1 className="font-['Poppins'] font-[900] text-[40px] leading-[1] text-[#e8e8e8] mb-6">
              {post.title}
            </h1>
            <div className="flex items-center text-[14px] font-[400] text-[#e8e8e8] italic font-serif">
              <span>{post.authorName}</span>
              <span className="mx-2 not-italic text-[12px]">•</span>
              <span>{post.date}</span>
            </div>
          </div>
          
          {/* Post Image */}
          {post.coverImage ? (
            <div className="mb-12">
              <img 
                src={post.coverImage} 
                alt={post.title}
                className="w-full h-auto object-cover"
              />
            </div>
          ) : null}

          {/* Post Content */}
          <div 
            className="post-content content-surface font-['Poppins'] text-[18px] leading-[25.2px] text-[#e8e8e8]"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>
      </article>
    </SiteLayout>
  );
}
