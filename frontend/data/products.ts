import { Product } from "@/types/product";

export const products: Product[] = [
  {
    id: "1",

    name: "Bouquet Primavera",

    description:
      "Bouquet composto por flores frescas da época.",

    category: "Bouquets",

    image:
      "https://homeflora.pt/wp-content/uploads/atado-gerberas-coloridas.jpg.webp",

    price: {
      selling: 45,

      florist: 28,
    },


    active: true,

    slug: "bouquet-primavera",

    featured: true,

    createdAt: "2026-01-10",

    updatedAt: "2026-06-20",
  },
];