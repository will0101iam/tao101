export type ContentStatus = "draft" | "published";
export type CoverSource = "upload" | "article";

export type SiteLink = {
  label: string;
  url: string;
};

export type CmsPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  coverImage: string;
  coverSource?: CoverSource;
  content: string;
  status: ContentStatus;
  authorName: string;
  createdAt: string;
  updatedAt: string;
};

export type CmsProduct = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  coverImage: string;
  screenshots: string[];
  content: string;
  ctaLabel: string;
  ctaUrl: string;
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
};

export type PostInput = {
  id?: string;
  slug?: string;
  title: string;
  excerpt: string;
  date: string;
  coverImage: string;
  coverSource?: CoverSource;
  content: string;
  status: ContentStatus;
  authorName?: string;
};

export type ProductInput = {
  id?: string;
  slug?: string;
  title: string;
  excerpt: string;
  date: string;
  coverImage: string;
  screenshots: string[];
  content: string;
  ctaLabel: string;
  ctaUrl: string;
  status: ContentStatus;
};

export type AdminSession = {
  email: string;
  mode: "local" | "supabase";
};

export type SiteSettings = {
  id: string;
  heroEyebrow: string;
  heroTitle: string;
  heroDescription: string;
  heroPrimaryCtaLabel: string;
  heroPrimaryCtaUrl: string;
  heroSecondaryCtaLabel: string;
  heroSecondaryCtaUrl: string;
  productsEyebrow: string;
  productsTitle: string;
  productsDescription: string;
  productsCardCtaLabel: string;
  productsEmptyState: string;
  blogEyebrow: string;
  blogTitle: string;
  blogDescription: string;
  blogLoadMoreLabel: string;
  blogCardCtaLabel: string;
  blogEmptyState: string;
  postLoadingLabel: string;
  postNotFoundTitle: string;
  returnHomeLabel: string;
  productLoadingLabel: string;
  productNotFoundTitle: string;
  productScreenshotsTitle: string;
  productScreenshotLabelPrefix: string;
  productPrimaryCtaFallbackLabel: string;
  aboutEyebrow: string;
  aboutTitle: string;
  aboutDescription: string;
  aboutAvatarUrl: string;
  aboutIntroHeading: string;
  aboutParagraphs: string[];
  aboutSocialLinks: SiteLink[];
  adminPostsEmptyState: string;
  adminProductsEmptyState: string;
  adminProductNoDateLabel: string;
  footerLogoUrl: string;
  footerSlogan: string;
  footerDescription: string;
  footerRightCopy: string;
  footerCopyright: string;
  footerSocialLinks: SiteLink[];
  createdAt: string;
  updatedAt: string;
};

export type SiteSettingsInput = Partial<Omit<SiteSettings, "id" | "createdAt" | "updatedAt">> & {
  id?: string;
};
