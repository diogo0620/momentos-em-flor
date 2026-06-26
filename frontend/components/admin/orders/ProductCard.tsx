import Link from "next/link";

import SectionCard from "@/components/admin/common/SectionCard";
import InfoField from "@/components/admin/common/InfoField";
import { Product } from "@/types/product";

type Props = {
    product: Product
};

export default function ProductCard({
    product,
}: Props) {
    return (
        <SectionCard title="Produto">

            <div className="flex gap-6">

                <div
                    className="
                        flex
                        h-28
                        w-28
                        items-center
                        justify-center
                        rounded-2xl
                        bg-[#FAFAF7]
                        p-3
                    "
                >

                    <img
                        src={product.image}
                        alt={product.name}
                        className="
                            max-h-full
                            max-w-full
                            object-contain
                        "
                    />

                </div>

                <div className="flex-1">

                    <div className="grid gap-6">

                        <InfoField
                            label="Nome"
                            value={product.name}
                        />

                        <InfoField
                            label="Categoria"
                            value={product.category}
                        />

                        <InfoField
                            label="Preço"
                            value={`${product.price.selling.toFixed(2)} €`}
                        />

                    </div>

                    <Link
                        href={`/admin/products/${product.id}`}
                        className="
                            mt-6
                            inline-flex
                            rounded-full
                            border
                            border-[#55624A]
                            px-4
                            py-2
                            text-sm
                            font-medium
                            text-[#55624A]
                            transition-all
                            hover:bg-[#55624A]
                            hover:text-white
                        "
                    >
                        Ver Produto
                    </Link>

                </div>

            </div>

        </SectionCard>
    );
}