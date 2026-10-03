
import { apiFetch } from "./client";
import { CreatedResponse } from "./created-response";
import { UpdatedResponse } from "./updated-response";

export abstract class BaseApi<
    TResponse,
    TCreateDto = never,
    TUpdateDto = never,
> {
    protected constructor(
        protected readonly endpoint: string,
    ) {}

    async getAll(): Promise<TResponse[]> {
        return apiFetch<TResponse[]>(this.endpoint);
    }

    async getById(id: number): Promise<TResponse> {
        return apiFetch<TResponse>(`${this.endpoint}/${id}`);
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

    async delete(id: number): Promise<void> {
        return apiFetch<void>(
            `${this.endpoint}/${id}`,
            {
                method: "DELETE",
            },
        );
    }
}
