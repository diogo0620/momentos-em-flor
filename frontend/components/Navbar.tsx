"use client";

import Link from "next/link";
import Image from "next/image";

import {
  Heart,
  ShoppingBag,
  Search,
} from "lucide-react";

import { useCart } from "@/contexts/CartContext";

export default function Navbar() {
  const { items } = useCart();

  return (
    <nav
      className="
        sticky
        top-0
        z-[9999]
        border-b
        border-gray-100
        bg-white/90
        backdrop-blur-md
        shadow-[0_4px_20px_rgba(0,0,0,0.04)]
      "
    >
      <div className="mx-auto max-w-7xl px-6">

        <div className="grid h-24 grid-cols-3 items-center">

          {/* LOGO */}

          <div className="flex justify-start">

            <Link
              href="/"
              className="shrink-0"
            >
              <Image
                src="/logo.svg"
                alt="Momentos em Flor"
                width={220}
                height={80}
                className="h-16 w-auto object-contain"
                priority
              />
            </Link>

          </div>

          {/* MENU */}

          <div className="hidden lg:flex items-center justify-center gap-8">

            {[
              "Bouquets",
              "Rosas",
              "Romântico",
              "Casamentos",
              "Condolências",
            ].map((item) => (
              <Link
                key={item}
                href="/products"
                className="
                  group
                  relative
                  text-lg
                  font-semibold
                  text-gray-700
                  transition-colors
                  duration-300
                  hover:text-[#55624A]
                "
              >
                {item}

                <span
                  className="
                    absolute
                    left-0
                    -bottom-2
                    h-[2px]
                    w-0
                    bg-[#55624A]
                    transition-all
                    duration-300
                    group-hover:w-full
                  "
                />
              </Link>
            ))}

          </div>

          {/* ICONS */}

          <div className="flex items-center justify-end gap-2">

            <button
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-full
                transition-all
                duration-300
                hover:bg-[#F3F5EE]
                hover:scale-110
              "
            >
              <Search
                size={22}
                strokeWidth={1.8}
              />
            </button>

            <button
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-full
                transition-all
                duration-300
                hover:bg-[#F3F5EE]
                hover:scale-110
              "
            >
              <Heart
                size={22}
                strokeWidth={1.8}
              />
            </button>

            <Link
              href="/cart"
              className="
                relative
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-full
                transition-all
                duration-300
                hover:bg-[#F3F5EE]
                hover:scale-110
              "
            >
              <ShoppingBag
                size={22}
                strokeWidth={1.8}
              />

              {items.length > 0 && (
                <span
                  className="
                    absolute
                    -right-1
                    -top-1
                    flex
                    h-5
                    w-5
                    items-center
                    justify-center
                    rounded-full
                    bg-[#55624A]
                    text-xs
                    font-medium
                    text-white
                  "
                >
                  {items.length}
                </span>
              )}
            </Link>

          </div>

        </div>

      </div>
    </nav>
  );
}