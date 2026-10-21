export type AdminCategoryDetail = {
    id: number;
    name: string;
    description?: string;
    slug: string;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}