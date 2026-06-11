import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { getPublishedSiteSettingsInitial, readPublishedSiteSettings } from "@/lib/publicContent";
import type { SiteSettings } from "@/types/content";

type SiteLayoutProps = {
  children: ReactNode;
  siteSettings?: SiteSettings;
};

export default function SiteLayout({ children, siteSettings: providedSiteSettings }: SiteLayoutProps) {
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => providedSiteSettings ?? getPublishedSiteSettingsInitial());

  useEffect(() => {
    if (providedSiteSettings) {
      setSiteSettings(providedSiteSettings);
      return;
    }

    let active = true;

    async function loadSiteSettings() {
      try {
        const nextSiteSettings = await readPublishedSiteSettings();
        if (active) {
          setSiteSettings(nextSiteSettings);
        }
      } catch {
        if (!active) {
          return;
        }
      }
    }

    loadSiteSettings();

    return () => {
      active = false;
    };
  }, [providedSiteSettings]);

  return (
    <div className="min-h-screen bg-black text-[#e8e8e8] font-['Poppins'] selection:bg-white selection:text-black">
      <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1520px] items-center justify-between px-6 py-5">
          <Link to="/" className="flex-shrink-0">
            <img 
              src={siteSettings.footerLogoUrl} 
              alt="Logo" 
              className="h-8 md:h-[42px] w-auto"
            />
          </Link>
        </div>
      </header>
      
      <main className="relative z-10">{children}</main>
      
      <footer className="bg-black pt-20">
        <div className="mx-auto max-w-[1520px] px-6">
          <div className="grid md:grid-cols-2 gap-16 mb-20">
            {/* Left Column */}
            <div className="flex flex-col items-start">
              <img 
                src={siteSettings.footerLogoUrl} 
                alt="Logo" 
                className="h-[60px] w-auto mb-6"
              />
              <span className="text-[#ededed] font-['Poppins'] text-[18px] font-[900] tracking-[-0.6px] mb-4">
                {siteSettings.footerSlogan}
              </span>
              <p className="text-[#ededed] text-[18px] leading-[25.2px] mb-8">
                {siteSettings.footerDescription}
              </p>
              <div className="flex flex-wrap gap-4">
                {siteSettings.footerSocialLinks.map((link) => (
                  <a
                    key={`${link.label}-${link.url}`}
                    href={link.url || "#"}
                    className="text-[15px] font-semibold text-white/65 transition-colors hover:text-white"
                    target={link.url ? "_blank" : undefined}
                    rel={link.url ? "noreferrer" : undefined}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
            {/* Right Column */}
            <div className="flex flex-col items-start justify-center">
              <p className="text-[#ededed] font-['Poppins'] text-[24px] tracking-[-0.6px] mb-4">
                {siteSettings.footerRightCopy}
              </p>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 py-8 text-center text-[20px] text-[#c8d5dc]">
          <p>{siteSettings.footerCopyright}</p>
        </div>
      </footer>
    </div>
  );
}
