import "./globals.css";

import { Inter } from "next/font/google";

import { AuthProvider } from "@/lib/auth/AuthProvider";
import { CartProvider } from "@/contexts/CartContext";

const inter = Inter({
    subsets: ["latin"],
});

export const metadata = {
    title: "Momentos em Flor",
    description:
        "Flores preparadas por floristas locais para todos os momentos especiais.",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="pt">
            <body className={inter.className}>
                <AuthProvider>
                    <CartProvider>
                        {children}
                    </CartProvider>
                </AuthProvider>
            </body>
        </html>
    );
}