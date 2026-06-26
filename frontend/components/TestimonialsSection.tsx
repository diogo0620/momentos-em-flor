const testimonials = [
  {
    name: "Maria Silva",
    city: "Porto",
    text: "As flores chegaram lindas e exatamente como nas fotografias. Foi uma experiência impecável do início ao fim.",
  },
  {
    name: "João Costa",
    city: "Aveiro",
    text: "Entrega rápida, excelente comunicação e um bouquet ainda mais bonito do que esperava.",
  },
  {
    name: "Ana Martins",
    city: "Lisboa",
    text: "Foi a surpresa perfeita para um aniversário. Recomendo sem qualquer dúvida.",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-24">

      <div className="mx-auto max-w-7xl px-4">

        {/* HEADER */}

        <div className="text-center">

          <span className="text-sm font-semibold uppercase tracking-widest text-[#55624A]">
            Testemunhos
          </span>

          <h2 className="mt-3 text-4xl font-bold">
            O que os nossos clientes dizem
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-gray-600">
            Centenas de clientes já confiaram na Momentos em Flor
            para surpreender quem mais importa.
          </p>

        </div>

        {/* TESTIMONIALS */}

        <div className="mt-14 grid gap-8 lg:grid-cols-3">

          {testimonials.map((testimonial) => (

            <div
              key={testimonial.name}
              className="
                rounded-3xl
                border
                border-[#E5E7E0]
                bg-white
                p-8
                transition-all
                duration-300
                hover:-translate-y-1
                hover:shadow-lg
              "
            >

              <div className="inline-flex items-center rounded-full bg-[#F3F5EE] px-3 py-1 text-sm font-medium text-[#55624A]">
                Cliente Verificado ✓
              </div>

              <p className="mt-6 text-lg leading-8 text-gray-600">
                "{testimonial.text}"
              </p>

              <div className="mt-8 h-px bg-[#E5E7E0]" />

              <div className="mt-6 flex items-center gap-4">

                <div
                  className="
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-full
                    bg-[#D6DEC8]
                    text-lg
                    font-semibold
                    text-[#55624A]
                  "
                >
                  {testimonial.name.charAt(0)}
                </div>

                <div>

                  <div className="font-semibold text-[#2F3B2A]">
                    {testimonial.name}
                  </div>

                  <div className="text-sm text-gray-500">
                    {testimonial.city}
                  </div>

                </div>

              </div>

            </div>

          ))}

        </div>

        {/* TRUST BAR */}

        <div className="mt-16 rounded-3xl bg-[#55624A] px-8 py-10 text-center text-white">

          <div className="grid gap-8 md:grid-cols-3">

            <div>

              <div className="text-4xl font-bold">
                500+
              </div>

              <div className="mt-2 text-white/80">
                Encomendas Entregues
              </div>

            </div>

            <div>

              <div className="text-4xl font-bold">
                4.9★
              </div>

              <div className="mt-2 text-white/80">
                Avaliação Média
              </div>

            </div>

            <div>

              <div className="text-4xl font-bold">
                98%
              </div>

              <div className="mt-2 text-white/80">
                Clientes Satisfeitos
              </div>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}