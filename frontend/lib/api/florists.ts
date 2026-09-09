import { apiFetch } from "@/lib/api/client";

import type { Florist } from "@/types/florist";

export type FloristListResponse = {
    success: boolean;
    data: Florist[];
    pagination: {
        page: number;
        pageSize: number;
        total: number;
        pages: number;
    };
};

export type GetFloristsParams = {
    page?: number;
    pageSize?: number;
    search?: string;
    sort?: string;
    order?: "asc" | "desc";
};

export async function getFlorists(
    params?: GetFloristsParams,
) {
    const searchParams =
        new URLSearchParams();

    if (params?.page !== undefined) {
        searchParams.set(
            "page",
            params.page.toString(),
        );
    }

    if (params?.pageSize !== undefined) {
        searchParams.set(
            "pageSize",
            params.pageSize.toString(),
        );
    }

    if (params?.search) {
        searchParams.set(
            "search",
            params.search,
        );
    }

    if (params?.sort) {
        searchParams.set(
            "sort",
            params.sort,
        );
    }

    if (params?.order) {
        searchParams.set(
            "order",
            params.order,
        );
    }

    const query =
        searchParams.toString();

    return apiFetch<FloristListResponse>(
        `/florists${query ? `?${query}` : ""}`,
    );
}

export async function getFlorist(
    id: number,
) {
    return apiFetch<{
        success: boolean;
        data: Florist;
    }>(`/florists/${id}`);
}

export type CreateFloristData = {
    name: string;

    legalName?: string;

    taxNumber: string;

    email: string;

    phone: string;

    website?: string;

    description?: string;

    deliveryRadiusKm: number;

    address: {
        street: string;

        street2?: string;

        postalCode: string;

        city: string;

        district: string;

        countryCode: string;

        latitude: number;

        longitude: number;

        notes?: string;
    };
};

export async function createFlorist(
    data: CreateFloristData,
) {
    return apiFetch<{
        success: boolean;
        data: Florist;
    }>("/florists", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function updateFlorist(
    id: number,
    data: Partial<CreateFloristData>,
) {
    return apiFetch<{
        success: boolean;
        data: Florist;
    }>(`/florists/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
    });
}

export async function deleteFlorist(
    id: number,
) {
    return apiFetch<{
        success: boolean;
        data: unknown;
    }>(`/florists/${id}`, {
        method: "DELETE",
    });
}