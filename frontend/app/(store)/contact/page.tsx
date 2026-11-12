"use client";

import { useEffect, useState } from "react";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { storeSettingsApi } from "@/lib/api/store-settings/store-settings";
import type { StoreSettings } from "@/types/store-settings/store-settings";

export default function ContactPage() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  useEffect(() => { void storeSettingsApi.getPublic().then(setSettings).catch(() => setSettings(null)); }, []);
  const whatsapp = settings?.whatsappNumber?.replace(/\D/g, "");
  return (
    <main className="bg-[#f7f5ee] px-5 py-16 sm:py-24">
      <div className="mx-auto max-w-5xl">
        <p className="editorial-kicker">Estamos por perto</p>
        <h1 className="mt-4 max-w-3xl text-4xl tracking-tight sm:text-6xl">Como podemos ajudar?</h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-[#64705f]">Fala connosco sobre uma encomenda, entrega ou qualquer dúvida. Respondemos através dos canais configurados abaixo.</p>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {settings?.contactEmail && <a href={`mailto:${settings.contactEmail}`} className="rounded-3xl bg-white p-7 shadow-sm transition hover:-translate-y-0.5"><Mail className="text-[#55624A]" /><h2 className="mt-5 text-xl">Email</h2><p className="mt-2 text-sm text-[#64705f]">{settings.contactEmail}</p></a>}
          {whatsapp && <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" className="rounded-3xl bg-[#293e32] p-7 text-white shadow-sm transition hover:-translate-y-0.5"><MessageCircle /><h2 className="mt-5 text-xl">WhatsApp</h2><p className="mt-2 text-sm text-white/70">Atendimento rápido e direto</p></a>}
          {settings?.contactPhone && <a href={`tel:${settings.contactPhone.replace(/\s/g, "")}`} className="rounded-3xl bg-white p-7 shadow-sm"><Phone className="text-[#55624A]" /><h2 className="mt-5 text-xl">Telefone</h2><p className="mt-2 text-sm text-[#64705f]">{settings.contactPhone}</p></a>}
          {settings?.companyAddress && <div className="rounded-3xl bg-white p-7 shadow-sm"><MapPin className="text-[#55624A]" /><h2 className="mt-5 text-xl">Morada</h2><p className="mt-2 text-sm leading-6 text-[#64705f]">{settings.companyAddress}</p></div>}
        </div>
      </div>
    </main>
  );
}
