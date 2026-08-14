import Link from "next/link";
import {
    ArrowLeft,
    CalendarDays,
    Package,
    Tag,
} from "lucide-react";

import PageHeader from "@/components/admin/common/PageHeader";
import StatusBadge from "@/components/admin/common/StatusBadge";
import DeleteProductButton from "@/components/admin/products/DeleteProductButton";

import { getProduct } from "@/lib/api/products";

export default async function ProductDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const productId = Number(id);

    if (Number.isNaN(productId)) {
        return (
            <div className="p-10">
                Produto inválido.
            </div>
        );
    }

    let product;

    try {
        const response =
            await getProduct(productId);

        product = response.data;
    } catch {
        return (
            <div>
                <Link
                    href="/admin/products"
                    className="inline-flex items-center gap-2 text-sm text-[#55624A]"
                >
                    <ArrowLeft size={16} />
                    Voltar aos produtos
                </Link>

                <div className="mt-8 rounded-3xl bg-white p-10 text-center shadow-sm">
                    <Package
                        size={40}
                        className="mx-auto text-gray-300"
                    />

                    <h2 className="mt-4 text-2xl font-bold">
                        Produto não encontrado
                    </h2>

                    <p className="mt-2 text-gray-500">
                        Não foi possível encontrar o produto #{id}.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div>

            <Link
                href="/admin/products"
                className="inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-[#55624A]"
            >
                <ArrowLeft size={16} />
                Voltar aos produtos
            </Link>

            <div className="mt-6">

                <PageHeader
                    title={product.name}
                    subtitle={`Detalhes do produto #${product.id}`}
                />

                <div className="mt-6 flex flex-wrap justify-end gap-3">
    <Link
        href={`/admin/products/${product.id}/edit`}
        className="
            rounded-2xl
            bg-[#55624A]
            px-5
            py-3
            font-medium
            text-white
            transition
            hover:opacity-90
        "
    >
        Editar produto
    </Link>

    <DeleteProductButton
        productId={product.id}
        productName={product.name}
    />
</div>

            </div>

            {/* SUMMARY */}

            <div className="mt-8 grid gap-6 lg:grid-cols-3">

                <div className="rounded-3xl bg-white p-6 shadow-sm">

                    <div className="flex items-center gap-3">

                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F3F5EE] text-[#55624A]">
                            <Package size={21} />
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Estado
                            </p>

                            <div className="mt-2">
                                <StatusBadge
                                    status={
                                        product.active
                                            ? "ACTIVE"
                                            : "INACTIVE"
                                    }
                                />
                            </div>
                        </div>

                    </div>

                </div>

                <div className="rounded-3xl bg-white p-6 shadow-sm">

                    <div className="flex items-center gap-3">

                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F3F5EE] text-[#55624A]">
                            <Tag size={21} />
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Categoria
                            </p>

                            <p className="mt-1 text-lg font-semibold text-[#2F3B2A]">
                                {
                                    product
                                        .category
                                        .name
                                }
                            </p>
                        </div>

                    </div>

                </div>

                <div className="rounded-3xl bg-white p-6 shadow-sm">

                    <p className="text-sm text-gray-500">
                        Preço base
                    </p>

                    <p className="mt-2 text-3xl font-bold text-[#55624A]">
                        {product.basePrice.toFixed(
                            2,
                        )}{" "}
                        €
                    </p>

                    <p className="mt-1 text-sm text-gray-400">
                        {product.pricingType ===
                        "FIXED"
                            ? "Preço fixo"
                            : "Preço por unidade"}
                    </p>

                </div>

            </div>

            {/* DETAILS */}

            <div className="mt-8 grid gap-8 lg:grid-cols-3">

                <div className="lg:col-span-2">

                    <div className="rounded-3xl bg-white p-8 shadow-sm">

                        <h2 className="text-xl font-bold text-[#2F3B2A]">
                            Informações do produto
                        </h2>

                        <div className="mt-8 grid gap-6 md:grid-cols-2">

                            <div>
                                <p className="text-sm text-gray-400">
                                    Nome
                                </p>

                                <p className="mt-1 font-medium">
                                    {product.name}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-400">
                                    Slug
                                </p>

                                <p className="mt-1 font-medium">
                                    {product.slug}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-400">
                                    Categoria
                                </p>

                                <p className="mt-1 font-medium">
                                    {
                                        product
                                            .category
                                            .name
                                    }
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-400">
                                    Tipo de preço
                                </p>

                                <p className="mt-1 font-medium">
                                    {product.pricingType ===
                                    "FIXED"
                                        ? "Preço fixo"
                                        : "Por unidade"}
                                </p>
                            </div>

                        </div>

                        <div className="mt-8 border-t border-gray-100 pt-8">

                            <p className="text-sm text-gray-400">
                                Descrição
                            </p>

                            <p className="mt-2 leading-7 text-gray-600">
                                {product.description ||
                                    "Sem descrição."}
                            </p>

                        </div>

                    </div>

                </div>

                {/* METADATA */}

                <div className="rounded-3xl bg-white p-8 shadow-sm">

                    <h2 className="text-xl font-bold text-[#2F3B2A]">
                        Metadados
                    </h2>

                    <div className="mt-8 space-y-6">

                        <div className="flex gap-3">

                            <CalendarDays
                                size={18}
                                className="mt-0.5 text-gray-400"
                            />

                            <div>
                                <p className="text-sm text-gray-400">
                                    Criado em
                                </p>

                                <p className="mt-1 text-sm font-medium">
                                    {new Date(
                                        product.createdAt,
                                    ).toLocaleString(
                                        "pt-PT",
                                    )}
                                </p>
                            </div>

                        </div>

                        <div className="flex gap-3">

                            <CalendarDays
                                size={18}
                                className="mt-0.5 text-gray-400"
                            />

                            <div>
                                <p className="text-sm text-gray-400">
                                    Atualizado em
                                </p>

                                <p className="mt-1 text-sm font-medium">
                                    {new Date(
                                        product.updatedAt,
                                    ).toLocaleString(
                                        "pt-PT",
                                    )}
                                </p>
                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}