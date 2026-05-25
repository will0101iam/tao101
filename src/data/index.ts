import postsJson from './posts.json';

const koeCovers = [
  "https://thedankoe.com/wp-content/uploads/2025/08/featured-768x432.jpg",
  "https://thedankoe.com/wp-content/uploads/2025/07/featured-niche-768x432.jpg",
  "https://thedankoe.com/wp-content/uploads/2025/07/featured3-768x432.jpg",
  "https://thedankoe.com/wp-content/uploads/2025/07/featured-learning-768x432.jpg",
  "https://thedankoe.com/wp-content/uploads/2025/07/featured-1-768x432.jpg",
  "https://thedankoe.com/wp-content/uploads/2025/06/featured-111-768x432.jpg",
  "https://thedankoe.com/wp-content/uploads/2025/06/featured-2-768x430.png",
  "https://thedankoe.com/wp-content/uploads/2022/04/featured-1024x576.jpg",
  "https://thedankoe.com/wp-content/uploads/2023/12/main-featured-image-1024x576.jpg"
];

export const BLOG_POSTS = postsJson.map((post, index) => ({
  ...post,
  image: koeCovers[index % koeCovers.length]
}));

export const getPostById = (id) => {
  return BLOG_POSTS.find(post => post.id.toString() === id.toString());
};
