import Link from "next/link";
import { products } from "@/data/products";

export default function FeaturedProductSection() {
    const featuredProduct = products[0];

    return (
        <section className="mx-auto max-w-7xl px-4 py-20">

            <div className="overflow-hidden rounded-[2rem] bg-white shadow-sm">

                <div className="grid lg:grid-cols-2">

                    <div>
                        <img
                            src={featuredProduct.image}
                            alt={featuredProduct.name}
                            className="h-full min-h-[400px] w-full object-cover"
                        />
                    </div>

                    <div className="flex flex-col justify-center p-10 lg:p-16">

                        <span className="w-fit rounded-full bg-[#D6DEC8] px-4 py-2 text-sm font-medium">
                            Produto em Destaque
                        </span>

                        <h2 className="mt-6 text-4xl font-bold">
                            {featuredProduct.name}
                        </h2>

                        <div className="mt-4 text-lg">
                            ⭐⭐⭐⭐⭐
                            <span className="ml-2 text-gray-500">
                                4.9
                            </span>
                        </div>

                        <p className="mt-6 text-lg text-gray-600">
                            {featuredProduct.description}
                        </p>

                        <div className="mt-8 text-4xl font-bold text-[#55624A]">
                            {featuredProduct.price.selling.toFixed(2)} €
                        </div>

                        <div className="mt-10">

                            <Link
                                href={`/products/${featuredProduct.id}`}
                                className="inline-block rounded-full bg-[#55624A] px-8 py-4 font-medium text-white transition hover:opacity-90"
                            >
                                Ver Produto
                            </Link>

                        </div>

                    </div>

                </div>

            </div>

        </section>
    );
}