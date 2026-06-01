import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SiteLayout from "@/components/SiteLayout";
import {
  getPublishedPostsInitial,
  getPublishedProductsInitial,
  listPublishedPosts,
  listPublishedProducts,
} from "@/lib/publicContent";
import type { CmsPost, CmsProduct } from "@/types/content";

export default function Home() {
  const [blogPosts, setBlogPosts] = useState<CmsPost[]>(() => getPublishedPostsInitial());
  const [products, setProducts] = useState<CmsProduct[]>(() => getPublishedProductsInitial());
  const [loadingPosts, setLoadingPosts] = useState(blogPosts.length === 0);
  const [loadingProducts, setLoadingProducts] = useState(products.length === 0);
  const [visibleCount, setVisibleCount] = useState(3);

  useEffect(() => {
    let active = true;

    async function loadPublishedContent() {
      try {
        const [nextPosts, nextProducts] = await Promise.all([
          listPublishedPosts(),
          listPublishedProducts(),
        ]);

        if (!active) {
          return;
        }

        setBlogPosts(nextPosts);
        setProducts(nextProducts);
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
    <SiteLayout>
      {/* HERO SECTION */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-24 md:py-32 lg:py-40">
        <div className="max-w-[500px] mx-auto w-full">
          <h5 className="font-['Montserrat'] font-[300] text-[18px] tracking-[12px] text-white mb-[74px] uppercase">
            GUOTAO TAO
          </h5>
          <h2 className="font-['Poppins'] font-[900] text-[52px] leading-[1.2] tracking-[-1.1px] text-[#efefef] mb-[102px]">
            Build.<br />
            Break.<br />
            Repeat.
          </h2>
          <p className="text-[18px] text-[#e8e8e8] mb-[50px] leading-[25.2px] font-['Poppins']">
            Exploring the intersection of AI, product design, and continuous learning. I build tools and share insights on navigating the digital frontier.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <a
              href="#products"
              className="inline-flex items-center justify-center gap-2 text-[15px] font-[600] text-white hover:text-white/60 transition-colors duration-300"
            >
              Explore My Products
            </a>
            <a
              href="#blog"
              className="inline-flex items-center justify-center gap-2 text-[15px] font-[600] text-white hover:text-white/60 transition-colors duration-300"
            >
              Read My Writings
            </a>
          </div>
        </div>
      </section>

      {/* PRODUCTS SECTION */}
      <section id="products" className="px-6 py-20 md:py-32">
        <div className="max-w-[750px] mx-auto text-center mb-20">
          <h5 className="font-['Montserrat'] font-[300] text-[18px] tracking-[12px] text-white mb-4 uppercase">
            PRODUCTS
          </h5>
          <h2 className="font-['Poppins'] font-[900] text-[52px] leading-[1.2] tracking-[-1.1px] text-[#efefef] mb-6">
            Manifesting Necessity
          </h2>
          <p className="text-[18px] text-[#e8e8e8] leading-[25.2px] font-['Poppins']">
            Vibe coding experiments, AI agents, and practical tools to accelerate your workflow.
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
                  Explore Tool
                </span>
              </div>
            </Link>
          ))}
          {!loadingProducts && products.length === 0 ? (
            <div className="md:col-span-2 border border-white/10 px-6 py-12 text-center text-white/60">
              No published products yet.
            </div>
          ) : null}
        </div>
      </section>

      {/* THE BLOG SECTION */}
      <section id="blog" className="px-6 py-20 md:py-32">
        <div className="max-w-[750px] mx-auto text-center mb-20">
          <h5 className="font-['Montserrat'] font-[300] text-[18px] tracking-[12px] text-white mb-4 uppercase">
            THE BLOG
          </h5>
          <h2 className="font-['Poppins'] font-[900] text-[52px] leading-[1.2] tracking-[-1.1px] text-[#efefef] mb-6">
            Explore Your Curiosity
          </h2>
          <p className="text-[18px] text-[#e8e8e8] leading-[25.2px] font-['Poppins']">
            Deep dives on human potential, lifestyle design, & digital business.
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
                  <span className="text-[18px] capitalize text-[#ffffff] font-[700] group-hover:text-[#e8e8e8]/60 transition-colors inline-block underline underline-offset-2 decoration-[1.5px] decoration-[#ffffff] group-hover:decoration-[#e8e8e8]/60 self-start">Read Full Post</span>
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
              No published posts yet.
            </div>
          ) : null}
          
          {visibleCount < blogPosts.length && (
            <div className="text-center">
              <a
                href="#"
                onClick={handleLoadMore}
                className="inline-flex items-center justify-center border border-[#e8e8e8] text-[#e8e8e8] px-[24px] py-[12px] text-[15px] font-[600] hover:border-[#e8e8e8]/65 hover:text-[#e8e8e8]/65 transition-colors duration-300"
              >
                Load More
              </a>
            </div>
          )}
        </div>
      </section>

      {/* ABOUT ME SECTION */}
      <section className="px-6 py-20 md:py-32">
        <div className="max-w-[750px] mx-auto text-center mb-16">
          <h5 className="font-['Montserrat'] font-[300] text-[18px] tracking-[12px] text-white mb-4 uppercase">
            ABOUT ME
          </h5>
          <h2 className="font-['Poppins'] font-[900] text-[52px] leading-[1.2] tracking-[-1.1px] text-[#efefef] mb-6">
            Who Is Guotao Tao?
          </h2>
          <p className="text-[18px] text-[#e8e8e8] leading-[25.2px] font-['Poppins']">
            Just a human obsessed with humans.
          </p>
        </div>
        
        <div className="max-w-[1200px] mx-auto grid md:grid-cols-[1fr_2fr] gap-12 items-start">
          <div>
            <img 
              src="https://thedankoe.com/wp-content/uploads/2024/11/pfp23.jpg" 
              alt="Author" 
              className="w-full h-auto mb-6"
            />
            <div className="flex gap-4">
              <a href="#" className="text-[15px] font-semibold text-white hover:text-white/60 transition-colors">Twitter</a>
              <a href="#" className="text-[15px] font-semibold text-white hover:text-white/60 transition-colors">Youtube</a>
              <a href="#" className="text-[15px] font-semibold text-white hover:text-white/60 transition-colors">Linkedin</a>
            </div>
          </div>
          <div className="space-y-6 text-[#e8e8e8] text-[18px] leading-[25.2px]">
            <h3 className="font-['Poppins'] font-[900] text-[24px] tracking-[-0.6px] text-[#efefef] mb-6">Hey, I'm Guotao Tao.</h3>
            <p>
              I'm the creator of this space, and a writer obsessed with the mind, the internet, and the future.
            </p>
            <p>
              Previously, I was a brand advisor for creators and influencers. Now I teach writing as a way to discover your life's work, secure your future, and enjoy a creative lifestyle.
            </p>
            <p>
              <strong>For those wondering, I am not accepting calls, clients, or "chats to pick my brain" at the moment. If you'd like to learn from me, grab one of my courses above.</strong>
            </p>
            <p className="font-['Poppins'] font-[900] text-[24px] tracking-[-0.6px] text-[#efefef] mt-8">
              Build. Break. Repeat.
            </p>
            <p>
              I dive deep into human potential, lifestyle design, and one-person businesses to give you a unique, digestible way of improving your life.
            </p>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
