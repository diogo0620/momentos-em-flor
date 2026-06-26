import { notFound } from "next/navigation";

import { products } from "@/data/products";
import { florists } from "@/data/florists";

export function getProductDetails(id: string) {
    const product = products.find(
        (product) => product.id === id
    );

    if (!product) {
        notFound();
    }

    // TODO:
    // No futuro isto virá da BD através da tabela ProductFlorist
    const productFlorists = florists.map(
        (florist) => ({
            id: florist.id,
            name: florist.name,
            city: florist.city,
            rating: florist.rating,

            // Mock apenas para desenvolvimento
            floristPrice:
                Number(
                    (
                        product.price.selling *
                        (0.55 +
                            Math.random() * 0.15)
                    ).toFixed(2)
                ),
        })
    );

    // Mock
    const pricing = {
        sellingPrice: product.price,

        floristPrice:
            productFlorists[0].floristPrice,
    };

    return {
        product,
        pricing,
        florists: productFlorists,
    };
}