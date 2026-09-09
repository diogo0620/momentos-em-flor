import { apiFetch, apiUpload } from "@/lib/api/client";

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

    const response =
        await apiFetch<ProductAdminListResponse>(
            `/admin/products${query ? `?${query}` : ""}`,
        );

    return {
        ...response,
        data: response.data.map((product) => ({
            ...product,
            image: product.image
                ? {
                    ...product.image,
                    url: resolveFileUrl(
                        product.image.url,
                    ),
                }
                : null,
        })),
    };
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

export type ProductConfigurationComponent = {
    id?: number;
    name: string;
    minQuantity: number;
    recommendedQuantity: number;
    maxQuantity: number;
    customerPricePerAdditionalUnit: number;
    floristCompensationPerAdditionalUnit: number;
    active?: boolean;
    sortOrder: number;
};

export type ProductConfigurationVariant = {
    id?: number;
    clientId?: string;
    type: string;
    name: string;
    code?: string | null;
    price: number;
    floristCompensation: number;
    active?: boolean;
    sortOrder: number;
    imageId?: number | null;
};

export type ProductConfigurationImage = {
    id?: number;
    fileId: number;
    altText?: string | null;
    sortOrder: number;
    isPrimary: boolean;
    variantId?: number | null;
    variantClientId?: string | null;
};

export type UpdateProductConfigurationData = {
    components?: ProductConfigurationComponent[];
    variants?: ProductConfigurationVariant[];
    images?: ProductConfigurationImage[];
};

export type UploadedFile = {
    id: number;
    filename: string;
    originalName: string;
    size: number;
    mimeType: string;
    extension: string;
    path: string;
    url: string;
};

export async function getAdminProduct(
    id: number,
): Promise<ProductAdminDetail> {
    const product = await apiFetch<ProductAdminDetail>(
        `/admin/products/${id}`,
    );

    return {
        ...product,

        images: product.images.map((image) => ({
            ...image,
            url: resolveFileUrl(image.url),
        })),

        variants: product.variants.map((variant) => ({
            ...variant,
            image: variant.image
                ? {
                    ...variant.image,
                    url: resolveFileUrl(variant.image.url),
                }
                : null,
        })),
    };
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
    taxCodeId: number;
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







export async function updateProductConfiguration(
    id: number,
    data: UpdateProductConfigurationData,
) {
    return apiFetch(
        `/admin/products/${id}/configuration`,
        {
            method: 'PATCH',
            body: JSON.stringify(data),
        },
    );
}

export async function uploadProductImage(
    file: File,
): Promise<UploadedFile> {
    const uploaded = await apiUpload<UploadedFile>(
        "/uploads",
        file,
    );

    return {
        ...uploaded,
        url: resolveFileUrl(uploaded.url),
    };
}



const FILES_URL =
    process.env.NEXT_PUBLIC_FILES_URL ??
    "http://localhost:3001";

function resolveFileUrl(url: string): string {
    if (url.startsWith("http://") || url.startsWith("https://")) {
        return url;
    }

    const normalisedUrl = url
        .replace(/\\/g, "/")
        .replace(/^\/+/, "");

    return `${FILES_URL}/${normalisedUrl}`;
}