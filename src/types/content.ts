export type ContentStatus = "draft" | "published";
export type CoverSource = "upload" | "article";

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
