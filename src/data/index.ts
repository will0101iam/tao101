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
