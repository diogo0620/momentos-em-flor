import {
    CalendarDays,
    ShieldCheck,
    Truck,
} from "lucide-react";

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
            <div className="border-b border-[#e7e3d8] bg-[#40513c] text-white">
                <div className="mx-auto flex min-h-8 max-w-[1440px] items-center justify-center gap-5 px-3 py-1.5 text-[9px] font-medium tracking-wide text-white/90 sm:gap-8 sm:px-6 sm:text-[10px]">
                    <span className="flex items-center gap-1.5">
                        <Truck size={13} strokeWidth={1.8} />
                        Entrega cuidada
                    </span>

                    <span className="hidden items-center gap-1.5 sm:flex">
                        <CalendarDays size={13} strokeWidth={1.8} />
                        Escolha a data de entrega
                    </span>

                    <span className="hidden items-center gap-1.5 md:flex">
                        <ShieldCheck size={13} strokeWidth={1.8} />
                        Pagamento seguro
                    </span>
                </div>
            </div>

            <Navbar />

            <main className="min-h-screen bg-[#f8f6f1]">
                {children}
            </main>

            <Footer />
        </CartProvider>
    );
}
