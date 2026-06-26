import { notFound } from "next/navigation";

import { orders } from "@/data/orders";
import { florists } from "@/data/florists";
import { products } from "@/data/products";

export function getOrderDetails(id: string) {
    const order = orders.find(
        (order) => order.id === id
    );

    if (!order) {
        notFound();
    }

    const florist =
        florists.find(
            (florist) =>
                florist.id ===
                order.floristId
        ) ?? null;

    // Mock até existir relação real
    const product =
        products.find(
            (product) =>
                product.name ===
                order.product
        ) ?? products[0];

    const customer = {
        id: "1",
        name: order.customerName,
        email: "cliente@email.pt",
        phone: "+351 912 345 678",
        address: "Rua Exemplo nº 123, Porto",
    };

    const payment = {
        method: "MB WAY",
        status: "PAID",
        reference: "PAY-102938",
    };

    return {
        order,
        customer,
        florist,
        product,
        payment,
    };
}