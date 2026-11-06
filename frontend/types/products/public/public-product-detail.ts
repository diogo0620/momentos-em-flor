export type PublicProductDetail = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    price: number;
    categories: PublicProductCategory[];
    image: string;
    components?: PublicProductComponent[];
    variants?: PublicProductVariant[];
    type: ProductType;
    featured: boolean;
    rentalDeposit?: number | null;
}

export type PublicProductCategory = {
    id: number;
    name: string;
}

export type PublicProductComponent = {
    id: number;
    name: string;
    minQuantity: number;
    recommendedQuantity: number;
    maxQuantity: number;
    pricePerAdditionalUnit: number;
}

export type PublicProductVariant = {
    id: number;
    type: ProductVariantType;
    name: string;
    description: string;
    price: number;
    image: string
}

export type ProductType = "SALE" | "RENTAL";
export type ProductVariantType = "SIZE"
