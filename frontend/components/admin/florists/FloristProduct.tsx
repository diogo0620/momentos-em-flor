import Link from "next/link";

import SectionCard from "@/components/admin/common/SectionCard";
import { Product } from "@/types/product";


type Props = {
    products: Product[];
};

export default function FloristProducts({
    products,
}: Props) {
    return (
        <SectionCard title="Produtos">

            {products.length === 0 ? (

                <p className="text-gray-500">
                    Esta florista ainda não possui produtos associados.
                </p>

            ) : (

                <div className="space-y-4">

                    {products.map((product) => (

                        <Link
                            key={product.id}
                            href={`/admin/products/${product.id}`}
                            className="
                                flex
                                items-center
                                gap-5
                                rounded-2xl
                                border
                                border-gray-100
                                p-4
                                transition
                                hover:border-[#D6DEC8]
                                hover:bg-[#F8F9F5]
                            "
                        >

                            <div
                                className="
                                    flex
                                    h-20
                                    w-20
                                    items-center
                                    justify-center
                                    rounded-2xl
                                    bg-[#FAFAF7]
                                "
                            >

                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="
                                        max-h-16
                                        object-contain
                                    "
                                />

                            </div>

                            <div className="flex-1">

                                <h3 className="font-semibold text-[#2F3B2A]">
                                    {product.name}
                                </h3>

                                <p className="mt-1 text-sm text-gray-500">
                                    {product.category}
                                </p>

                            </div>

                            <div className="text-right">

                                <p className="font-semibold text-[#2F3B2A]">
                                    {product.price.selling.toFixed(2)} €
                                </p>

                            </div>

                        </Link>

                    ))}

                </div>

            )}

        </SectionCard>
    );
}