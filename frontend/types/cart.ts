export type CartItemComponent = {
    componentId: number;
    name: string;
    quantity: number;
};

export type CartItem = {
    cartItemId: string;

    id: number;
    name: string;
    image: string;
    price: number;
    quantity: number;

    variantId?: number;
    variantName?: string;

    components?: CartItemComponent[];
};