import { apiFetch, apiUpload } from "@/lib/api/common/client";
import type {
    Pagination,
    CustomerProductDetail,
    CustomerProductList,
    AdminProductDetail,
    AdminProductList,
    ProductComponent,
    ProductVariant,
} from "@/types/product";

type ApiResponse<T> = {
    success: boolean;
    data: T;
};

export type ProductListResponse = ApiResponse<CustomerProductList[]> & {
    pagination: Pagination;
};

export type ProductAdminListResponse = ApiResponse<AdminProductList[]> & {
    pagination: Pagination;
};

export type GetProductsParams = {
    page?: number;
    pageSize?: number;
    search?: string;
    sort?: string;
    order?: "asc" | "desc";
};

export type ProductConfigurationComponent = Omit<
    ProductComponent,
    "id"
> & {
    id?: number;
    active?: boolean;
    sortOrder: number;
};

export type ProductConfigurationVariant = Omit<
    ProductVariant,
    "id" | "image"
> & {
    id?: number;
    clientId?: string;
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
    variantClientId?: string;
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

export type CreateProductData = {
    name: string;
    description?: string;
    customerPrice: number;
    floristPrice: number;
    categoryId: number;
    taxCodeId: number;
    active?: boolean;
};

function buildProductQuery(params: GetProductsParams): string {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
            searchParams.set(key, String(value));
        }
    });

    const query = searchParams.toString();

    return query ? `?${query}` : "";
}

function resolveFileUrl(url: string): string {
    if (url.startsWith("http://") || url.startsWith("https://")) {
        return url;
    }

    const normalizedUrl = url
        .replace(/\\/g, "/")
        .replace(/^\/+/, "");

    return `${FILES_URL}/${normalizedUrl}`;
}

function mapImage<T extends { url: string }>(image: T): T {
    return {
        ...image,
        url: resolveFileUrl(image.url),
    };
}

function mapImages<T extends { url: string }>(images: T[]): T[] {
    return images.map(mapImage);
}

function mapVariant<T extends { image: { url: string } | null }>(
    variant: T,
): T {
    return {
        ...variant,
        image: variant.image
            ? mapImage(variant.image)
            : null,
    };
}

// =========================================================
// PUBLIC
// =========================================================

export async function getProducts(
    params: GetProductsParams = {},
) {
    const response = await apiFetch<ProductListResponse>(
        `/products${buildProductQuery(params)}`,
    );

    return {
        ...response,
        data: response.data.map((product) => ({
            ...product,
            image: product.image
                ? mapImage(product.image)
                : null,
        })),
    };
}

export async function getProduct(id: number) {
    const response = await apiFetch<
        ApiResponse<CustomerProductDetail>
    >(`/products/${id}`);

    return {
        ...response,
        data: {
            ...response.data,
            images: mapImages(response.data.images),
            variants: response.data.variants.map(mapVariant),
        },
    };
}

// =========================================================
// ADMIN
// =========================================================

export async function getAdminProducts(
    params: GetProductsParams = {},
) {
    const response = await apiFetch<ProductAdminListResponse>(
        `/admin/products${buildProductQuery(params)}`,
    );

    return {
        ...response,
        data: response.data.map((product) => ({
            ...product,
            image: product.image
                ? mapImage(product.image)
                : null,
        })),
    };
}

export async function getAdminProduct(
    id: number,
): Promise<AdminProductDetail> {
    const response = await apiFetch<
        ApiResponse<AdminProductDetail>
    >(`/admin/products/${id}`);

    return {
        ...response,
        images: mapImages(response.images),
        variants: response.variants.map(mapVariant),
    };
}

// =========================================================
// CREATE / UPDATE / DELETE
// =========================================================

export async function createProduct(data: CreateProductData) {
    return apiFetch<ApiResponse<CustomerProductDetail>>(
        "/products",
        {
            method: "POST",
            body: JSON.stringify(data),
        },
    );
}

export async function updateProduct(
    id: number,
    data: Partial<CreateProductData>,
) {
    return apiFetch<ApiResponse<CustomerProductDetail>>(
        `/products/${id}`,
        {
            method: "PATCH",
            body: JSON.stringify(data),
        },
    );
}

export async function deleteProduct(id: number) {
    return apiFetch<ApiResponse<unknown>>(
        `/products/${id}`,
        {
            method: "DELETE",
        },
    );
}

// =========================================================
// CONFIGURATION
// =========================================================

export async function updateProductConfiguration(
    id: number,
    data: UpdateProductConfigurationData,
) {
    return apiFetch(
        `/admin/products/${id}/configuration`,
        {
            method: "PATCH",
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