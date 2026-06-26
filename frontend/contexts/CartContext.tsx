"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";

import type { CartItem } from "@/types/cart";

type CartContextType = {
    items: CartItem[];

    addItem: (
        item: CartItem
    ) => void;

    removeItem: (
        id: string
    ) => void;

    clearCart: () => void;
};

const CartContext =
    createContext<CartContextType | null>(
        null
    );

export function CartProvider({
    children,
}: {
    children: ReactNode;
}) {

    const [items, setItems] =
        useState<CartItem[]>([]);

    useEffect(() => {

        const stored =
            localStorage.getItem(
                "cart"
            );

        if (stored) {

            setItems(
                JSON.parse(stored)
            );

        }

    }, []);

    useEffect(() => {

        localStorage.setItem(
            "cart",
            JSON.stringify(items)
        );

    }, [items]);

    function addItem(
        item: CartItem
    ) {

        setItems((current) => {

            const existing =
                current.find(
                    (p) =>
                        p.id === item.id &&
                        p.recipient ===
                            item.recipient &&
                        p.message ===
                            item.message
                );

            if (existing) {

                return current.map(
                    (p) =>
                        p === existing
                            ? {
                                  ...p,
                                  quantity:
                                      p.quantity +
                                      item.quantity,
                              }
                            : p
                );

            }

            return [
                ...current,
                item,
            ];

        });

    }

    function removeItem(
        id: string
    ) {

        setItems((current) =>
            current.filter(
                (item) =>
                    item.id !== id
            )
        );

    }

    function clearCart() {

        setItems([]);

    }

    return (

        <CartContext.Provider
            value={{
                items,
                addItem,
                removeItem,
                clearCart,
            }}
        >

            {children}

        </CartContext.Provider>

    );

}

export function useCart() {

    const context =
        useContext(CartContext);

    if (!context) {

        throw new Error(
            "useCart must be used inside CartProvider"
        );

    }

    return context;

}