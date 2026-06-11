import postsJson from './posts.json';

type Post = {
  id: string | number;
  title: string;
  date: string;
  excerpt: string;
  content: string;
  image?: string;
};

type Product = {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  image: string;
  screenshots?: string[];
  content: string;
  ctaLabel?: string;
  ctaUrl?: string;
};

type SiteSettingsSeed = {
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
  aboutSocialLinks: Array<{ label: string; url: string }>;
  adminPostsEmptyState: string;
  adminProductsEmptyState: string;
  adminProductNoDateLabel: string;
  footerLogoUrl: string;
  footerSlogan: string;
  footerDescription: string;
  footerRightCopy: string;
  footerCopyright: string;
  footerSocialLinks: Array<{ label: string; url: string }>;
};

const koeCovers = [
  "https://thedankoe.com/wp-content/uploads/2025/08/featured-768x432.jpg",
  "https://thedankoe.com/wp-content/uploads/2025/07/featured-niche-768x432.jpg",
  "https://thedankoe.com/wp-content/uploads/2025/07/featured3-768x432.jpg",
  "https://thedankoe.com/wp-content/uploads/2025/07/featured-learning-768x432.jpg",
  "https://thedankoe.com/wp-content/uploads/2025/07/featured-1-768x432.jpg",
  "https://thedankoe.com/wp-content/uploads/2025/06/featured-111-768x432.jpg",
  "https://thedankoe.com/wp-content/uploads/2025/06/featured-2-768x430.png",
  "https://thedankoe.com/wp-content/uploads/2022/04/featured-1024x576.jpg",
  "https://thedankoe.com/wp-content/uploads/2023/12/main-featured-image-1024x576.jpg",
];

export const BLOG_POSTS: Post[] = (postsJson as Post[]).map((post, index) => ({
  ...post,
  image: koeCovers[index % koeCovers.length],
}));

export const getPostById = (id: string | undefined) => {
  if (!id) {
    return undefined;
  }
  return BLOG_POSTS.find(post => post.id.toString() === id.toString());
};

export const PRODUCTS: Product[] = [
  {
    id: "zen-terminal",
    title: "Zen Terminal",
    date: "May 12, 2026",
    excerpt: "the command line, silenced.",
    image: "https://thedankoe.com/wp-content/uploads/2025/07/featured-2-768x432.jpg",
    screenshots: [
      "https://thedankoe.com/wp-content/uploads/2025/07/featured-2-768x432.jpg",
      "https://thedankoe.com/wp-content/uploads/2025/08/featured-768x432.jpg",
    ],
    content: `
      <h3 class="font-['Poppins'] font-[900] text-[24px] tracking-[-0.6px] text-[#efefef] mb-6">The Friction</h3>
      <p>I realized I was spending hours staring at terminal outputs that didn't matter. The noise was deafening. The cognitive load was too high. Every command threw a wall of text at me, disrupting my flow state and breaking my focus.</p>
      
      <h3 class="font-['Poppins'] font-[900] text-[24px] tracking-[-0.6px] text-[#efefef] mb-6 mt-10">The Resolution</h3>
      <p>Zen Terminal was born out of a selfish need: I wanted a terminal that only spoke when it had something important to say. I built a wrapper that filters out the noise, highlighting only warnings, errors, and success states.</p>
      
      <h3 class="font-['Poppins'] font-[900] text-[24px] tracking-[-0.6px] text-[#efefef] mb-6 mt-10">The Mechanic</h3>
      <pre><code>// Intercept stdout and filter based on log levels
process.stdout.write = (chunk) => {
  if (isNoise(chunk)) return;
  originalWrite(formatZen(chunk));
};</code></pre>
    `
  },
  {
    id: "vibe-scaffold",
    title: "Vibe Scaffold",
    date: "May 4, 2026",
    excerpt: "start building in seconds, not hours.",
    image: "https://thedankoe.com/wp-content/uploads/2025/08/featured-768x432.jpg",
    screenshots: [
      "https://thedankoe.com/wp-content/uploads/2025/08/featured-768x432.jpg",
    ],
    content: `
      <h3 class="font-['Poppins'] font-[900] text-[24px] tracking-[-0.6px] text-[#efefef] mb-6">The Friction</h3>
      <p>Every new idea was met with the same tedious setup process. Configuring Tailwind, setting up routing, establishing a design system. By the time I was ready to build the actual product, the initial spark of inspiration had faded.</p>
      
      <h3 class="font-['Poppins'] font-[900] text-[24px] tracking-[-0.6px] text-[#efefef] mb-6 mt-10">The Resolution</h3>
      <p>I needed a way to jump straight into the flow state. Vibe Scaffold is an opinionated, minimalist boilerplate that eliminates the setup phase. It's designed to get out of your way and let you build.</p>
      
      <h3 class="font-['Poppins'] font-[900] text-[24px] tracking-[-0.6px] text-[#efefef] mb-6 mt-10">The Mechanic</h3>
      <pre><code># Start a new project with the perfect vibe in one command
npx vibe-scaffold my-new-idea --template minimalist</code></pre>
    `
  }
];

