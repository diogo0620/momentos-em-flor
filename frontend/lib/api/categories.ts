import { apiFetch } from "@/lib/api/client";

export type Category = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    active: boolean;
    createdAt: string;
    updatedAt: string;
};

export async function getCategories() {
    return apiFetch<{
        success: boolean;
        data: Category[];
    }>("/categories");
}