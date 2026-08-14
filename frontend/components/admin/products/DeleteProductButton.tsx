"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, X } from "lucide-react";

import { deleteProduct } from "@/lib/api/products";

type Props = {
    productId: number;
    productName: string;
};

export default function DeleteProductButton({
    productId,
    productName,
}: Props) {
    const router = useRouter();

    const [isOpen, setIsOpen] =
        useState(false);

    const [isDeleting, setIsDeleting] =
        useState(false);

    const [error, setError] =
        useState<string | null>(null);

    async function handleDelete() {
        try {
            setIsDeleting(true);
            setError(null);

            await deleteProduct(productId);

            router.push("/admin/products");
            router.refresh();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Não foi possível eliminar o produto.",
            );

            setIsDeleting(false);
        }
    }

    return (
        <>
            <button
                type="button"
                onClick={() =>
                    setIsOpen(true)
                }
                className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-2xl
                    border
                    border-red-200
                    px-5
                    py-3
                    font-medium
                    text-red-600
                    transition
                    hover:bg-red-50
                "
            >
                <Trash2 size={17} />

                Eliminar
            </button>

            {isOpen && (
                <div
                    className="
                        fixed
                        inset-0
                        z-[100]
                        flex
                        items-center
                        justify-center
                        bg-black/40
                        px-4
                    "
                >
                    <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">

                        <div className="flex items-start justify-between gap-4">

                            <div>
                                <h2 className="text-xl font-bold text-[#2F3B2A]">
                                    Eliminar produto
                                </h2>

                                <p className="mt-2 text-sm leading-6 text-gray-500">
                                    Tens a certeza que queres
                                    eliminar{" "}
                                    <span className="font-semibold text-gray-700">
                                        {productName}
                                    </span>
                                    ?
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setIsOpen(
                                        false,
                                    )
                                }
                                disabled={
                                    isDeleting
                                }
                                className="
                                    flex
                                    h-9
                                    w-9
                                    items-center
                                    justify-center
                                    rounded-full
                                    text-gray-400
                                    transition
                                    hover:bg-gray-100
                                "
                            >
                                <X size={18} />
                            </button>

                        </div>

                        <div className="mt-6 rounded-2xl bg-red-50 p-4 text-sm text-red-600">
                            Esta ação não pode ser
                            desfeita.
                        </div>

                        {error && (
                            <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
                                {error}
                            </div>
                        )}

                        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                            <button
                                type="button"
                                onClick={() =>
                                    setIsOpen(
                                        false,
                                    )
                                }
                                disabled={
                                    isDeleting
                                }
                                className="
                                    rounded-2xl
                                    border
                                    border-gray-200
                                    px-5
                                    py-3
                                    font-medium
                                    text-gray-600
                                    transition
                                    hover:bg-gray-50
                                    disabled:opacity-50
                                "
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                onClick={
                                    handleDelete
                                }
                                disabled={
                                    isDeleting
                                }
                                className="
                                    rounded-2xl
                                    bg-red-600
                                    px-5
                                    py-3
                                    font-medium
                                    text-white
                                    transition
                                    hover:bg-red-700
                                    disabled:cursor-not-allowed
                                    disabled:opacity-50
                                "
                            >
                                {isDeleting
                                    ? "A eliminar..."
                                    : "Sim, eliminar"}
                            </button>

                        </div>

                    </div>
                </div>
            )}
        </>
    );
}