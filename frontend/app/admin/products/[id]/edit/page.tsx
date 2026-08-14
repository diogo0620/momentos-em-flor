import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import PageHeader from "@/components/admin/common/PageHeader";
import ProductForm from "@/components/admin/products/ProductForm";

import { getProduct } from "@/lib/api/products";

export default async function EditProductPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const productId = Number(id);

    if (Number.isNaN(productId)) {
        return (
            <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
                <h2 className="text-2xl font-bold">
                    Produto inválido
                </h2>
            </div>
        );
    }

    try {
        const response =
            await getProduct(productId);

        const product = response.data;

        return (
            <div>
                <Link
                    href={`/admin/products/${product.id}`}
                    className="inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-[#55624A]"
                >
                    <ArrowLeft size={16} />
                    Voltar ao produto
                </Link>

                <div className="mt-6">
                    <PageHeader
                        title="Editar produto"
                        subtitle={`Editar ${product.name}`}
                    />
                </div>

                <div className="mt-8">
                    <ProductForm
                        product={product}
                    />
                </div>
            </div>
        );
    } catch {
        return (
            <div>
                <Link
                    href="/admin/products"
                    className="inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-[#55624A]"
                >
                    <ArrowLeft size={16} />
                    Voltar aos produtos
                </Link>

                <div className="mt-8 rounded-3xl bg-white p-10 text-center shadow-sm">
                    <h2 className="text-2xl font-bold">
                        Produto não encontrado
                    </h2>

                    <p className="mt-2 text-gray-500">
                        Não foi possível carregar o
                        produto #{id}.
                    </p>
                </div>
            </div>
        );
    }
}