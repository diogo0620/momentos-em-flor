import Link from "next/link";

const occasions = [
    {
        title: "Aniversários",
        emoji: "🎂",
        description:
            "Surpreenda alguém especial com um bouquet preparado no próprio dia.",
    },
    {
        title: "Romântico",
        emoji: "❤️",
        description:
            "Flores para celebrar amor, paixão e momentos inesquecíveis.",
    },
    {
        title: "Casamentos",
        emoji: "💍",
        description:
            "Arranjos elegantes para um dos dias mais importantes da vida.",
    },
    {
        title: "Condolências",
        emoji: "🕊️",
        description:
            "Uma forma delicada de demonstrar apoio e respeito.",
    },
];

export default function OccasionsSection() {
    return (
        <section className="bg-[#F3F5EE]">
            <div className="mx-auto max-w-7xl px-4 py-20">

                <div className="mb-14 text-center">

                    <span className="rounded-full bg-[#D6DEC8] px-4 py-2 text-sm font-medium">
                        Comprar por ocasião
                    </span>

                    <h2 className="mt-6 text-4xl font-bold">
                        Flores para todos os momentos
                    </h2>

                    <p className="mx-auto mt-4 max-w-2xl text-gray-600">
                        Seja uma celebração, uma surpresa ou uma mensagem de carinho,
                        temos o bouquet certo para cada ocasião.
                    </p>

                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">

                    {occasions.map((occasion) => (
                        <Link
                            href="/products"
                            key={occasion.title}
                        >
                            <div className="group h-full rounded-3xl bg-white p-8 shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl">

                                <div className="text-5xl transition duration-300 group-hover:scale-110">
                                    {occasion.emoji}
                                </div>

                                <h3 className="mt-6 text-xl font-semibold">
                                    {occasion.title}
                                </h3>

                                <p className="mt-3 text-sm leading-relaxed text-gray-600">
                                    {occasion.description}
                                </p>

                                <div className="mt-6 text-sm font-medium text-[#55624A]">
                                    Explorar →
                                </div>

                            </div>
                        </Link>
                    ))}

                </div>

            </div>
        </section>
    );
}