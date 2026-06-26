import { products } from "@/data/products";

import ProductDetails from "@/components/ProductDetails";

export default async function ProductPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const product = products.find(
        (p) => p.id === id
    );

    if (!product) {
        return (
            <div className="p-10">
                Produto não encontrado
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-7xl px-4 py-12">

            <div className="grid gap-12 lg:grid-cols-2">

                <div>

                    <img
                        src={product.image}
                        alt={product.name}
                        className="h-[500px] w-full rounded-3xl object-cover"
                    />

                </div>

                <ProductDetails
                    product={product}
                />

            </div>

        </div>
    );
}