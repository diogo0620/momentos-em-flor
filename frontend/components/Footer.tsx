import Image from "next/image";
import Link from "next/link";

import {
    FaInstagram,
    FaFacebookF,
} from "react-icons/fa";

import {
    Camera,
    Mail,
    Phone,
    MapPin,
} from "lucide-react";

export default function Footer() {
    return (
        <footer className="mt-24 border-t border-[#E5E7E0] bg-[#F8F9F5]">

            <div className="mx-auto max-w-7xl px-6 py-16">

                <div className="grid gap-12 lg:grid-cols-5">

                    {/* BRAND */}

                    <div className="lg:col-span-2">

                        <Image
                            src="/logo.svg"
                            alt="Momentos em Flor"
                            width={220}
                            height={80}
                            className="h-16 w-auto"
                        />

                        <p className="mt-6 max-w-md text-sm leading-7 text-gray-600">
                            Criamos momentos especiais através de flores
                            preparadas com carinho por floristas locais.
                            Cada bouquet é pensado para surpreender,
                            emocionar e criar memórias.
                        </p>

                        <div className="mt-8 flex items-center gap-4">

                            <a
                                href="#"
                                className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm transition hover:-translate-y-1"
                            >
                                <FaInstagram size={18} />
                            </a>

                            <a
                                href="#"
                                className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm transition hover:-translate-y-1"
                            >
                                <FaFacebookF size={18} />
                            </a>

                        </div>

                    </div>

                    {/* PRODUTOS */}

                    <div>

                        <h3 className="font-semibold text-[#55624A]">
                            Produtos
                        </h3>

                        <div className="mt-5 flex flex-col gap-3 text-sm text-gray-600">

                            <Link href="/products">
                                Catálogo
                            </Link>

                            <Link href="/products">
                                Bouquets
                            </Link>

                            <Link href="/products">
                                Rosas
                            </Link>

                            <Link href="/products">
                                Ocasiões Especiais
                            </Link>

                        </div>

                    </div>

                    {/* EMPRESA */}

                    <div>

                        <h3 className="font-semibold text-[#55624A]">
                            Empresa
                        </h3>

                        <div className="mt-5 flex flex-col gap-3 text-sm text-gray-600">

                            <Link href="/">
                                Sobre Nós
                            </Link>

                            <Link href="/">
                                As Nossas Floristas
                            </Link>

                            <Link href="/">
                                Contactos
                            </Link>

                            <Link href="/">
                                Perguntas Frequentes
                            </Link>

                        </div>

                    </div>

                    {/* CONTACTOS */}

                    <div>

                        <h3 className="font-semibold text-[#55624A]">
                            Contactos
                        </h3>

                        <div className="mt-5 space-y-4 text-sm text-gray-600">

                            <div className="flex items-start gap-3">

                                <MapPin
                                    size={16}
                                    className="mt-1 shrink-0"
                                />

                                <span>
                                    Portugal
                                </span>

                            </div>

                            <div className="flex items-center gap-3">

                                <Phone
                                    size={16}
                                />

                                <span>
                                    +351 912 345 678
                                </span>

                            </div>

                            <div className="flex items-center gap-3">

                                <Mail
                                    size={16}
                                />

                                <span>
                                    hello@momentosemflor.pt
                                </span>

                            </div>

                        </div>

                    </div>

                </div>

                {/* BOTTOM BAR */}

                <div className="mt-16 flex flex-col gap-4 border-t border-[#E5E7E0] pt-8 text-sm text-gray-500 md:flex-row md:items-center md:justify-between">

                    <div>
                        © 2026 Momentos em Flor. Todos os direitos reservados.
                    </div>

                    <div className="flex gap-6">

                        <Link href="/">
                            Política de Privacidade
                        </Link>

                        <Link href="/">
                            Termos e Condições
                        </Link>

                        <Link href="/">
                            Cookies
                        </Link>

                    </div>

                </div>

            </div>

        </footer>
    );
}