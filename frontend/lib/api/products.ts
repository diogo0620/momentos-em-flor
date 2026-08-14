import { apiFetch } from "@/lib/api/client";

import type {
    Pagination,
    Product,
} from "@/types/product";

export type ProductListResponse = {
    success: boolean;
    data: Product[];
    pagination: Pagination;
};

export type GetProductsParams = {
    page?: number;
    pageSize?: number;
    search?: string;
    sort?: string;
    order?: "asc" | "desc";
};

export async function getProduct(
    id: number,
) {
    return apiFetch<{
        success: boolean;
        data: Product;
    }>(`/products/${id}`);
}

export async function getProducts(
    params: GetProductsParams = {},
) {
    const searchParams =
        new URLSearchParams();

    if (params.page !== undefined) {
        searchParams.set(
            "page",
            String(params.page),
        );
    }

    if (params.pageSize !== undefined) {
        searchParams.set(
            "pageSize",
            String(params.pageSize),
        );
    }

    if (params.search) {
        searchParams.set(
            "search",
            params.search,
        );
    }

    if (params.sort) {
        searchParams.set(
            "sort",
            params.sort,
        );
    }

    if (params.order) {
        searchParams.set(
            "order",
            params.order,
        );
    }

    const query =
        searchParams.toString();

    return apiFetch<ProductListResponse>(
        `/products${query ? `?${query}` : ""}`,
    );
}

export type CreateProductData = {
    name: string;
    description?: string;
    pricingType: "FIXED" | "PER_UNIT";
    basePrice: number;
    baseFloristCompensation: number;
    categoryId: number;
    active?: boolean;
};

export async function createProduct(
    data: CreateProductData,
) {
    return apiFetch<{
        success: boolean;
        data: Product;
    }>("/products", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function updateProduct(
    id: number,
    data: Partial<CreateProductData>,
) {
    return apiFetch<{
        success: boolean;
        data: Product;
    }>(`/products/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
    });
}

export async function deleteProduct(
    id: number,
) {
    return apiFetch<{
        success: boolean;
        data: unknown;
    }>(`/products/${id}`, {
        method: "DELETE",
    });
}