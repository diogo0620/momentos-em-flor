import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { blogPosts, getBlogPost } from "@/lib/blog/posts";

export function generateStaticParams() { return blogPosts.map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const post = getBlogPost((await params).slug);
  return post ? { title: `${post.title} | Momentos em Flor`, description: post.excerpt } : {};
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const post = getBlogPost((await params).slug);
  if (!post) notFound();
  return <main className="bg-[#f8f6f1] pb-20 text-[#293e32]"><div className="mx-auto max-w-[1100px] px-5 pt-10 sm:px-10"><Link href="/blog" className="inline-flex items-center gap-2 text-sm font-semibold"><ArrowLeft size={16} /> Voltar ao diário</Link><div className="mx-auto mt-12 max-w-3xl text-center"><p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#8a5751]">{post.category} · {post.readingTime}</p><h1 className="mt-5 text-4xl leading-[1.08] tracking-[-.04em] sm:text-6xl">{post.title}</h1><p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-[#66705f]">{post.excerpt}</p></div><div className="relative mt-12 aspect-[16/9] overflow-hidden bg-[#e4e5dc]"><Image src={post.image} alt="" fill priority sizes="(max-width: 1100px) 100vw, 1100px" className="object-cover" /></div><article className="mx-auto mt-12 max-w-2xl space-y-7 text-lg leading-9 text-[#4f5b50]">{post.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</article></div></main>;
}
