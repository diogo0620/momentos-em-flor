import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import { CartProvider } from "@/contexts/CartContext";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>

      <div className="bg-[#55624A] px-4 py-2 text-center text-sm text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-6">

          <span>
            🚚 Entrega rápida
          </span>

          <span className="hidden md:inline">
            🌿 Flores frescas todos os dias
          </span>

          <span className="hidden lg:inline">
            ❤️ Preparadas por floristas locais
          </span>

        </div>
      </div>

      <Navbar />

      <main className="min-h-screen">
        {children}
      </main>

      <Footer />

    </CartProvider>
  );
}