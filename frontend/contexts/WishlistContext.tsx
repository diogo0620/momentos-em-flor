"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";

import type { WishlistItem } from "@/types/wishlist";

type WishlistContextType = {
    items: WishlistItem;
    isInWishlist: (productId: number) => boolean;
    addToWishlist: (item: WishlistItem[number]) => void;
    removeFromWishlist: (productId: number) => void;
    toggleWishlist: (item: WishlistItem[number]) => void;
    clearWishlist: () => void;
};

const WishlistContext =
    createContext<WishlistContextType | null>(null);

export function WishlistProvider({
    children,
}: {
    children: ReactNode;
}) {
    const [items, setItems] = useState<WishlistItem>([]);
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem("wishlist");

        if (stored) {
            try {
                const parsed = JSON.parse(stored);

                if (
                    Array.isArray(parsed) &&
                    parsed.every(
                        (item) =>
                            typeof item?.id === "number" &&
                            typeof item?.name === "string" &&
                            typeof item?.image === "string",
                    )
                ) {
                    setItems(parsed);
                }
            } catch {
                localStorage.removeItem("wishlist");
            }
        }

        setHydrated(true);
    }, []);

    useEffect(() => {
        if (!hydrated) return;

        localStorage.setItem(
            "wishlist",
            JSON.stringify(items),
        );
    }, [items, hydrated]);

    function isInWishlist(productId: number) {
        return items.some((item) => item.id === productId);
    }

    function addToWishlist(item: WishlistItem[number]) {
        setItems((current) => {
            if (current.some((existing) => existing.id === item.id)) {
                return current;
            }

            return [...current, item];
        });
    }

    function removeFromWishlist(productId: number) {
        setItems((current) =>
            current.filter((item) => item.id !== productId),
        );
    }

    function toggleWishlist(item: WishlistItem[number]) {
        setItems((current) => {
            const exists = current.some(
                (existing) => existing.id === item.id,
            );

            if (exists) {
                return current.filter(
                    (existing) => existing.id !== item.id,
                );
            }

            return [...current, item];
        });
    }

    function clearWishlist() {
        setItems([]);
    }

    return (
        <WishlistContext.Provider
            value={{
                items,
                isInWishlist,
                addToWishlist,
                removeFromWishlist,
                toggleWishlist,
                clearWishlist,
            }}
        >
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const context = useContext(WishlistContext);

    if (!context) {
        throw new Error(
            "useWishlist must be used inside WishlistProvider",
        );
    }

    return context;
}