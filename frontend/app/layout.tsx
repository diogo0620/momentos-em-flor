import "./globals.css";
import type { Metadata, Viewport } from "next";

import { AuthProvider } from "@/lib/auth/AuthProvider";
import { WishlistProvider } from "@/contexts/WishlistContext";

export const metadata: Metadata = {
    title: {
        default: "Momentos em Flor",
        template: "%s · Momentos em Flor",
    },
    description:
        "Flores preparadas com cuidado para todos os momentos especiais.",
    applicationName: "Momentos em Flor",
    openGraph: {
        title: "Momentos em Flor",
        description: "Flores preparadas com cuidado para todos os momentos especiais.",
        type: "website",
        locale: "pt_PT",
    },
};

export const viewport: Viewport = {
    themeColor: "#55624A",
    colorScheme: "light",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="pt">
            <body className="font-sans">
                <AuthProvider>
                    <WishlistProvider>
                        {children}
                    </WishlistProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
