export type AdminCreateProduct = {
    name: string;
    slug: string;
    description?: string;
    type: ProductType;
    customerPrice: number;
    floristPrice: number;
    featured: boolean;
    categoryIds: number[];
    taxCodeId: number;
    components: ProductComponent[];
    variants: ProductVariant[];
    active: boolean;
    rentalDeposit?: number;
}
export type ProductType = "SALE" | "RENTAL";
export type ProductVariantType = "SIZE";
export type ProductCategory = {
    id: number;
    name: string;
}
export type ProductComponent = {
    name: string;
    minQuantity: number;
    recommendedQuantity: number;
    maxQuantity: number;
    customerPricePerAdditionalUnit: number;
    floristPricePerAdditionalUnit: number;
}
export type ProductVariant = {
    type: ProductVariantType,
    name: string;
    description: string;
    customerPrice: number;
    floristPrice: number;
}
