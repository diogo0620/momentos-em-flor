"use client";

import Image from "next/image";
import Link from "next/link";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { FaFacebookF, FaInstagram } from "react-icons/fa";
import { useEffect, useState } from "react";
import { storeSettingsApi } from "@/lib/api/store-settings/store-settings";

export default function Footer() {
    const [publicContacts, setPublicContacts] = useState<{ email?: string; phone?: string; whatsapp?: string }>({});
    useEffect(() => {
        void storeSettingsApi.getPublic().then((settings) => setPublicContacts({ email: settings.contactEmail ?? undefined, phone: settings.contactPhone ?? undefined, whatsapp: settings.whatsappNumber ?? undefined })).catch(() => undefined);
    }, []);
    const email = publicContacts.email || process.env.NEXT_PUBLIC_CONTACT_EMAIL;
    const phone = publicContacts.phone || process.env.NEXT_PUBLIC_CONTACT_PHONE;
    const whatsapp = publicContacts.whatsapp;
    const instagramUrl = process.env.NEXT_PUBLIC_INSTAGRAM_URL;
    const facebookUrl = process.env.NEXT_PUBLIC_FACEBOOK_URL;
    const hasContacts = email || phone || whatsapp || instagramUrl || facebookUrl;

    return (
        <footer className="border-t border-[#e7e3d8] bg-[#f0eee7]">
            <div className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 sm:py-16 lg:px-12">
                <div className="grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-start lg:grid-cols-[1.2fr_1fr_auto]">
                    <div>
                        <Image src="/logo.svg" alt="Momentos em Flor" width={170} height={60} className="h-12 w-auto" />
                        <p className="mt-5 max-w-sm font-serif text-xl leading-7 text-[#52604c]">
                            Um gesto escolhido com intenção. Flores para dizer o que as palavras nem sempre conseguem.
                        </p>
                    </div>

                    <nav aria-label="Navegação de rodapé" className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm text-[#66705F]">
                        <Link href="/products" className="transition hover:text-[#394633]">Flores</Link>
                        <Link href="/favorites" className="transition hover:text-[#394633]">Favoritos</Link>
                        <Link href="/cart" className="transition hover:text-[#394633]">Carrinho</Link>
                        <Link href="/account/orders" className="transition hover:text-[#394633]">Encomendas</Link>
                        <Link href="/account" className="transition hover:text-[#394633]">A minha conta</Link>
                        <Link href="/delivery-policy" className="transition hover:text-[#394633]">Entregas</Link>
                        <Link href="/contact" className="transition hover:text-[#394633]">Contactos</Link>
                        <Link href="/partners" className="transition hover:text-[#394633]">Quer ser nossa parceira?</Link>
                        <Link href="/terms" className="transition hover:text-[#394633]">Termos e condições</Link>
                        <Link href="/privacy" className="transition hover:text-[#394633]">Privacidade</Link>
                        <Link href="/cookies" className="transition hover:text-[#394633]">Cookies</Link>
                    </nav>

                    {hasContacts && (
                        <div className="flex items-center gap-2 md:col-span-2 lg:col-span-1 lg:justify-end">
                            {email && <a href={`mailto:${email}`} aria-label="Enviar email" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E7E0] text-[#55624A] transition hover:border-[#55624A] hover:bg-[#F8F9F5]"><Mail size={16} /></a>}
                            {phone && <a href={`tel:${phone.replace(/\s/g, "")}`} aria-label="Telefonar" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E7E0] text-[#55624A] transition hover:border-[#55624A] hover:bg-[#F8F9F5]"><Phone size={16} /></a>}
                            {whatsapp && <a href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" aria-label="Contactar por WhatsApp" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E7E0] text-[#55624A] transition hover:border-[#55624A] hover:bg-[#F8F9F5]"><MessageCircle size={16} /></a>}
                            {instagramUrl && <a href={instagramUrl} target="_blank" rel="noreferrer" aria-label="Instagram" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E7E0] text-[#55624A] transition hover:border-[#55624A] hover:bg-[#F8F9F5]"><FaInstagram size={16} /></a>}
                            {facebookUrl && <a href={facebookUrl} target="_blank" rel="noreferrer" aria-label="Facebook" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E7E0] text-[#55624A] transition hover:border-[#55624A] hover:bg-[#F8F9F5]"><FaFacebookF size={15} /></a>}
                        </div>
                    )}
                </div>

                <div className="mt-10 flex flex-col gap-2 border-t border-[#dcd8cd] pt-5 text-[11px] text-[#858779] sm:flex-row sm:items-center sm:justify-between">
                    <span>© {new Date().getFullYear()} Momentos em Flor</span>
                    <span>As imagens dos produtos são meramente ilustrativas.</span>
                </div>
            </div>
        </footer>
    );
}
