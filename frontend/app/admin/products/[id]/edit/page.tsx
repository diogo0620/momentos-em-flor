"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import ProductForm from "@/components/admin/products/ProductForm";
import { adminProductsApi } from "@/lib/api/products/admin-products";
import type { AdminProductDetail } from "@/types/products/admin/admin-product-detail";

export default function EditProductPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();

    const [product, setProduct] = useState<AdminProductDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function loadProduct() {
            const id = Number(params.id);

            if (!Number.isInteger(id) || id <= 0) {
                setError("O ID do produto é inválido.");
                setLoading(false);
                return;
            }

            try {
                const response = await adminProductsApi.getById(id);

                if (!cancelled) {
                    setProduct(response);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Não foi possível carregar o produto.",
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        void loadProduct();

        return () => {
            cancelled = true;
        };
    }, [params.id]);

    if (loading) {
        return (
            <div className="rounded-3xl border border-[#E8EBE4] bg-white p-8 shadow-sm">
                <p className="text-sm text-[#7A8474]">
                    A carregar produto...
                </p>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="rounded-3xl border border-red-200 bg-white p-8 shadow-sm">
                <h1 className="text-lg font-semibold text-[#2F3B2A]">
                    Não foi possível abrir o produto
                </h1>

                <p className="mt-2 text-sm text-red-600">
                    {error ?? "O produto não foi encontrado."}
                </p>

                <button
                    type="button"
                    onClick={() => router.push("/admin/products")}
                    className="mt-5 rounded-xl bg-[#55624A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#46523C]"
                >
                    Voltar aos produtos
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-10">
            <ProductForm product={product} />
        </div>
    );
}
