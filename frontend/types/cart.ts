export type CartItem = {
    id: string;
    name: string;
    price: number;
    quantity: number;
    recipient?: string;
    message?: string;
};