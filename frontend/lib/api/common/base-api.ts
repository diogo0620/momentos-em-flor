import { apiFetch } from "./client";
import { CreatedResponse } from "./created-response";
import { UpdatedResponse } from "./updated-response";

export type PaginationParams = {
    page?: number;
    pageSize?: number;
    search?: string;
    sort?: string;
    order?: "asc" | "desc";
};

export type Pagination = {
    page: number;
    pageSize: number;
    total: number;
    pages: number;
};

export type PaginatedResponse<T> = {
    data: T[];
    pagination: Pagination;
};

export abstract class BaseApi<
    TResponse,
    TCreateDto = never,
    TUpdateDto = never,
> {
    protected constructor(
        protected readonly endpoint: string,
    ) {}

    async getAll(
        params: PaginationParams = {},
    ): Promise<PaginatedResponse<TResponse>> {
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

        const query =
            searchParams.toString();

        return apiFetch<
            PaginatedResponse<TResponse>
        >(
            `${this.endpoint}${
                query ? `?${query}` : ""
            }`,
        )
    }

    async getById(
        id: number,
    ): Promise<TResponse> {
        const response = await apiFetch<{
            success: boolean;
            data: TResponse;
        }>(
            `${this.endpoint}/${id}`,
        );

        return response.data;
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
    ): Promise<UpdatedResponse> {
        return apiFetch<UpdatedResponse>(
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