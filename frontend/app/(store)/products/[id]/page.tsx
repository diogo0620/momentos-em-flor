import Link from "next/link";
import { ArrowLeft, Flower2 } from "lucide-react";

import ProductDetails from "@/components/ProductDetails";
import { getProduct } from "@/lib/api/products";

type Props = {
    params: Promise<{
        id: string;
    }>;
};

export default async function ProductPage({ params }: Props) {
    const { id } = await params;

    try {
        const productId = Number(id);
        const response = await getProduct(productId);
        const product = response.data;

        if (!product.active) {
            return (
                <main className="min-h-screen bg-[#F7F8F4] px-4 py-10 sm:px-6 sm:py-14">
                    <div className="mx-auto max-w-7xl">
                        <Link
                            href="/products"
                            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-[#55624A]"
                        >
                            <ArrowLeft size={16} />
                            Voltar ao catálogo
                        </Link>

                        <div className="mx-auto mt-12 max-w-2xl rounded-[2rem] border border-[#E2E7DD] bg-white px-6 py-16 text-center shadow-[0_20px_60px_rgba(47,59,42,0.06)]">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#E8EDDF] text-[#55624A]">
                                <Flower2 size={28} />
                            </div>

                            <h1 className="mt-6 text-2xl font-bold text-[#2F3B2A]">
                                Produto indisponível
                            </h1>

                            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500">
                                Este produto já não está disponível no catálogo.
                            </p>

                            <Link
                                href="/products"
                                className="mt-7 inline-flex rounded-full bg-[#55624A] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#46523D]"
                            >
                                Explorar o catálogo
                            </Link>
                        </div>
                    </div>
                </main>
            );
        }

        return (
            <main className="min-h-screen bg-[#F7F8F4] px-4 py-8 sm:px-6 sm:py-10">
                <div className="mx-auto max-w-7xl">
                    <Link
                        href="/products"
                        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-[#55624A]"
                    >
                        <ArrowLeft size={16} />
                        Voltar ao catálogo
                    </Link>

                    <div className="mt-7">
                        <ProductDetails product={product} />
                    </div>
                </div>
            </main>
        );
    } catch (error) {
        console.error("Error loading product:", error);

        return (
            <main className="min-h-screen bg-[#F7F8F4] px-4 py-10 sm:px-6 sm:py-14">
                <div className="mx-auto max-w-7xl">
                    <Link
                        href="/products"
                        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-[#55624A]"
                    >
                        <ArrowLeft size={16} />
                        Voltar ao catálogo
                    </Link>

                    <div className="mx-auto mt-12 max-w-2xl rounded-[2rem] border border-[#E2E7DD] bg-white px-6 py-16 text-center shadow-[0_20px_60px_rgba(47,59,42,0.06)]">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F0F2EC] text-[#55624A]">
                            <Flower2 size={28} />
                        </div>

                        <h1 className="mt-6 text-2xl font-bold text-[#2F3B2A]">
                            Produto não encontrado
                        </h1>

                        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500">
                            Não foi possível encontrar o produto solicitado.
                            Pode continuar a explorar o nosso catálogo.
                        </p>

                        <Link
                            href="/products"
                            className="mt-7 inline-flex rounded-full bg-[#55624A] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#46523D]"
                        >
                            Explorar o catálogo
                        </Link>
                    </div>
                </div>
            </main>
        );
    }
}
