import { notFound } from "next/navigation";

import { florists } from "@/data/florists";
import { products } from "@/data/products";
import { orders } from "@/data/orders";

export function getFloristDetails(id: string) {

    const florist = florists.find(
        (f) => f.id === id
    );

    if (!florist) {
        notFound();
    }

    const floristProducts =
        products.filter(
            (product) =>
                florist.products.includes(
                    product.name
                )
        );

    const floristOrders =
        orders.filter(
            (order) =>
                order.floristId === florist.id
        );

    const statistics = {
        totalOrders: floristOrders.length,

        revenue: floristOrders.reduce(
            (sum, order) => sum + order.total,
            0
        ),

        rating: florist.rating,

        totalProducts: floristProducts.length,
    };

    return {

        florist,

        products:
            floristProducts,

        orders:
            floristOrders,

        statistics,

    };

}