import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SiteLayout from "@/components/SiteLayout";
import {
  getPublishedSiteSettingsInitial,
  getPublishedPostsInitial,
  getPublishedProductsInitial,
  listPublishedPosts,
  listPublishedProducts,
  readPublishedSiteSettings,
} from "@/lib/publicContent";
import type { CmsPost, CmsProduct, SiteSettings } from "@/types/content";

export default function Home() {
  const [blogPosts, setBlogPosts] = useState<CmsPost[]>(() => getPublishedPostsInitial());
  const [products, setProducts] = useState<CmsProduct[]>(() => getPublishedProductsInitial());
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => getPublishedSiteSettingsInitial());
  const [loadingPosts, setLoadingPosts] = useState(blogPosts.length === 0);
  const [loadingProducts, setLoadingProducts] = useState(products.length === 0);
  const [visibleCount, setVisibleCount] = useState(3);

  useEffect(() => {
    let active = true;

    async function loadPublishedContent() {
      try {
        const [nextPosts, nextProducts, nextSiteSettings] = await Promise.all([
          listPublishedPosts(),
          listPublishedProducts(),
          readPublishedSiteSettings(),
        ]);

        if (!active) {
          return;
        }

        setBlogPosts(nextPosts);
        setProducts(nextProducts);
        setSiteSettings(nextSiteSettings);
      } catch {
        if (!active) {
          return;
        }
      } finally {
        if (!active) {
          return;
        }
        setLoadingPosts(false);
        setLoadingProducts(false);
      }
    }

    loadPublishedContent();

    return () => {
      active = false;
    };
  }, []);

  const handleLoadMore = (e: React.MouseEvent) => {
    e.preventDefault();
    setVisibleCount((prev) => Math.min(prev + 3, blogPosts.length));
  };

  return (
    <SiteLayout siteSettings={siteSettings}>
      {/* HERO SECTION */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-24 md:py-32 lg:py-40">
        <div className="max-w-[500px] mx-auto w-full">
          <h5 className="font-['Montserrat'] font-[300] text-[18px] tracking-[12px] text-white mb-[34px] uppercase">
            {siteSettings.heroEyebrow}
          </h5>
          <h2 className="font-['Poppins'] font-[900] text-[52px] leading-[1.2] tracking-[-1.1px] text-[#efefef] mb-[72px] whitespace-pre-line">
            {siteSettings.heroTitle}
          </h2>
          <p className="text-[18px] text-[#e8e8e8] mb-[50px] leading-[25.2px] font-['Poppins']">
            {siteSettings.heroDescription}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <a
              href={siteSettings.heroPrimaryCtaUrl}
              className="inline-flex items-center justify-center gap-2 text-[15px] font-[600] text-white hover:text-white/60 transition-colors duration-300"
            >
              {siteSettings.heroPrimaryCtaLabel}
            </a>
            <a
              href={siteSettings.heroSecondaryCtaUrl}
              className="inline-flex items-center justify-center gap-2 text-[15px] font-[600] text-white hover:text-white/60 transition-colors duration-300"
            >
              {siteSettings.heroSecondaryCtaLabel}
            </a>
          </div>
        </div>
      </section>

      {/* PRODUCTS SECTION */}
      <section id="products" className="px-6 py-20 md:py-32">
        <div className="max-w-[750px] mx-auto text-center mb-20">
          <h5 className="font-['Montserrat'] font-[300] text-[18px] tracking-[12px] text-white mb-4 uppercase">
            {siteSettings.productsEyebrow}
          </h5>
          <h2 className="font-['Poppins'] font-[900] text-[52px] leading-[1.2] tracking-[-1.1px] text-[#efefef] mb-6">
            {siteSettings.productsTitle}
          </h2>
          <p className="text-[18px] text-[#e8e8e8] leading-[25.2px] font-['Poppins']">
            {siteSettings.productsDescription}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-[20px] gap-y-[30px] max-w-[1200px] mx-auto w-full px-6">
          {products.map((product) => (
            <Link to={`/product/${product.slug}`} key={product.id} className="block group">
              <div className="mb-6 overflow-hidden">
                {product.coverImage ? (
                  <img
                    src={product.coverImage}
                    alt={product.title}
                    className="w-full aspect-video object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full aspect-video bg-white/5" />
                )}
              </div>
              <div className="h-[66px] overflow-hidden">
                <h3 className="font-['Poppins'] font-[800] text-[22px] leading-[33px] text-[#ffffff] line-clamp-2">
                  {product.title}
                </h3>
              </div>
              <p className="text-[18px] leading-[27px] text-[#e8e8e8] mb-6 h-[27px] truncate lowercase">
                {product.excerpt}
              </p>

              <div className="border-b border-[#e8e8e8]/20 pb-4">
                <span className="font-['Poppins'] font-[700] text-[18px] text-[#ffffff] underline underline-offset-2 decoration-[1.5px] capitalize">
                  {siteSettings.productsCardCtaLabel}
                </span>
              </div>
            </Link>
          ))}
          {!loadingProducts && products.length === 0 ? (
            <div className="md:col-span-2 border border-white/10 px-6 py-12 text-center text-white/60">
              {siteSettings.productsEmptyState}
            </div>
          ) : null}
        </div>
      </section>

      {/* THE BLOG SECTION */}
      <section id="blog" className="px-6 py-20 md:py-32">
        <div className="max-w-[750px] mx-auto text-center mb-20">
          <h5 className="font-['Montserrat'] font-[300] text-[18px] tracking-[12px] text-white mb-4 uppercase">
            {siteSettings.blogEyebrow}
          </h5>
          <h2 className="font-['Poppins'] font-[900] text-[52px] leading-[1.2] tracking-[-1.1px] text-[#efefef] mb-6">
            {siteSettings.blogTitle}
          </h2>
          <p className="text-[18px] text-[#e8e8e8] leading-[25.2px] font-['Poppins']">
            {siteSettings.blogDescription}
          </p>
        </div>

        <div className="max-w-[1200px] mx-auto">
          <div className="grid md:grid-cols-3 gap-x-[20px] gap-y-[30px] mb-16">
            {blogPosts.slice(0, visibleCount).map((post) => (
              <Link to={`/post/${post.slug}`} key={post.id} className="group cursor-pointer block">
                <div className="overflow-hidden mb-6">
                  {post.coverImage ? (
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full aspect-[4/3] object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full aspect-[4/3] bg-white/5" />
                  )}
                </div>
                <div className="h-[66px] mb-3 overflow-hidden">
                  <h4 className="font-['Poppins'] font-[800] text-[22px] leading-[33px] tracking-[-0.6px] text-[#ffffff] group-hover:text-[#e8e8e8]/60 transition-colors line-clamp-2">
                    {post.title}
                  </h4>
                </div>
                <div className="h-[27px] mb-6 overflow-hidden">
                  <p className="text-[#ffffff] text-[18px] leading-[27px] font-[400] truncate">
                    {post.excerpt}
                  </p>
                </div>
                <div className="flex flex-col border-b border-[#e8e8e8]/20 pb-4 mb-4">
                  <span className="text-[18px] capitalize text-[#ffffff] font-[700] group-hover:text-[#e8e8e8]/60 transition-colors inline-block underline underline-offset-2 decoration-[1.5px] decoration-[#ffffff] group-hover:decoration-[#e8e8e8]/60 self-start">{siteSettings.blogCardCtaLabel}</span>
                </div>
                <div className="flex items-center text-[14px] font-[400] text-[#e8e8e8] italic font-serif">
                  <span>{post.authorName}</span>
                  <span className="mx-2 not-italic text-[12px]">•</span>
                  <span>{post.date}</span>
                </div>
              </Link>
            ))}
          </div>

          {!loadingPosts && blogPosts.length === 0 ? (
            <div className="border border-white/10 px-6 py-12 text-center text-white/60 mb-16">
              {siteSettings.blogEmptyState}
            </div>
          ) : null}
          
          {visibleCount < blogPosts.length && (
            <div className="text-center">
              <a
                href="#"
                onClick={handleLoadMore}
                className="inline-flex items-center justify-center border border-[#e8e8e8] text-[#e8e8e8] px-[24px] py-[12px] text-[15px] font-[600] hover:border-[#e8e8e8]/65 hover:text-[#e8e8e8]/65 transition-colors duration-300"
              >
                {siteSettings.blogLoadMoreLabel}
              </a>
            </div>
          )}
        </div>
      </section>

      {/* ABOUT ME SECTION */}
      <section className="px-6 py-20 md:py-32">
        <div className="max-w-[750px] mx-auto text-center mb-16">
          <h5 className="font-['Montserrat'] font-[300] text-[18px] tracking-[12px] text-white mb-4 uppercase">
            {siteSettings.aboutEyebrow}
          </h5>
          <h2 className="font-['Poppins'] font-[900] text-[52px] leading-[1.2] tracking-[-1.1px] text-[#efefef] mb-6">
            {siteSettings.aboutTitle}
          </h2>
          <p className="text-[18px] text-[#e8e8e8] leading-[25.2px] font-['Poppins']">
            {siteSettings.aboutDescription}
          </p>
        </div>
        
        <div className="max-w-[1200px] mx-auto grid md:grid-cols-[1fr_2fr] gap-12 items-start">
          <div>
            <img 
              src={siteSettings.aboutAvatarUrl}
              alt="Author" 
              className="w-full h-auto mb-6"
            />
            <div className="flex gap-4">
              {siteSettings.aboutSocialLinks.map((link) => (
                <a
                  key={`${link.label}-${link.url}`}
                  href={link.url || "#"}
                  className="text-[15px] font-semibold text-white hover:text-white/60 transition-colors"
                  target={link.url ? "_blank" : undefined}
                  rel={link.url ? "noreferrer" : undefined}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
          <div className="space-y-6 text-[#e8e8e8] text-[18px] leading-[25.2px]">
            <h3 className="font-['Poppins'] font-[900] text-[24px] tracking-[-0.6px] text-[#efefef] mb-6">
              {siteSettings.aboutIntroHeading}
            </h3>
            {siteSettings.aboutParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
