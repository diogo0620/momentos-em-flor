"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Flower2, Mail } from "lucide-react";
import { storeSettingsApi } from "@/lib/api/store-settings/store-settings";

export default function PartnersPage() {
  const [email, setEmail] = useState<string | null>(null);
  useEffect(() => { void storeSettingsApi.getPublic().then((settings) => setEmail(settings.partnerEmail || settings.contactEmail)).catch(() => setEmail(null)); }, []);
  return (
    <main className="bg-[#f7f5ee] px-5 py-16 sm:py-24">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.15fr_.85fr] lg:items-center">
        <div><p className="editorial-kicker">Rede Momentos em Flor</p><h1 className="mt-4 text-4xl tracking-tight sm:text-6xl">Quer ser nossa parceira?</h1><p className="mt-6 max-w-2xl text-base leading-8 text-[#64705f]">Se tens uma florista e valorizas qualidade, cuidado e um serviço próximo, queremos conhecer o teu trabalho. Entra em contacto para saberes como funciona a parceria.</p>{email && <a href={`mailto:${email}?subject=Quero ser parceira da Momentos em Flor`} className="mt-8 inline-flex min-h-12 items-center gap-3 rounded-full bg-[#293e32] px-6 text-sm font-semibold text-white">Falar sobre parceria <ArrowUpRight size={17} /></a>}</div>
        <div className="rounded-[2rem] bg-white p-8 shadow-sm"><Flower2 size={34} className="text-[#6d7b61]" /><h2 className="mt-6 text-2xl">Uma relação construída com cuidado</h2><p className="mt-4 text-sm leading-7 text-[#64705f]">Partilha connosco a zona onde trabalhas, os tipos de arranjos que preparas e a melhor forma de te contactarmos.</p>{email && <p className="mt-6 flex items-center gap-2 text-sm font-semibold text-[#40513c]"><Mail size={16} /> {email}</p>}</div>
      </div>
    </main>
  );
}
