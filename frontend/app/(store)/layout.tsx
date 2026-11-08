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
            <div className="border-b border-white/10 bg-[#26392f] text-white">
                <div className="mx-auto flex h-8 max-w-7xl items-center justify-center gap-7 px-4 text-[10px] font-semibold tracking-wide text-white/85 sm:text-[11px]">
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

            <main className="min-h-screen bg-[#f7f7f3]">
                {children}
            </main>

            <Footer />
        </CartProvider>
    );
}
