export type ProductPricingType =
    | "FIXED"
    | "PER_UNIT";

export type ProductListImage = {
    url: string;
};

export type ProductListItem = {
    id: number;
    name: string;
    price: number;
    image: ProductListImage | null;
};

export type ProductCategory = {
    id: number;
    name: string;
};

export type ProductImage = {
    url: string;
};

export type ProductComponent = {
    id: number;
    name: string;
    minQuantity: number;
    recommendedQuantity: number;
    maxQuantity: number;
    customerPricePerAdditionalUnit: number;
};

export type ProductVariant = {
    id: number;
    type: string;
    name: string;
    code: string;
    price: number;
    image: ProductImage | null;
};

export type ProductDetail = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    pricingType: ProductPricingType;
    price: number;
    category: ProductCategory;
    images: ProductImage[];
    components: ProductComponent[];
    variants: ProductVariant[];
};

export type Pagination = {
    page: number;
    pageSize: number;
    total: number;
    pages: number;
};