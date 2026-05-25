const fs = require('fs');

const postsPath = 'src/data/posts.json';
let posts = JSON.parse(fs.readFileSync(postsPath, 'utf-8'));

// Generate extremely concise, Dan Koe style excerpts
const newExcerpts = {
  "Build一个Claude Code-01：CircleLoop": "AI agent loops vs linear execution",
  "摩擦01：用户动机、约束即产品、非标锚点": "friction is the product",
  "解耦 Claude Code：简洁、分治、隔离": "simplicity through decoupling",
  "反身性 · 对产品经理职业未来的一点思考": "the future of product management",
  "扣子coze 的假 agent skills（技能商店）": "the illusion of agent skills",
  "AI-Agent交易社区的商业模式飞轮能转起来-以MuleRun 为例": "building the AI agent flywheel",
  "内容社区：从淘宝的“贤者时间”到得物的“……”": "post-purchase clarity",
  "拆解 Manus：MCP 与 Deep Research 的高耦合利用": "tight coupling in deep research",
  "你用 cursor 三小时写的 app 赚到一百万了吗？": "the reality of fast coding",
  "1万字逐步指南：如何从0增长到500万美元ARR并实现盈利": "the path to $5M ARR",
  "\"AI：'我替你学编程吧'，自制力：'我先走一步'\":": "AI and the death of self-discipline",
  "Claude式的RPA+AI是伪需求吗？": "RPA + AI: true or false demand?",
  "转行AI-从Dify开始实践(4)-Agent详解": "understanding agents deeply",
  "PMF外的AI产品（3）-虚拟陪伴": "the business of virtual companionship",
  "转行AI-从Dify开始实践(3)-白话RAG": "RAG explained simply",
  "转行AI-从Dify开始实践": "starting with Dify",
  "AI产品经理平常看什么内容？": "the AI PM's information diet",
  "PMF之外的AI产品（2）-AI旅行规划": "AI in travel planning",
  "PMF外的AI产品-AI搜索": "beyond PMF: AI search",
  "剥离AI，回归产品经理": "strip the AI, keep the product",
  "AI产品、副业、跨境 | 说干就干的执行力：一把拉开人与人之间差距的钩子": "execution is the only hook",
  "OpenAI的新功能：将用户“人”作为LLM与GPTs的润滑剂": "humans as the lubricant for LLMs",
  "Function Call函数调用的详细步骤拆解": "deconstructing function calls",
  "智谱ChatGLM4的Bug发现&与GPTs在Function Call上的差异": "function call differences",
  "GPTs-Prompt攻防：使用Agent来防御": "defending prompts with agents",
  "GPTs-Prompt攻防": "prompt attack and defense",
  "从GPTs看Openai的野心": "OpenAI's true ambition",
  "AI中间件编排（2）-授渔还是给鱼？": "teaching AI to fish",
  "AI中间件编排（1）-两种目标导向": "goal-oriented AI orchestration",
  "【重磅】Google又被掐了：ChatGPT4.5力压Gemini": "the LLM arms race",
  "【深度验证】Gemini Pro：是真实力还是假肌肉？": "validating Gemini Pro",
  "【AI总结类产品】：是噱头还是价值？": "AI summarization: gimmick or value?",
  "如何从 0-1 快速搭建 RAG（4）——语义检索&混合检索&重排序 Rerank": "semantic search and reranking",
  "【与总裁对话后】：自我表达的检讨与 AI 底层原理的趋同性发现": "self-expression and AI principles",
  "【重磅详解】Gemini：对Openai贴脸开大的Google多模态大模型": "multimodal competition",
  "RAG就和买菜做饭一般容易（3）：如何从0-1快速搭建一套RAG——嵌入向量化": "vector embeddings explained",
  "RAG就和买菜做饭一般容易（2）：如何从0-1快速搭建RAG——文本分块": "text chunking for RAG",
  "RAG就和买菜做饭一般容易（1）：如何从0-1快速搭建一套RAG——文档解析": "document parsing for RAG",
  "通俗解释下Openai的Q*究竟是什么？": "understanding OpenAI's Q*",
  "AI产品的壁垒究竟在哪里？": "where is the moat in AI?",
  "为什么是微软赶走了Sam Altman？": "the Microsoft power play",
  "深入探究OpenAI更新-技术上的三叉戟": "OpenAI's technical trident",
  "解析AI大模型的联网搜索-2-种方案": "two paths to AI web search",
  "OpenAI的下一步-OS": "OpenAI's operating system",
  "AI产品-好的垂直场景是一个好故事的开始": "verticals are the best stories",
  "探究大模型问答的本质差异：RAG-Memory-Fine-Tuning": "RAG vs Memory vs Fine-tuning",
  "AI产品创业路径上的一点思考": "thoughts on AI startups",
  "产品工作中的AI-Agent一点思考": "agents in product work",
  "AI与硬件的\"中餐\"和'西餐\"": "AI hardware approaches"
};

posts = posts.map(post => {
  // If we have a custom concise excerpt, use it. Otherwise just use a short snippet.
  let excerpt = newExcerpts[post.title];
  if (!excerpt) {
      // Fallback: extract the first sentence or up to 50 chars.
      excerpt = post.excerpt.split(/[。！？.!?]/)[0];
      if (excerpt.length > 60) {
          excerpt = excerpt.substring(0, 50) + "...";
      }
  }
  // Convert excerpt to lowercase to match the Dan Koe aesthetic shown in the image
  post.excerpt = excerpt.toLowerCase();
  return post;
});

fs.writeFileSync(postsPath, JSON.stringify(posts, null, 2));
console.log("Excerpts updated to be concise.");
