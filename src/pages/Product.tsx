import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import SiteLayout from "@/components/SiteLayout";
import { findPublishedProduct, getPublishedProductInitial } from "@/lib/publicContent";
import type { CmsProduct } from "@/types/content";

function formatDisplayDate(value: string) {
  if (!value) {
    return "";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(parsed);
}

export default function Product() {
  const { id } = useParams();
  const [product, setProduct] = useState<CmsProduct | null>(() => getPublishedProductInitial(id) ?? null);
  const [loading, setLoading] = useState(product === null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    let active = true;

    async function loadProduct() {
      try {
        const nextProduct = await findPublishedProduct(id);
        if (!active) {
          return;
        }
        setProduct(nextProduct ?? null);
      } catch {
        if (!active) {
          return;
        }
        setProduct(null);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <SiteLayout>
        <div className="min-h-[50vh] flex items-center justify-center text-white/60 px-6">
          Loading product...
        </div>
      </SiteLayout>
    );
  }

  if (!product) {
    return (
      <SiteLayout>
        <div className="min-h-[50vh] flex flex-col items-center justify-center text-white px-6">
          <h1 className="text-4xl font-['Poppins'] font-black mb-4">Product not found</h1>
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
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="font-['Poppins'] font-[900] text-[52px] leading-[1] text-[#efefef] mb-6">
              {product.title}
            </h1>
            <p className="font-['Poppins'] text-[18px] text-[#e8e8e8] italic lowercase">
              {product.excerpt}
            </p>
            {product.date ? (
              <p className="mt-5 font-['Poppins'] text-[12px] uppercase tracking-[0.24em] text-white/45">
                {formatDisplayDate(product.date)}
              </p>
            ) : null}
          </div>
          
          {/* Conceptual Image */}
          {product.coverImage ? (
            <div className="mb-16">
              <img
                src={product.coverImage}
                alt={product.title}
                className="w-full h-auto object-cover"
              />
            </div>
          ) : null}

          {/* Product Story Content */}
          <div 
            className="post-content font-['Poppins'] text-[18px] leading-[25.2px] text-[#e8e8e8] mb-16"
            dangerouslySetInnerHTML={{ __html: product.content }}
          />

          {product.screenshots.length ? (
            <section className="mb-16 border-t border-[#e8e8e8]/20 pt-16">
              <div className="mb-6">
                <h2 className="font-['Poppins'] font-[800] text-[20px] text-[#efefef]">Screenshots</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {product.screenshots.map((imageUrl, index) => (
                  <figure key={`${imageUrl}-${index}`} className="overflow-hidden border border-white/10 bg-white/[0.02]">
                    <img src={imageUrl} alt={`Screenshot ${index + 1}`} className="w-full object-cover" />
                    <figcaption className="border-t border-white/10 px-4 py-3 text-sm text-white/55">
                      Screenshot {index + 1}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </section>
          ) : null}

          {/* CTA */}
          {product.ctaUrl ? (
            <div className="flex justify-center border-t border-[#e8e8e8]/20 pt-16">
              <a
                href={product.ctaUrl}
                className="inline-flex items-center justify-center bg-[#efefef] text-[#111111] px-[32px] py-[16px] text-[18px] font-['Poppins'] font-[800] hover:bg-[#e0c787] hover:text-[#111111] transition-colors duration-300"
              >
                {product.ctaLabel || "Open Product"}
              </a>
            </div>
          ) : null}
        </div>
      </article>
    </SiteLayout>
  );
}
