import { ArrowRight, Bot, CheckCheck, Layers3, MessageSquareText, PencilRuler } from "lucide-react";
import { Link } from "react-router-dom";
import SectionHeading from "@/components/SectionHeading";
import SiteLayout from "@/components/SiteLayout";

const principles = [
  {
    icon: PencilRuler,
    title: "先定义问题，再找 AI 干活",
    text: "我不会一上来就让 AI 发散写方案。我会先决定场景、目标用户和第一版边界。",
  },
  {
    icon: Layers3,
    title: "把复杂问题拆成最小闭环",
    text: "我更喜欢先拿到一个能跑通的版本，再决定哪些地方值得继续长大。",
  },
  {
    icon: MessageSquareText,
    title: "把会话历史当成设计轨迹",
    text: "每一轮对话都在记录：问题是怎么演化的、哪些方案被放弃了、什么地方比想象中更重要。",
  },
  {
    icon: Bot,
    title: "AI 负责加速，我负责定方向",
    text: "实现、排错、改样式、补结构，AI 都能提速；但什么该做、什么先不做，需要我不断纠偏。",
  },
];

const workflow = [
  "先从一个具体摩擦出发，用一句话讲清我要解决的问题。",
  "把它拆成最小闭环，再决定第一版只保留哪些关键动作。",
  "让 AI 帮我并行推进结构搭建、代码实现和问题定位。",
  "在使用中观察哪里不顺，再回到对话里修正范围、默认值和交互。",
  "把历史会话、项目文档和代码一起沉淀成可复盘的产品资产。",
];

export default function ProcessPage() {
  return (
    <SiteLayout>
      <section className="mx-auto max-w-7xl px-6 pb-16 pt-20 md:px-8 md:pb-24 md:pt-24">
        <SectionHeading
          eyebrow="Process"
          title="我如何和 AI 一起做产品"
          description="在这个作品集里，AI 不是一个会自动吐结果的黑箱，而是一个高频协作伙伴。真正定义产品质量的，不是 prompt 多聪明，而是你能不能持续做判断、不断修正方向。"
        />
        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {principles.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="rounded-[28px] border border-white/10 bg-white/5 p-6">
                <div className="flex size-12 items-center justify-center rounded-2xl border border-white/10 bg-black/25 text-amber-200">
                  <Icon className="size-5" />
                </div>
                <h2 className="mt-6 font-display text-2xl text-stone-100">{item.title}</h2>
                <p className="mt-3 text-sm leading-7 text-stone-300">{item.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-8 md:px-8 md:py-12">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-8">
            <p className="text-xs uppercase tracking-[0.32em] text-stone-500">Workflow</p>
            <h2 className="mt-4 font-display text-4xl text-stone-100">从 idea 到原型，我通常这样推进</h2>
            <p className="mt-4 text-sm leading-7 text-stone-300">
              我不会把 AI 当成替我做完一切的工具，而是把它放进一个更清晰的流程里：问题定义、最小闭环、并行实现、使用反馈、二次收束。
            </p>
          </div>
          <div className="space-y-4">
            {workflow.map((item, index) => (
              <article key={item} className="grid gap-4 rounded-[28px] border border-white/10 bg-black/25 px-5 py-5 md:grid-cols-[56px_1fr] md:items-start">
                <div className="flex size-14 items-center justify-center rounded-full border border-amber-200/20 bg-amber-100/5 font-display text-2xl text-amber-200">
                  0{index + 1}
                </div>
                <p className="text-sm leading-7 text-stone-200">{item}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 md:px-8 md:py-20">
        <div className="grid gap-6 md:grid-cols-2">
          <article className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.04))] p-8">
            <div className="flex size-12 items-center justify-center rounded-2xl border border-white/10 bg-black/25 text-amber-200">
              <CheckCheck className="size-5" />
            </div>
            <h2 className="mt-6 font-display text-3xl text-stone-100">我认为最关键的能力不是 prompt engineering</h2>
            <p className="mt-4 text-sm leading-7 text-stone-300">
              而是你是否能看出 AI 的方案哪里偏了、哪里过重、哪里漏掉了真正影响体验的部分，然后把它拉回正确方向。
            </p>
          </article>
          <article className="rounded-[32px] border border-white/10 bg-white/5 p-8">
            <div className="flex size-12 items-center justify-center rounded-2xl border border-white/10 bg-black/25 text-amber-200">
              <Bot className="size-5" />
            </div>
            <h2 className="mt-6 font-display text-3xl text-stone-100">history 文件夹是我很重要的产品资产</h2>
            <p className="mt-4 text-sm leading-7 text-stone-300">
              它保存的不只是聊天记录，而是需求为什么出现、功能为什么被保留或放弃、问题是怎么被一步步看清的。这种轨迹，本身就是 case study 的核心素材。
            </p>
          </article>
        </div>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link className="inline-flex items-center gap-2 rounded-full border border-amber-200/20 bg-amber-200 px-5 py-3 text-sm font-medium text-stone-950 transition hover:bg-amber-100" to="/">
            回到首页看项目
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
