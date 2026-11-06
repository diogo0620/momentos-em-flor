import Image from "next/image";
import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import { FaFacebookF, FaInstagram } from "react-icons/fa";

export default function Footer() {
    const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
    const phone = process.env.NEXT_PUBLIC_CONTACT_PHONE;
    const instagramUrl = process.env.NEXT_PUBLIC_INSTAGRAM_URL;
    const facebookUrl = process.env.NEXT_PUBLIC_FACEBOOK_URL;
    const hasContacts = email || phone || instagramUrl || facebookUrl;

    return (
        <footer className="border-t border-[#E5E7E0] bg-white">
            <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-12 lg:px-10">
                <div className="grid gap-9 md:grid-cols-[1.1fr_0.9fr] md:items-end lg:grid-cols-[1.2fr_1fr_auto]">
                    <div>
                        <Image src="/logo.svg" alt="Momentos em Flor" width={170} height={60} className="h-12 w-auto" />
                        <p className="mt-4 max-w-sm text-sm leading-6 text-[#788172]">
                            Flores preparadas com cuidado para celebrar, agradecer e tornar cada momento memorável.
                        </p>
                    </div>

                    <nav aria-label="Navegação de rodapé" className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm text-[#66705F]">
                        <Link href="/products" className="transition hover:text-[#394633]">Flores</Link>
                        <Link href="/favorites" className="transition hover:text-[#394633]">Favoritos</Link>
                        <Link href="/cart" className="transition hover:text-[#394633]">Carrinho</Link>
                        <Link href="/account/orders" className="transition hover:text-[#394633]">Encomendas</Link>
                        <Link href="/account" className="transition hover:text-[#394633]">A minha conta</Link>
                        <Link href="/delivery-policy" className="transition hover:text-[#394633]">Entregas</Link>
                        <Link href="/terms" className="transition hover:text-[#394633]">Termos e condições</Link>
                        <Link href="/privacy" className="transition hover:text-[#394633]">Privacidade</Link>
                        <Link href="/cookies" className="transition hover:text-[#394633]">Cookies</Link>
                    </nav>

                    {hasContacts && (
                        <div className="flex items-center gap-2 md:col-span-2 lg:col-span-1 lg:justify-end">
                            {email && <a href={`mailto:${email}`} aria-label="Enviar email" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E7E0] text-[#55624A] transition hover:border-[#55624A] hover:bg-[#F8F9F5]"><Mail size={16} /></a>}
                            {phone && <a href={`tel:${phone.replace(/\s/g, "")}`} aria-label="Telefonar" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E7E0] text-[#55624A] transition hover:border-[#55624A] hover:bg-[#F8F9F5]"><Phone size={16} /></a>}
                            {instagramUrl && <a href={instagramUrl} target="_blank" rel="noreferrer" aria-label="Instagram" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E7E0] text-[#55624A] transition hover:border-[#55624A] hover:bg-[#F8F9F5]"><FaInstagram size={16} /></a>}
                            {facebookUrl && <a href={facebookUrl} target="_blank" rel="noreferrer" aria-label="Facebook" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E7E0] text-[#55624A] transition hover:border-[#55624A] hover:bg-[#F8F9F5]"><FaFacebookF size={15} /></a>}
                        </div>
                    )}
                </div>

                <div className="mt-9 flex flex-col gap-2 border-t border-[#E5E7E0] pt-5 text-[11px] text-[#9AA094] sm:flex-row sm:items-center sm:justify-between">
                    <span>© {new Date().getFullYear()} Momentos em Flor</span>
                    <span>As imagens dos produtos são meramente ilustrativas.</span>
                </div>
            </div>
        </footer>
    );
}
