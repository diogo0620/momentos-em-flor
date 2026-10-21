export type PublicProductList = {
    id: number;
    name: string;
    slug: string;
    type: ProductType;
    price: number;
    image: string;
}
export type ProductType = "SALE" | "RENTAL";
