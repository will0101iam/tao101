import { useParams, Link } from "react-router-dom";
import { useEffect } from "react";
import SiteLayout from "@/components/SiteLayout";
import { getPostById } from "@/data";

export default function Post() {
  const { id } = useParams();
  const post = getPostById(id);

  // Scroll to top on load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!post) {
    return (
      <SiteLayout>
        <div className="min-h-[50vh] flex flex-col items-center justify-center text-white px-6">
          <h1 className="text-4xl font-['Poppins'] font-black mb-4">Post not found</h1>
          <Link to="/" className="text-[#e8e8e8] hover:text-white transition-colors underline">
            Return to home
          </Link>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <article className="pt-20 pb-32 px-6">
        <div className="max-w-[600px] mx-auto">
          {/* Rey Tao Style Header */}
          <div className="mb-12">
            <h1 className="font-['Poppins'] font-[900] text-[40px] leading-[1] text-[#e8e8e8] mb-6">
              {post.title}
            </h1>
            <div className="flex items-center text-[14px] font-[400] text-[#e8e8e8] italic font-serif">
              <span>Rey Tao</span>
              <span className="mx-2 not-italic text-[12px]">•</span>
              <span>{post.date}</span>
            </div>
          </div>
          
          {/* Post Image */}
          <div className="mb-12">
            <img 
              src={post.image} 
              alt={post.title}
              className="w-full h-auto object-cover"
            />
          </div>

          {/* Post Content */}
          <div 
            className="post-content font-['Poppins'] text-[18px] leading-[25.2px] text-[#e8e8e8]"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>
      </article>
    </SiteLayout>
  );
}
