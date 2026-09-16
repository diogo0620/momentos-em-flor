import { apiFetch } from "@/lib/api/client";

export type TaxCode = {
    id: number;
    code: string;
    name: string;
    rate: number;
    active: boolean;
    createdAt: string;
    updatedAt: string;
};

export type CreateTaxCodeData = {
    code: string;
    name: string;
    rate: number;
};

export type UpdateTaxCodeData = {
    code?: string;
    name?: string;
    rate?: number;
    active?: boolean;
};

type ApiSuccess<T> = {
    success: true;
    data: T;
    message?: string;
};

type ApiDeleteSuccess = {
    success: true;
    data: null;
    message?: string;
};

export async function getTaxCodes(): Promise<
    ApiSuccess<TaxCode[]>
> {
    return apiFetch<ApiSuccess<TaxCode[]>>(
        "/tax-codes",
    );
}

export async function getTaxCode(
    id: number,
): Promise<ApiSuccess<TaxCode>> {
    return apiFetch<ApiSuccess<TaxCode>>(
        `/tax-codes/${id}`,
    );
}

export async function createTaxCode(
    data: CreateTaxCodeData,
): Promise<ApiSuccess<TaxCode>> {
    return apiFetch<ApiSuccess<TaxCode>>(
        "/tax-codes",
        {
            method: "POST",
            body: JSON.stringify(data),
        },
    );
}

export async function updateTaxCode(
    id: number,
    data: UpdateTaxCodeData,
): Promise<ApiSuccess<TaxCode>> {
    return apiFetch<ApiSuccess<TaxCode>>(
        `/tax-codes/${id}`,
        {
            method: "PATCH",
            body: JSON.stringify(data),
        },
    );
}

export async function deleteTaxCode(
    id: number,
): Promise<ApiDeleteSuccess> {
    return apiFetch<ApiDeleteSuccess>(
        `/tax-codes/${id}`,
        {
            method: "DELETE",
        },
    );
}