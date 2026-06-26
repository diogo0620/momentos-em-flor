import Link from "next/link";
import { products } from "@/data/products";

import ProductCard from "@/components/ProductCard";
import OccasionsSection from "@/components/OccasionsSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import FaqSection from "@/components/FaqSection";
import FeaturedProductSection from "@/components/FeaturedProductSection";

export default function HomePage() {
  const featuredProducts = products.slice(0, 3);

  const categories = [
    "💐 Bouquets",
    "🌹 Rosas",
    "❤️ Romântico",
    "🎂 Aniversário",
    "🕊️ Condolências",
  ];

  return (
    <>
      {/* HERO */}

      <section
        className="relative flex min-h-[750px] items-center"
        style={{
          backgroundImage: "url('/hero.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/45" />

        <div className="relative mx-auto max-w-7xl px-6">

          <div className="max-w-2xl text-white">

            <span className="rounded-full bg-white/20 px-4 py-2 text-sm backdrop-blur-sm">
              🌿 Preparadas por floristas locais
            </span>

            <h1 className="mt-8 text-5xl font-bold leading-tight md:text-6xl">
              Flores para os momentos
              mais importantes
            </h1>

            <p className="mt-6 text-lg text-white/90 md:text-xl">
              Bouquets preparados com cuidado e entregues
              por floristas locais para surpreender quem mais importa.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">

              <Link
                href="/products"
                className="rounded-full bg-white px-8 py-4 font-semibold text-[#55624A] transition hover:scale-105"
              >
                Comprar Flores
              </Link>

              <Link
                href="/products"
                className="rounded-full border border-white px-8 py-4 font-semibold text-white transition hover:bg-white/10"
              >
                Ver Catálogo
              </Link>

            </div>


          </div>

        </div>
      </section>

      {/* CATEGORIAS */}

      {/* CATEGORIAS */}

      <section className="mx-auto max-w-7xl px-4 py-20">

        <div className="mb-12 text-center">

          <span className="text-sm font-semibold uppercase tracking-widest text-[#55624A]">
            Explorar
          </span>

          <h2 className="mt-3 text-4xl font-bold">
            Encontre as flores perfeitas
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-gray-600">
            Descubra coleções cuidadosamente selecionadas para cada momento especial.
          </p>

        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">

          {[
            {
              title: "Bouquets",
              icon: "💐",
              description: "Os mais populares",
            },
            {
              title: "Rosas",
              icon: "🌹",
              description: "Clássicos intemporais",
            },
            {
              title: "Romântico",
              icon: "❤️",
              description: "Momentos especiais",
            },
            {
              title: "Aniversário",
              icon: "🎂",
              description: "Celebre com flores",
            },
            {
              title: "Condolências",
              icon: "🕊️",
              description: "Uma homenagem sentida",
            },
          ].map((category) => (

            <Link
              key={category.title}
              href="/products"
            >

              <div
                className="
            group
            h-full
            rounded-3xl
            bg-white
            p-8
            shadow-sm
            transition-all
            duration-300
            hover:-translate-y-2
            hover:shadow-xl
          "
              >

                <div
                  className="
              flex
              h-16
              w-16
              items-center
              justify-center
              rounded-2xl
              bg-[#D6DEC8]
              text-3xl
              transition
              group-hover:scale-110
            "
                >
                  {category.icon}
                </div>

                <h3 className="mt-6 text-xl font-semibold">
                  {category.title}
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  {category.description}
                </p>

              </div>

            </Link>

          ))}

        </div>

      </section>

      {/* PRODUTOS */}

      <section className="mx-auto max-w-7xl px-4 py-16">

        <h2 className="mb-8 text-3xl font-bold">
          Produtos em Destaque
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">

          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}

        </div>

      </section>

      <FeaturedProductSection />

      {/* COMO FUNCIONA */}

      {/* COMO FUNCIONA */}

      <section className="py-24">

        <div className="mx-auto max-w-7xl px-4">

          <div className="text-center">

            <span className="text-sm font-semibold uppercase tracking-widest text-[#55624A]">
              Simples e rápido
            </span>

            <h2 className="mt-3 text-4xl font-bold">
              Enviar flores nunca foi tão fácil
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-gray-600">
              Tratamos de tudo para que se possa concentrar apenas
              em surpreender alguém especial.
            </p>

          </div>

          <div className="mt-16 grid gap-8 lg:grid-cols-3">

            {/* PASSO 1 */}

            <div className="relative rounded-3xl bg-white p-8 shadow-sm">

              <div
                className="
            absolute
            right-6
            top-6
            text-6xl
            font-bold
            text-[#D6DEC8]
          "
              >
                01
              </div>

              <div className="text-4xl">
                💐
              </div>

              <h3 className="mt-6 text-2xl font-semibold">
                Escolha o bouquet
              </h3>

              <p className="mt-4 text-gray-600 leading-7">
                Explore a nossa seleção de flores frescas e encontre
                o arranjo perfeito para a ocasião.
              </p>

            </div>

            {/* PASSO 2 */}

            <div className="relative rounded-3xl bg-white p-8 shadow-sm">

              <div
                className="
            absolute
            right-6
            top-6
            text-6xl
            font-bold
            text-[#D6DEC8]
          "
              >
                02
              </div>

              <div className="text-4xl">
                ✍️
              </div>

              <h3 className="mt-6 text-2xl font-semibold">
                Personalize a surpresa
              </h3>

              <p className="mt-4 text-gray-600 leading-7">
                Adicione uma dedicatória especial e indique
                o destinatário para tornar o momento ainda mais único.
              </p>

            </div>

            {/* PASSO 3 */}

            <div className="relative rounded-3xl bg-white p-8 shadow-sm">

              <div
                className="
            absolute
            right-6
            top-6
            text-6xl
            font-bold
            text-[#D6DEC8]
          "
              >
                03
              </div>

              <div className="text-4xl">
                🚚
              </div>

              <h3 className="mt-6 text-2xl font-semibold">
                Entregamos por si
              </h3>

              <p className="mt-4 text-gray-600 leading-7">
                Uma florista local prepara o bouquet e garante
                uma entrega cuidada e atempada.
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* BENEFÍCIOS */}

      {/* PORQUE ESCOLHER */}

      <section className="bg-[#F8F9F5] py-24">

        <div className="mx-auto max-w-7xl px-4">

          <div className="text-center">

            <span className="text-sm font-semibold uppercase tracking-widest text-[#55624A]">
              Porque escolher
            </span>

            <h2 className="mt-3 text-4xl font-bold">
              Mais do que flores, entregamos emoções
            </h2>

            <p className="mx-auto mt-4 max-w-3xl text-gray-600">
              Trabalhamos com floristas locais para criar bouquets únicos,
              preparados no dia e entregues com todo o cuidado.
            </p>

          </div>

          <div className="mt-16 grid gap-8 lg:grid-cols-2">

            {/* CARD GRANDE */}

            <div className="rounded-[32px] bg-[#55624A] p-10 text-white">

              <div className="text-5xl">
                🌿
              </div>

              <h3 className="mt-6 text-3xl font-bold">
                Floristas Locais
              </h3>

              <p className="mt-5 text-lg leading-8 text-white/80">
                Cada bouquet é preparado por floristas independentes
                cuidadosamente selecionadas, garantindo qualidade,
                frescura e atenção ao detalhe.
              </p>

            </div>

            {/* BENEFÍCIOS */}

            <div className="grid gap-6 sm:grid-cols-2">

              <div className="rounded-3xl bg-white p-8 shadow-sm">

                <div className="text-4xl">
                  💐
                </div>

                <h3 className="mt-4 text-xl font-semibold">
                  Flores Frescas
                </h3>

                <p className="mt-3 text-gray-600">
                  Preparadas no dia para garantir máxima frescura.
                </p>

              </div>

              <div className="rounded-3xl bg-white p-8 shadow-sm">

                <div className="text-4xl">
                  🚚
                </div>

                <h3 className="mt-4 text-xl font-semibold">
                  Entrega Rápida
                </h3>

                <p className="mt-3 text-gray-600">
                  Entregas rápidas e cuidadas em toda a região.
                </p>

              </div>

              <div className="rounded-3xl bg-white p-8 shadow-sm">

                <div className="text-4xl">
                  ❤️
                </div>

                <h3 className="mt-4 text-xl font-semibold">
                  Feitas com Carinho
                </h3>

                <p className="mt-3 text-gray-600">
                  Cada bouquet é preparado manualmente com atenção aos detalhes.
                </p>

              </div>

              <div className="rounded-3xl bg-white p-8 shadow-sm">

                <div className="text-4xl">
                  ⭐
                </div>

                <h3 className="mt-4 text-xl font-semibold">
                  Qualidade Garantida
                </h3>

                <p className="mt-3 text-gray-600">
                  Trabalhamos apenas com floristas de confiança.
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>

      <OccasionsSection />

      <TestimonialsSection />

      <FaqSection />

      {/* CTA FINAL */}

      <section className="bg-[#55624A] text-white">

        <div className="mx-auto max-w-7xl px-4 py-20 text-center">

          <h2 className="text-4xl font-bold">
            Preparadas por floristas locais
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/80">
            Trabalhamos com floristas independentes para garantir
            flores frescas, entregas rápidas e uma experiência
            verdadeiramente local.
          </p>

          <Link
            href="/products"
            className="mt-8 inline-block rounded-full bg-white px-8 py-4 font-medium text-[#55624A]"
          >
            Ver Catálogo
          </Link>

        </div>

      </section>
    </>
  );
}

