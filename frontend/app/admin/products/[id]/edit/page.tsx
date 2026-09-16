import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { notFound } from "next/navigation";

import PageHeader from "@/components/admin/common/PageHeader";
import ProductForm from "@/components/admin/products/ProductForm";
import { getAdminProduct } from "@/lib/api/products";

export default async function EditProductPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const productId = Number(id);

    if (!Number.isInteger(productId)) {
        notFound();
    }

    let product;

    try {
        product = await getAdminProduct(productId);
    } catch {
        notFound();
    }

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div>
                <Link
                    href={`/admin/products/${product.id}`}
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
                    Voltar ao produto
                </Link>

                <div className="mt-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <PageHeader
                        title="Editar produto"
                        subtitle={`Atualiza os dados e a configuração de ${product.name}.`}
                    />

                    <div className="inline-flex w-fit items-center gap-2 rounded-2xl bg-[#F3F5EE] px-4 py-3 text-sm font-semibold text-[#55624A]">
                        <Pencil size={16} />
                        Produto #{product.id}
                    </div>
                </div>
            </div>

            {/* Form */}
            <ProductForm product={product} />
        </div>
    );
}