export const getProductById = (id: string | undefined) => {
  if (!id) {
    return undefined;
  }
  return PRODUCTS.find(product => product.id === id);
};

export const SITE_SETTINGS: SiteSettingsSeed = {
  heroEyebrow: "GUOTAO TAO",
  heroTitle: "Build.\nBreak.\nRepeat.",
  heroDescription: "Exploring the intersection of AI, product design, and continuous learning. I build tools and share insights on navigating the digital frontier.",
  heroPrimaryCtaLabel: "Explore My Products",
  heroPrimaryCtaUrl: "#products",
  heroSecondaryCtaLabel: "Read My Writings",
  heroSecondaryCtaUrl: "#blog",
  productsEyebrow: "THE PRODUCTS",
  productsTitle: "Manifesting Necessity",
  productsDescription: "Vibe coding experiments, AI agents, and tools built to serve me.",
  productsCardCtaLabel: "Explore Tool",
  productsEmptyState: "No published products yet.",
  blogEyebrow: "THE BLOGS",
  blogTitle: "Explore Your Curiosity",
  blogDescription: "Deep dives on human potential, lifestyle design, & digital business.",
  blogLoadMoreLabel: "Load More",
  blogCardCtaLabel: "Read Full Post",
  blogEmptyState: "No published posts yet.",
  postLoadingLabel: "Loading post...",
  postNotFoundTitle: "Post not found",
  returnHomeLabel: "Return to home",
  productLoadingLabel: "Loading product...",
  productNotFoundTitle: "Product not found",
  productScreenshotsTitle: "Screenshots",
  productScreenshotLabelPrefix: "Screenshot",
  productPrimaryCtaFallbackLabel: "Open Product",
  aboutEyebrow: "ABOUT ME",
  aboutTitle: "Who Is Guotao Tao?",
  aboutDescription: "Just a human obsessed with humans.",
  aboutAvatarUrl: "https://thedankoe.com/wp-content/uploads/2024/11/pfp23.jpg",
  aboutIntroHeading: "Hey, I'm Guotao Tao.",
  aboutParagraphs: [
    "从事AI产品经理的工作，喜欢批判性的产品思考，喜欢研究用户行为和心理学。",
    "梦想是早日退休，在自然中肆意的浪费时间。",
    "做的速度跟不上开脑洞的速度，因此时常感到焦虑和轻微的挫败感，然后重新在已经跟账单一样长的 todolist 上继续写 todo，希望有一天能够清空这个账单，实现真正的自由。",
    "ENTJ-A，双鱼座，自由度和话语权是性格的底色，没有这两样东西，无法激发 100% 性能。",
  ],
  aboutSocialLinks: [
    { label: "微信公众号", url: "" },
    { label: "小红书", url: "" },
    { label: "Twitter", url: "" },
  ],
  adminPostsEmptyState: "Select a post or create a new one.",
  adminProductsEmptyState: "Select a product or create a new one.",
  adminProductNoDateLabel: "No publish date",
  footerLogoUrl: "https://thedankoe.com/wp-content/uploads/2022/04/logo-white.png",
  footerSlogan: "Build. Break. Repeat.",
  footerDescription: "I dive deep into human potential, lifestyle design, and one-person businesses to give you a unique, digestible way of improving your life.",
  footerRightCopy: "Gain A New Perspective On Life & Business",
  footerCopyright: "© All Rights Reserved.",
  footerSocialLinks: [
    { label: "Twitter", url: "" },
    { label: "Instagram", url: "" },
    { label: "GitHub", url: "" },
  ],
};
