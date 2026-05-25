import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Link as LinkIcon } from "lucide-react";
import SiteLayout from "@/components/SiteLayout";
import { BLOG_POSTS } from "@/data";

export default function Home() {
  const [visibleCount, setVisibleCount] = useState(3);

  const handleLoadMore = (e: React.MouseEvent) => {
    e.preventDefault();
    setVisibleCount(prev => Math.min(prev + 3, BLOG_POSTS.length));
  };

  return (
    <SiteLayout>
      {/* HERO SECTION */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-24 md:py-32 lg:py-40">
        <div className="max-w-[500px] mx-auto w-full">
          <h5 className="font-['Montserrat'] font-[300] text-[18px] tracking-[12px] text-white mb-6 uppercase">
            REY TAO
          </h5>
          <h2 className="font-['Poppins'] font-[900] text-[52px] leading-[1.2] tracking-[-1.1px] text-[#efefef] mb-8">
            Build.<br />
            Break.<br />
            Repeat.
          </h2>
          <p className="text-[18px] text-[#e8e8e8] mb-10 leading-[25.2px] font-['Poppins']">
            Exploring the intersection of AI, product design, and continuous learning. I build tools and share insights on navigating the digital frontier.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <a
              href="#blog"
              className="inline-flex items-center justify-center gap-2 text-[15px] font-[600] text-white hover:text-white/60 transition-colors duration-300"
            >
              Read My Writings
            </a>
            <a
              href="#products"
              className="inline-flex items-center justify-center gap-2 text-[15px] font-[600] text-white hover:text-white/60 transition-colors duration-300"
            >
              Explore My Products
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
            Tools I've Built
          </h2>
          <p className="text-[18px] text-[#e8e8e8] leading-[25.2px] font-['Poppins']">
            Vibe coding experiments, AI agents, and practical tools to accelerate your workflow.
          </p>
        </div>

        <div className="max-w-[1200px] mx-auto">
          {/* Featured Product */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-32">
            <div className="order-2 md:order-1">
              <h5 className="font-['Montserrat'] font-[300] text-[18px] tracking-[12px] text-white mb-4 uppercase">
                PRE-ORDER NOW
              </h5>
              <h2 className="font-['Poppins'] font-[900] text-[52px] leading-[1.2] tracking-[-1.1px] text-[#efefef] mb-6">
                The Art Of Focus Keepsake Edition
              </h2>
              <p className="text-[18px] text-[#e8e8e8] mb-10 leading-[25.2px] font-['Poppins']">
                <strong>Only 2,000 copies available.</strong> Find meaning, reinvent yourself, and create your ideal future with a once in a lifetime opportunity.
              </p>
              <a
                href="#"
                className="inline-flex items-center justify-center bg-[#e0c787] border border-[#e0c787] text-white px-[24px] py-[12px] text-[15px] font-semibold hover:bg-[#efefef] hover:text-[#e0c787] hover:border-[#efefef] transition-colors duration-300"
              >
                Pre-Order Now
              </a>
            </div>
            <div className="order-1 md:order-2">
              <img 
                src="https://thedankoe.com/wp-content/uploads/2023/10/1-square-768x768.jpg" 
                alt="Keepsake Box" 
                className="w-full h-auto object-cover"
              />
            </div>
          </div>

          {/* Other Resources Grid */}
          <div className="grid md:grid-cols-2 gap-x-[30px] gap-y-16">
            <div className="flex flex-col">
              <a href="#" className="block mb-6 overflow-hidden">
                <img src="https://thedankoe.com/wp-content/uploads/2022/04/featured-1024x576.jpg" alt="Future Proof" className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500" />
              </a>
              <h3 className="font-['Poppins'] font-[900] text-[24px] tracking-[-0.6px] text-[#efefef] mb-4">
                Future Proof - Premium Guides
              </h3>
              <p className="text-[#e8e8e8] text-[18px] leading-[25.2px] mb-6 flex-grow font-['Poppins']">
                <strong>My personal content creation, marketing, and AI systems</strong> I used as a creator and founder, updated 2-4x a month.
              </p>
              <div>
                <a href="#" className="inline-flex items-center gap-2 text-[15px] font-[600] text-white hover:text-white/60 transition-colors duration-300">
                  <LinkIcon className="w-4 h-4" /> Join Future Proof
                </a>
              </div>
            </div>
            <div className="flex flex-col">
              <a href="#" className="block mb-6 overflow-hidden">
                <img src="https://thedankoe.com/wp-content/uploads/2025/12/Featured-Homepage-1024x576.png" alt="Eden" className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500" />
              </a>
              <h3 className="font-['Poppins'] font-[900] text-[24px] tracking-[-0.6px] text-[#efefef] mb-4">
                Eden – AI Canvas & Drive
              </h3>
              <p className="text-[#e8e8e8] text-[18px] leading-[25.2px] mb-6 flex-grow font-['Poppins']">
                Upload files, YouTube links, and more to a <strong>better drive</strong> that can always find what you need. Connect anything to AI on a visual canvas.
              </p>
              <div>
                <a href="#" className="inline-flex items-center gap-2 text-[15px] font-[600] text-white hover:text-white/60 transition-colors duration-300">
                  <LinkIcon className="w-4 h-4" /> Try Eden
                </a>
              </div>
            </div>
            <div className="flex flex-col">
              <a href="#" className="block mb-6 overflow-hidden">
                <img src="https://thedankoe.com/wp-content/uploads/2025/03/featured-3-1024x576.jpg" alt="Purpose & Profit" className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500" />
              </a>
              <h3 className="font-['Poppins'] font-[900] text-[24px] tracking-[-0.6px] text-[#efefef] mb-4">
                Purpose & Profit
              </h3>
              <p className="text-[#e8e8e8] text-[18px] leading-[25.2px] mb-6 flex-grow font-['Poppins']">
                Transform your relationship with money and discover your life’s work. Download the PDF for free or get the paperback on Amazon.
              </p>
              <div>
                <a href="#" className="inline-flex items-center gap-2 text-[15px] font-[600] text-white hover:text-white/60 transition-colors duration-300">
                  <LinkIcon className="w-4 h-4" /> Get The Book
                </a>
              </div>
            </div>
            <div className="flex flex-col">
              <a href="#" className="block mb-6 overflow-hidden">
                <img src="https://thedankoe.com/wp-content/uploads/2023/12/main-featured-image-1024x576.jpg" alt="The Art Of Focus" className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500" />
              </a>
              <h3 className="font-['Poppins'] font-[900] text-[24px] tracking-[-0.6px] text-[#efefef] mb-4">
                The Art Of Focus
              </h3>
              <p className="text-[#e8e8e8] text-[18px] leading-[25.2px] mb-6 flex-grow font-['Poppins']">
                Find meaning, reinvent yourself, and create your ideal future. Now available on Amazon in digital, physical, or audiobook format.
              </p>
              <div>
                <a href="#" className="inline-flex items-center gap-2 text-[15px] font-[600] text-white hover:text-white/60 transition-colors duration-300">
                  <LinkIcon className="w-4 h-4" /> Get The Book
                </a>
              </div>
            </div>
          </div>
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
            {BLOG_POSTS.slice(0, visibleCount).map((post, index) => (
              <Link to={`/post/${post.id}`} key={index} className="group cursor-pointer block">
                <div className="overflow-hidden mb-6">
                  <img 
                    src={post.image} 
                    alt="Blog Post" 
                    className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <h4 className="font-['Poppins'] font-[800] text-[22px] tracking-[-0.6px] text-[#ffffff] mb-3 group-hover:text-[#e8e8e8]/60 transition-colors">
                  {post.title}
                </h4>
                <p className="text-[#ffffff] mb-6 text-[18px] leading-[27px] font-[400]">
                  {post.excerpt}
                </p>
                <div className="flex flex-col border-b border-[#e8e8e8]/20 pb-4 mb-4">
                  <span className="text-[18px] capitalize text-[#ffffff] font-[700] group-hover:text-[#e8e8e8]/60 transition-colors inline-block underline underline-offset-2 decoration-[1.5px] decoration-[#ffffff] group-hover:decoration-[#e8e8e8]/60 self-start">Read Full Post</span>
                </div>
                <div className="flex items-center text-[14px] font-[400] text-[#e8e8e8] italic font-serif">
                  <span>Rey Tao</span>
                  <span className="mx-2 not-italic text-[12px]">•</span>
                  <span>{post.date}</span>
                </div>
              </Link>
            ))}
          </div>
          
          {visibleCount < BLOG_POSTS.length && (
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
            Who Is Rey Tao?
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
            <h3 className="font-['Poppins'] font-[900] text-[24px] tracking-[-0.6px] text-[#efefef] mb-6">Hey, I'm Rey Tao.</h3>
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
