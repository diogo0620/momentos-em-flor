import Link from "next/link";
import { ArrowUpRight, FileText, LockKeyhole, PackageCheck, Scale, Cookie, Truck } from "lucide-react";

export const metadata = { title: "Centro legal | Momentos em Flor", description: "Informação legal, privacidade, entregas, cancelamentos e resolução de litígios." };

const documents = [
  { href: "/terms", title: "Termos e condições", text: "Regras da utilização da loja e da celebração de encomendas.", icon: FileText },
  { href: "/privacy", title: "Privacidade", text: "Dados tratados, fundamentos, conservação e direitos.", icon: LockKeyhole },
  { href: "/returns", title: "Cancelamentos e reembolsos", text: "Condições, produtos perecíveis e resolução de problemas.", icon: PackageCheck },
  { href: "/delivery-policy", title: "Entregas", text: "Cobertura, receção, atrasos e incidentes.", icon: Truck },
  { href: "/disputes", title: "Reclamações e litígios", text: "Apoio, Livro de Reclamações e resolução alternativa.", icon: Scale },
  { href: "/cookies", title: "Cookies", text: "Tecnologias essenciais usadas pela plataforma.", icon: Cookie },
];

export default function LegalHubPage() {
  return <main className="bg-[#f8f6f1] px-5 py-14 text-[#293e32] sm:px-10 sm:py-20"><div className="mx-auto max-w-[1100px]"><p className="editorial-kicker">Transparência e confiança</p><h1 className="mt-4 max-w-3xl text-5xl leading-[1.05] tracking-[-.045em] sm:text-7xl">Centro legal</h1><p className="mt-6 max-w-2xl text-base leading-7 text-[#66705f]">Consulta num só lugar as condições da loja, os teus direitos e os canais disponíveis para resolver qualquer questão.</p><div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{documents.map(({ href, title, text, icon: Icon }) => <Link key={href} href={href} className="group flex min-h-56 flex-col border border-[#dde0d5] bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg"><Icon size={25} strokeWidth={1.5} className="text-[#8a5751]" /><h2 className="mt-8 text-xl font-semibold">{title}</h2><p className="mt-3 text-sm leading-6 text-[#66705f]">{text}</p><span className="mt-auto flex items-center gap-2 pt-6 text-sm font-semibold">Consultar <ArrowUpRight size={16} /></span></Link>)}</div></div></main>;
}
