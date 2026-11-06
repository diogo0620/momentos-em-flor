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
        item: CartItem,
    ) => void;

    updateQuantity: (
        cartItemId: string,
        quantity: number,
    ) => void;

    removeItem: (
        cartItemId: string,
    ) => void;

    clearCart: () => void;
};

const CartContext =
    createContext<CartContextType | null>(
        null,
    );

export function CartProvider({
    children,
}: {
    children: ReactNode;
}) {
    const [items, setItems] =
        useState<CartItem[]>([]);

    // Restaurar carrinho do localStorage
    useEffect(() => {
        const stored =
            localStorage.getItem("cart");

        if (!stored) {
            return;
        }

        try {
            const parsed =
                JSON.parse(stored);

            if (Array.isArray(parsed)) {
                setItems(parsed);
            }
        } catch {
            localStorage.removeItem("cart");
        }
    }, []);

    // Guardar carrinho no localStorage
    useEffect(() => {
        localStorage.setItem(
            "cart",
            JSON.stringify(items),
        );
    }, [items]);

    function addItem(
        item: CartItem,
    ) {
        setItems((current) => {
            const existing =
                current.find(
                    (product) =>
                        product.id ===
                            item.id &&
                        product.variantId ===
                            item.variantId &&
                        areComponentsEqual(
                            product.components,
                            item.components,
                        ),
                );

            if (existing) {
                return current.map(
                    (product) =>
                        product.cartItemId ===
                        existing.cartItemId
                            ? {
                                  ...product,
                                  quantity:
                                      product.quantity +
                                      item.quantity,
                              }
                            : product,
                );
            }

            return [
                ...current,
                item,
            ];
        });
    }

    function updateQuantity(
        cartItemId: string,
        quantity: number,
    ) {
        if (quantity <= 0) {
            setItems((current) =>
                current.filter(
                    (item) =>
                        item.cartItemId !==
                        cartItemId,
                ),
            );

            return;
        }

        setItems((current) =>
            current.map((item) =>
                item.cartItemId ===
                cartItemId
                    ? {
                          ...item,
                          quantity,
                      }
                    : item,
            ),
        );
    }

    function removeItem(
        cartItemId: string,
    ) {
        setItems((current) =>
            current.filter(
                (item) =>
                    item.cartItemId !==
                    cartItemId,
            ),
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
                updateQuantity,
                removeItem,
                clearCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

function areComponentsEqual(
    first?: CartItem["components"],
    second?: CartItem["components"],
) {
    const firstComponents =
        first ?? [];

    const secondComponents =
        second ?? [];

    if (
        firstComponents.length !==
        secondComponents.length
    ) {
        return false;
    }

    return firstComponents.every(
        (firstComponent) => {
            const secondComponent =
                secondComponents.find(
                    (component) =>
                        component.componentId ===
                        firstComponent.componentId,
                );

            return (
                secondComponent !==
                    undefined &&
                secondComponent.quantity ===
                    firstComponent.quantity
            );
        },
    );
}

export function useCart() {
    const context =
        useContext(CartContext);

    if (!context) {
        throw new Error(
            "useCart must be used inside CartProvider",
        );
    }

    return context;
}