import { apiFetch } from "@/lib/api/common/client";

export type Category = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    active: boolean;
    createdAt: string;
    updatedAt: string;
};

export type CategoryPagination = {
    page: number;
    pageSize: number;
    total: number;
    pages: number;
};

export type GetCategoriesParams = {
    page?: number;
    pageSize?: number;
    search?: string;
    sort?: string;
    order?: "asc" | "desc";
};

export async function getCategories() {
    return apiFetch<{
        success: boolean;
        data: Category[];
    }>("/categories");
}

export async function getAdminCategories(
    params: GetCategoriesParams = {},
) {
    const searchParams = new URLSearchParams();

    searchParams.set(
        "page",
        String(params.page ?? 1),
    );

    searchParams.set(
        "pageSize",
        String(params.pageSize ?? 10),
    );

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

    return apiFetch<{
        success: boolean;
        data: Category[];
        pagination: CategoryPagination;
    }>(
        `/categories?${searchParams.toString()}`,
    );
}

export async function getCategory(
    id: number,
) {
    return apiFetch<{
        success: boolean;
        data: Category;
    }>(`/categories/${id}`);
}

export type CreateCategoryInput = {
    name: string;
    description?: string;
    active?: boolean;
};

export async function createCategory(
    data: CreateCategoryInput,
) {
    return apiFetch<{
        success: boolean;
        data: Category;
        message?: string;
    }>("/categories", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export type UpdateCategoryInput = {
    name?: string;
    description?: string;
    active?: boolean;
};

export async function updateCategory(
    id: number,
    data: UpdateCategoryInput,
) {
    return apiFetch<{
        success: boolean;
        data: Category;
        message?: string;
    }>(`/categories/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
    });
}

