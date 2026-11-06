
export type AdminCategoryDetail = {
    id: number;
    name: string;
    description?: string | null;
    slug: string;
    image: string | null;
    featured: boolean;
    active: boolean;
    createdAt: Date | string;
    updatedAt: Date | string;
};
