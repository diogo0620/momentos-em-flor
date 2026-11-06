export type AdminProductList = {
    id: number;
    name: string;
    slug: string;
    type: ProductType;
    customerPrice: number;
    floristPrice: number;
    featured: boolean;
    image: string;
    active: boolean;
}
export type ProductType = "SALE" | "RENTAL";

