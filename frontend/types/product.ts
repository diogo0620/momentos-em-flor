export type ProductPricingType =
    | "FIXED"
    | "PER_UNIT";

export type ProductCategory = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    active: boolean;
    createdAt: string;
    updatedAt: string;
};

export type Product = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    active: boolean;
    pricingType: ProductPricingType;
    basePrice: number;
    category: ProductCategory;
    createdAt: string;
    updatedAt: string;
};

export type Pagination = {
    page: number;
    pageSize: number;
    total: number;
    pages: number;
};