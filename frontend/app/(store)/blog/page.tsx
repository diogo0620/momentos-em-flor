import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { blogPosts } from "@/lib/blog/posts";

export const metadata = { title: "Histórias e inspiração | Momentos em Flor", description: "Histórias, inspiração floral e cuidados da Momentos em Flor." };

export default function BlogPage() {
  return (
    <main className="bg-[#f8f6f1] px-5 py-14 text-[#293e32] sm:px-10 sm:py-20 lg:px-16">
      <div className="mx-auto max-w-[1280px]">
        <p className="editorial-kicker">O nosso diário</p>
        <h1 className="mt-4 max-w-3xl text-5xl leading-[1.05] tracking-[-.045em] sm:text-7xl">Flores, pessoas e histórias que ficam.</h1>
        <p className="mt-6 max-w-xl text-base leading-7 text-[#66705f]">Inspiração para escolher, oferecer e cuidar de cada momento.</p>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {blogPosts.map((post) => <BlogCard key={post.slug} post={post} />)}
        </div>
      </div>
    </main>
  );
}

function BlogCard({ post }: { post: (typeof blogPosts)[number] }) {
  return <article className="group"><Link href={`/blog/${post.slug}`} className="block"><div className="relative aspect-[4/3] overflow-hidden bg-[#e4e5dc]"><Image src={post.image} alt="" fill sizes="(max-width: 767px) 100vw, 33vw" className="object-cover transition duration-700 motion-safe:group-hover:scale-105" /></div><p className="mt-5 text-[10px] font-bold uppercase tracking-[.16em] text-[#8a5751]">{post.category} · {post.readingTime}</p><h2 className="mt-3 text-2xl leading-tight tracking-[-.025em]">{post.title}</h2><p className="mt-3 text-sm leading-6 text-[#66705f]">{post.excerpt}</p><span className="mt-5 inline-flex items-center gap-2 border-b border-[#aeb7a5] pb-1 text-sm font-semibold">Ler artigo <ArrowUpRight size={16} /></span></Link></article>;
}
