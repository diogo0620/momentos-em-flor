export type AdminProductDetail = {
    id: number;
    name: string;
    slug: string;
    description?: string;
    type: ProductType;
    customerPrice: number;
    floristPrice: number;
    featured: boolean;
    categories: ProductCategory[];
    image: string;
    components: ProductComponent[];
    variants: ProductVariant[];
    taxCode: ProductTaxCode;
    active: boolean;
    rentalDeposit?: number;
    createdAt: boolean;
    updatedAt: boolean;
}
export type ProductType = "SALE" | "RENTAL";
export type ProductVariantType = "SIZE";
export type ProductCategory = {
    id: number;
    name: string;
}
export type ProductComponent = {
    id: number;
    name: string;
    minQuantity: number;
    recommendedQuantity: number;
    maxQuantity: number;
    customerPricePerAdditionalUnit: number;
    floristPricePerAdditionalUnit: number;
}
export type ProductVariant = {
    id: number;
    type: ProductVariantType,
    name: string;
    description: string;
    customerPrice: number;
    floristPrice: number;
    image: string
}
export type ProductTaxCode = {
    id: number;
    name: string;
}
