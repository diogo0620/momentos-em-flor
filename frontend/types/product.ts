import { Price } from "./price";

export type Product = {
  id: string;

  name: string;

  description: string;

  category: string;

  image: string;

  price: Price;

  active: boolean;

  slug: string;

  featured: boolean;

  createdAt: string;

  updatedAt: string;
};