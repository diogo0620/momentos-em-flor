import { apiFetch } from "./client";
import { CreatedResponse } from "./created-response";

export type PaginationParams = {
    page?: number;
    pageSize?: number;
    search?: string;
    sort?: string;
    order?: "asc" | "desc";
    categoryId?: number;
    minPrice?: number;
    maxPrice?: number;
    type?: "SALE" | "RENTAL";
    active?: boolean;
    featured?: boolean;
    acceptingOrders?:boolean;
    addressDistrict?: boolean;
    status?: string;
    role?: string;
};

export type PaginatedResponse<T> = {
    items: T[];
    page: number;
    pageSize: number;
    total: number;
    pages: number;
};

export type ApiResponse<T> = {
    data: T
}

export abstract class BaseApi<
    TDetailResponse,
    TListResponse,
    TCreateDto = never,
    TUpdateDto = never,
> {
    protected constructor(
        protected readonly endpoint: string,
    ) { }

    async getAll(
        params: PaginationParams = {},
    ): Promise<PaginatedResponse<TListResponse>> {
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

        if (params.sort !== undefined) {
            searchParams.set(
                "sort",
                String(params.sort),
            );
        }

        if (params.order !== undefined) {
            searchParams.set(
                "order",
                String(params.order),
            );
        }

        if (params.search) {
            searchParams.set("search", params.search);
        }

        if (params.categoryId !== undefined) {
            searchParams.set("categoryId", String(params.categoryId));
        }

        if (params.minPrice !== undefined) {
            searchParams.set("minPrice", String(params.minPrice));
        }

        if (params.maxPrice !== undefined) {
            searchParams.set("maxPrice", String(params.maxPrice));
        }

        if (params.type !== undefined) {
            searchParams.set("type", params.type);
        }

        if (params.featured !== undefined) {
            searchParams.set("featured", String(params.featured));
        }

        if (params.status !== undefined) {
            searchParams.set("status", String(params.status));
        }

        if (params.addressDistrict !== undefined) {
            searchParams.set("addressDistrict", String(params.addressDistrict));
        }

        if (params.acceptingOrders !== undefined) {
            searchParams.set("acceptingOrders", String(params.acceptingOrders));
        }

        if(params.role !== undefined){
            searchParams.set("role", String(params.role));
        }



        const query =
            searchParams.toString();

        return apiFetch<
            PaginatedResponse<TListResponse>
        >(
            `${this.endpoint}${query ? `?${query}` : ""
            }`,
        )
    }

    async getById(
        id: number,
    ): Promise<TDetailResponse> {
        return apiFetch(
            `${this.endpoint}/${id}`,
        );
    }

    async create(
        data: TCreateDto,
    ): Promise<CreatedResponse> {
        return apiFetch<CreatedResponse>(
            this.endpoint,
            {
                method: "POST",
                body: JSON.stringify(data),
            },
        );
    }

    async update(
        id: number,
        data: TUpdateDto,
    ): Promise<void> {
        return apiFetch<void>(
            `${this.endpoint}/${id}`,
            {
                method: "PATCH",
                body: JSON.stringify(data),
            },
        );
    }

    async delete(
        id: number,
    ): Promise<void> {
        return apiFetch<void>(
            `${this.endpoint}/${id}`,
            {
                method: "DELETE",
            },
        );
    }
}