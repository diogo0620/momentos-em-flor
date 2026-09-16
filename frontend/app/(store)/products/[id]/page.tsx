import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import ProductDetails from "@/components/ProductDetails";
import { getProduct } from "@/lib/api/products";

type Props = {
    params: Promise<{
        id: string;
    }>;
};

export default async function ProductPage({
    params,
}: Props) {
    const { id } = await params;

    try {
        const productId = Number(id);
        const response = await getProduct(productId);
        const product = response.data;

        console.log("Product data:", product); // Log the product data for debugging

        if (!product.active) {
            return (
                <div className="mx-auto max-w-7xl px-4 py-12">
                    <Link
                        href="/products"
                        className="
                            inline-flex
                            items-center
                            gap-2
                            text-sm
                            text-gray-500
                            transition
                            hover:text-[#55624A]
                        "
                    >
                        <ArrowLeft size={16} />
                        Voltar ao catálogo
                    </Link>

                    <div className="mt-8 rounded-3xl bg-white p-12 text-center shadow-sm">
                        <h1 className="text-2xl font-bold text-[#2F3B2A]">
                            Produto indisponível
                        </h1>

                        <p className="mt-2 text-gray-500">
                            Este produto já não está disponível.
                        </p>
                    </div>
                </div>
            );
        }

        return (
            <div className="mx-auto max-w-7xl px-4 py-12">
                <Link
                    href="/products"
                    className="
                        inline-flex
                        items-center
                        gap-2
                        text-sm
                        text-gray-500
                        transition
                        hover:text-[#55624A]
                    "
                >
                    <ArrowLeft size={16} />
                    Voltar ao catálogo
                </Link>

                <div className="mt-8">
                    <ProductDetails product={product} />
                </div>
            </div>
        );
    } catch {
        return (
            <div className="mx-auto max-w-7xl px-4 py-12">
                <Link
                    href="/products"
                    className="
                        inline-flex
                        items-center
                        gap-2
                        text-sm
                        text-gray-500
                        transition
                        hover:text-[#55624A]
                    "
                >
                    <ArrowLeft size={16} />
                    Voltar ao catálogo
                </Link>

                <div className="mt-8 rounded-3xl bg-white p-12 text-center shadow-sm">
                    <h1 className="text-2xl font-bold text-[#2F3B2A]">
                        Produto não encontrado
                    </h1>

                    <p className="mt-2 text-gray-500">
                        Não foi possível encontrar o produto solicitado.
                    </p>
                </div>
            </div>
        );
    }
}
