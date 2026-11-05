"use client";

import {
    useEffect,
    useState,
} from "react";

import {
    useParams,
    useRouter,
} from "next/navigation";

import TaxCodeForm from "@/components/admin/tax-codes/TaxCodeForm";

import { adminTaxCodesApi } from "@/lib/api/tax-codes/admin-tax-codes";
import type { AdminTaxCodeDetail as TaxCode } from "@/types/tax-codes/admin/admin-tax-code-detail";

export default function EditTaxCodePage() {
    const params = useParams();
    const router = useRouter();

    const taxCodeId = Number(
        params.id,
    );

    const [taxCode, setTaxCode] =
        useState<TaxCode | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState<string | null>(null);

    useEffect(() => {
        if (!Number.isInteger(taxCodeId)) {
            setError(
                "Taxa de IVA inválida.",
            );
            setLoading(false);
            return;
        }

        async function loadTaxCode() {
            try {
                setLoading(true);
                setError(null);

                const response =
                    await adminTaxCodesApi.getById(
                        taxCodeId,
                    );

                setTaxCode(
                    response,
                );
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Não foi possível carregar a Taxa de IVA.",
                );
            } finally {
                setLoading(false);
            }
        }

        loadTaxCode();
    }, [taxCodeId]);

    if (loading) {
        return (
            <div className="
                flex
                min-h-[400px]
                items-center
                justify-center
            ">
                <p className="
                    text-sm
                    text-gray-500
                ">
                    A carregar Taxa de IVA...
                </p>
            </div>
        );
    }

    if (error || !taxCode) {
        return (
            <div className="
                flex
                min-h-[400px]
                flex-col
                items-center
                justify-center
                gap-4
            ">
                <p className="
                    text-sm
                    text-red-600
                ">
                    {error ??
                        "Taxa de IVA não encontrada."}
                </p>

                <button
                    type="button"
                    onClick={() =>
                        router.back()
                    }
                    className="
                        text-sm
                        font-medium
                        text-[#55624A]
                        underline
                    "
                >
                    Voltar
                </button>
            </div>
        );
    }

    return (
        <TaxCodeForm
            taxCode={taxCode}
        />
    );
}
