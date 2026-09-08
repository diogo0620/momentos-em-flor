import { apiFetch } from "@/lib/api/client";

import type {
    Pagination,
    Product,
    ProductListItem,
    ProductDetail,
} from "@/types/product";

export type ProductListResponse = {
    success: boolean;
    data: ProductListItem[];
    pagination: Pagination;
};

export type ProductAdminListItem = {
    id: number;
    name: string;
    slug: string;
    price: number;
    active: boolean;
    image: {
        url: string;
    } | null;
    category: {
        id: number;
        name: string;
    };
};

export type ProductAdminListResponse = {
    success: boolean;
    data: ProductAdminListItem[];
    pagination: Pagination;
};

export type GetProductsParams = {
    page?: number;
    pageSize?: number;
    search?: string;
    sort?: string;
    order?: "asc" | "desc";
};

function buildProductQuery(
    params: GetProductsParams,
) {
    const searchParams = new URLSearchParams();

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

    return searchParams.toString();
}

// =========================================================
// PUBLIC
// =========================================================

export async function getProducts(
    params: GetProductsParams = {},
) {
    const query = buildProductQuery(params);

    return apiFetch<ProductListResponse>(
        `/products${query ? `?${query}` : ""}`,
    );
}

export async function getProduct(
    id: number,
) {
    return apiFetch<{
        success: boolean;
        data: ProductDetail;
    }>(`/products/${id}`);
}

// =========================================================
// ADMIN
// =========================================================

export async function getAdminProducts(
    params: GetProductsParams = {},
) {
    const query = buildProductQuery(params);

    return apiFetch<ProductAdminListResponse>(
        `/admin/products${query ? `?${query}` : ""}`,
    );
}

export type ProductAdminImage = {
    id: number;
    fileId: number;
    url: string;
    altText: string | null;
    isPrimary: boolean;
    sortOrder: number;
    variantId: number | null;
};

export type ProductAdminComponent = {
    id: number;
    name: string;
    minQuantity: number;
    recommendedQuantity: number;
    maxQuantity: number;
    customerPricePerAdditionalUnit: number;
    floristCompensationPerAdditionalUnit: number;
    sortOrder: number;
    active: boolean;
};

export type ProductAdminVariant = {
    id: number;
    type: string;
    name: string;
    code: string | null;
    price: number;
    floristCompensation: number;
    image: ProductAdminImage | null;
    sortOrder: number;
    active: boolean;
};

export type ProductAdminTaxCode = {
    id: number;
    code: string;
    name: string;
    rate: number;
};

export type ProductAdminDetail = {
    id: number;
    name: string;
    slug: string;
    description: string | null;

    basePrice: number;
    baseFloristCompensation: number;

    /**
     * Final customer price:
     * basePrice + VAT
     */
    price: number;

    taxCode: ProductAdminTaxCode;

    category: {
        id: number;
        name: string;
    };

    images: ProductAdminImage[];

    components: ProductAdminComponent[];

    variants: ProductAdminVariant[];

    sortOrder: number;
    active: boolean;
    createdAt: string;
    updatedAt: string;
};

export async function getAdminProduct(
    id: number,
) {
    return apiFetch<ProductAdminDetail>(
        `/admin/products/${id}`,
    );
}

// =========================================================
// CREATE / UPDATE / DELETE
// =========================================================

export type CreateProductData = {
    name: string;
    description?: string;
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
        data: ProductDetail;
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
        data: ProductDetail;
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