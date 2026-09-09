"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import ProductForm from "@/components/admin/products/ProductForm";
import {
    getAdminProduct,
    type ProductAdminDetail,
} from "@/lib/api/products";

export default function EditProductPage() {
    const params = useParams();
    const router = useRouter();

    const productId = Number(params.id);

    const [product, setProduct] =
        useState<ProductAdminDetail | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState<string | null>(null);

    useEffect(() => {
        if (!Number.isInteger(productId)) {
            setError("Produto inválido.");
            setLoading(false);
            return;
        }

        async function loadProduct() {
            try {
                setLoading(true);
                setError(null);

                const response =
                    await getAdminProduct(productId);

                setProduct(response);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Não foi possível carregar o produto.",
                );
            } finally {
                setLoading(false);
            }
        }

        loadProduct();
    }, [productId]);

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <p className="text-sm text-muted-foreground">
                    A carregar produto...
                </p>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
                <p className="text-sm text-destructive">
                    {error ?? "Produto não encontrado."}
                </p>

                <button
                    type="button"
                    onClick={() => router.back()}
                    className="text-sm font-medium underline"
                >
                    Voltar
                </button>
            </div>
        );
    }

    return (
        <ProductForm
            product={product}
        />
    );
}