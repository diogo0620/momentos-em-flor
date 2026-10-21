export type AdminUpdateProduct = {
    name: string;
    slug: string;
    description?: string;
    customerPrice: number;
    floristPrice: number;
    featured: boolean;
    categoryIds: number[];
    //images: string[];
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
    id?: number;
    name: string;
    minQuantity: number;
    recommendedQuantity: number;
    maxQuantity: number;
    customerPricePerAdditionalUnit: number;
    floristPricePerAdditionalUnit: number;
}
export type ProductVariant = {
    id?: number;
    type: ProductVariantType,
    name: string;
    description: string;
    customerPrice: number;
    floristPrice: number;
}
