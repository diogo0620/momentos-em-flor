"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question:
      "As flores são entregues no mesmo dia?",
    answer:
      "Dependendo da localização e da hora da encomenda, poderá existir entrega no próprio dia.",
  },
  {
    question:
      "Posso adicionar uma mensagem personalizada?",
    answer:
      "Sim. Pode incluir uma dedicatória personalizada para acompanhar o bouquet.",
  },
  {
    question:
      "Quem prepara as flores?",
    answer:
      "Trabalhamos exclusivamente com floristas locais cuidadosamente selecionadas.",
  },
  {
    question:
      "As imagens correspondem ao produto entregue?",
    answer:
      "Os bouquets são preparados manualmente, pelo que podem existir pequenas diferenças mantendo sempre o estilo apresentado.",
  },
  {
    question:
      "Posso agendar a entrega para uma data específica?",
    answer:
      "Sim. Durante o checkout poderá selecionar a data pretendida para entrega.",
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] =
    useState<number | null>(0);

  return (
    <section className="bg-[#F8F9F5] py-24">

      <div className="mx-auto max-w-4xl px-4">

        <div className="text-center">

          <span className="text-sm font-semibold uppercase tracking-widest text-[#55624A]">
            FAQ
          </span>

          <h2 className="mt-3 text-4xl font-bold">
            Perguntas Frequentes
          </h2>

          <p className="mt-4 text-gray-600">
            Tudo o que precisa de saber antes de encomendar.
          </p>

        </div>

        <div className="mt-12 space-y-4">

          {faqs.map((faq, index) => {
            const isOpen =
              openIndex === index;

            return (
              <div
                key={faq.question}
                className="
                  overflow-hidden
                  rounded-3xl
                  bg-white
                  shadow-sm
                "
              >

                <button
                  onClick={() =>
                    setOpenIndex(
                      isOpen
                        ? null
                        : index
                    )
                  }
                  className="
                    flex
                    w-full
                    items-center
                    justify-between
                    p-6
                    text-left
                  "
                >

                  <span className="text-lg font-semibold">
                    {faq.question}
                  </span>

                  <ChevronDown
                    size={22}
                    className={`transition-transform duration-300 ${
                      isOpen
                        ? "rotate-180"
                        : ""
                    }`}
                  />

                </button>

                <div
                  className={`
                    overflow-hidden
                    transition-all
                    duration-300
                    ${
                      isOpen
                        ? "max-h-40"
                        : "max-h-0"
                    }
                  `}
                >

                  <div className="px-6 pb-6 text-gray-600">
                    {faq.answer}
                  </div>

                </div>

              </div>
            );
          })}

        </div>

      </div>

    </section>
  );
}