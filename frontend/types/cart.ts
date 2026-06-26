import type { Price } from "./price";

export type CartItem = {
    id: string;

    name: string;

    image: string;

    price: Price;

    quantity: number;

    recipient?: string;

    message?: string;
};