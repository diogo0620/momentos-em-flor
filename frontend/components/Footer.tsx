import Image from "next/image";
import Link from "next/link";

import {
    FaInstagram,
    FaFacebookF,
} from "react-icons/fa";

import {
    Mail,
    Phone,
} from "lucide-react";

export default function Footer() {
    return (
        <footer className="border-t border-[#E5E7E0] bg-white">

            <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10">

                <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">

                    {/* BRAND */}
                    <div className="flex items-center gap-5">

                        <Image
                            src="/logo.svg"
                            alt="Momentos em Flor"
                            width={170}
                            height={60}
                            className="h-11 w-auto"
                        />

                        <div className="hidden h-8 w-px bg-[#E5E7E0] sm:block" />

                        <p className="hidden max-w-xs text-xs leading-5 text-gray-500 sm:block">
                            Flores para os momentos que ficam.
                        </p>

                    </div>

                    {/* LINKS */}
                    <nav className="flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-medium text-gray-500">

                        <Link
                            href="/products"
                            className="transition hover:text-[#394633]"
                        >
                            Flores
                        </Link>

                        <Link
                            href="/account/orders"
                            className="transition hover:text-[#394633]"
                        >
                            Encomendas
                        </Link>

                        <Link
                            href="/account"
                            className="transition hover:text-[#394633]"
                        >
                            A minha conta
                        </Link>

                        <Link
                            href="/"
                            className="transition hover:text-[#394633]"
                        >
                            Contactos
                        </Link>

                    </nav>

                    {/* CONTACT / SOCIAL */}
                    <div className="flex items-center gap-3">

                        <a
                            href="mailto:hello@momentosemflor.pt"
                            aria-label="Email"
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E5E7E0] text-[#55624A] transition hover:border-[#55624A] hover:bg-[#F8F9F5]"
                        >
                            <Mail size={15} strokeWidth={1.7} />
                        </a>

                        <a
                            href="tel:+351912345678"
                            aria-label="Telefone"
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E5E7E0] text-[#55624A] transition hover:border-[#55624A] hover:bg-[#F8F9F5]"
                        >
                            <Phone size={15} strokeWidth={1.7} />
                        </a>

                        <a
                            href="#"
                            aria-label="Instagram"
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E5E7E0] text-[#55624A] transition hover:border-[#55624A] hover:bg-[#F8F9F5]"
                        >
                            <FaInstagram size={15} />
                        </a>

                        <a
                            href="#"
                            aria-label="Facebook"
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E5E7E0] text-[#55624A] transition hover:border-[#55624A] hover:bg-[#F8F9F5]"
                        >
                            <FaFacebookF size={14} />
                        </a>

                    </div>

                </div>

                {/* BOTTOM */}
                <div className="mt-8 flex flex-col gap-3 border-t border-[#E5E7E0] pt-5 text-[11px] text-gray-400 sm:flex-row sm:items-center sm:justify-between">

                    <span>
                        © 2026 Momentos em Flor
                    </span>

                    <div className="flex flex-wrap gap-x-5 gap-y-2">

                        <Link
                            href="/"
                            className="transition hover:text-gray-600"
                        >
                            Privacidade
                        </Link>

                        <Link
                            href="/"
                            className="transition hover:text-gray-600"
                        >
                            Termos e Condições
                        </Link>

                        <Link
                            href="/"
                            className="transition hover:text-gray-600"
                        >
                            Cookies
                        </Link>

                    </div>

                </div>

            </div>

        </footer>
    );
}