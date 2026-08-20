"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
    ArrowLeft,
    Plus,
    Trash2,
} from "lucide-react";

import { useRouter } from "next/navigation";

import {
    createOrder,
    type CreateOrderData,
} from "@/lib/api/orders";

import { getProducts } from "@/lib/api/products";

import type { Product } from "@/types/product";

/* -------------------------------------------------------------------------- */
/* TYPES                                                                      */
/* -------------------------------------------------------------------------- */

type OrderItemForm = {
    productId: number;
    quantity: number;
};

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                    */
/* -------------------------------------------------------------------------- */

function formatCurrency(value: number) {
    return new Intl.NumberFormat("pt-PT", {
        style: "currency",
        currency: "EUR",
    }).format(Number(value));
}

/* -------------------------------------------------------------------------- */
/* PAGE                                                                       */
/* -------------------------------------------------------------------------- */

export default function AdminCreateOrderPage() {
    const router = useRouter();

    /* ---------------------------------------------------------------------- */
    /* PRODUCTS                                                               */
    /* ---------------------------------------------------------------------- */

    const [products, setProducts] =
        useState<Product[]>([]);

    const [productsLoading, setProductsLoading] =
        useState(true);

    /* ---------------------------------------------------------------------- */
    /* CUSTOMER                                                               */
    /* ---------------------------------------------------------------------- */

    const [customerFirstName, setCustomerFirstName] =
        useState("");

    const [customerLastName, setCustomerLastName] =
        useState("");

    const [customerEmail, setCustomerEmail] =
        useState("");

    const [customerPhone, setCustomerPhone] =
        useState("");

    /* ---------------------------------------------------------------------- */
    /* RECIPIENT                                                              */
    /* ---------------------------------------------------------------------- */

    const [recipientFirstName, setRecipientFirstName] =
        useState("");

    const [recipientLastName, setRecipientLastName] =
        useState("");

    const [recipientPhone, setRecipientPhone] =
        useState("");

    const [occasion, setOccasion] =
        useState<CreateOrderData["occasion"]>();

    /* ---------------------------------------------------------------------- */
    /* DELIVERY                                                               */
    /* ---------------------------------------------------------------------- */

    const [deliveryDate, setDeliveryDate] =
        useState("");

    const [deliveryTimeSlot, setDeliveryTimeSlot] =
        useState<
            CreateOrderData["deliveryTimeSlot"] | ""
        >("");

    const [deliveryInstructions, setDeliveryInstructions] =
        useState("");

    /* ---------------------------------------------------------------------- */
    /* ADDRESS                                                                */
    /* ---------------------------------------------------------------------- */

    const [deliveryStreet, setDeliveryStreet] =
        useState("");

    const [deliveryStreet2, setDeliveryStreet2] =
        useState("");

    const [deliveryPostalCode, setDeliveryPostalCode] =
        useState("");

    const [deliveryCity, setDeliveryCity] =
        useState("");

    const [deliveryDistrict, setDeliveryDistrict] =
        useState("");

    const [deliveryCountryCode, setDeliveryCountryCode] =
        useState("PT");

    /* ---------------------------------------------------------------------- */
    /* CARD                                                                   */
    /* ---------------------------------------------------------------------- */

    const [cardMessage, setCardMessage] =
        useState("");

    /* ---------------------------------------------------------------------- */
    /* ITEMS                                                                  */
    /* ---------------------------------------------------------------------- */

    const [items, setItems] =
        useState<OrderItemForm[]>([
            {
                productId: 0,
                quantity: 1,
            },
        ]);

    /* ---------------------------------------------------------------------- */
    /* SUBMIT                                                                 */
    /* ---------------------------------------------------------------------- */

    const [submitting, setSubmitting] =
        useState(false);

    const [error, setError] =
        useState<string | null>(null);

    /* ---------------------------------------------------------------------- */
    /* LOAD PRODUCTS                                                          */
    /* ---------------------------------------------------------------------- */

    useEffect(() => {
        async function loadProducts() {
            try {
                setProductsLoading(true);

                const response =
                    await getProducts({
                        page: 1,
                        pageSize: 100,
                    });

                setProducts(
                    response.data.filter(
                        (product) =>
                            product.active,
                    ),
                );
            } catch (err) {
                console.error(
                    "ADMIN CREATE ORDER - PRODUCTS ERROR:",
                    err,
                );

                setError(
                    "Não foi possível carregar os produtos.",
                );
            } finally {
                setProductsLoading(false);
            }
        }

        loadProducts();
    }, []);

    /* ---------------------------------------------------------------------- */
    /* TOTAL                                                                   */
    /* ---------------------------------------------------------------------- */

    const subtotal = useMemo(() => {
        return items.reduce(
            (total, item) => {
                const product =
                    products.find(
                        (product) =>
                            product.id ===
                            item.productId,
                    );

                if (!product) {
                    return total;
                }

                return (
                    total +
                    Number(product.basePrice) *
                        item.quantity
                );
            },
            0,
        );
    }, [items, products]);

    /* ---------------------------------------------------------------------- */
    /* ITEMS                                                                   */
    /* ---------------------------------------------------------------------- */

    function addItem() {
        setItems((current) => [
            ...current,
            {
                productId: 0,
                quantity: 1,
            },
        ]);
    }

    function removeItem(index: number) {
        setItems((current) =>
            current.filter(
                (_, itemIndex) =>
                    itemIndex !== index,
            ),
        );
    }

    function updateItem(
        index: number,
        changes: Partial<OrderItemForm>,
    ) {
        setItems((current) =>
            current.map(
                (item, itemIndex) =>
                    itemIndex === index
                        ? {
                              ...item,
                              ...changes,
                          }
                        : item,
            ),
        );
    }

    /* ---------------------------------------------------------------------- */
    /* SUBMIT                                                                 */
    /* ---------------------------------------------------------------------- */

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        setError(null);

        if (items.length === 0) {
            setError(
                "Adiciona pelo menos um produto.",
            );

            return;
        }

        if (
            items.some(
                (item) =>
                    !item.productId ||
                    item.quantity <= 0,
            )
        ) {
            setError(
                "Verifica os produtos e respetivas quantidades.",
            );

            return;
        }

        if (!deliveryTimeSlot) {
            setError(
                "Seleciona o período de entrega.",
            );

            return;
        }

        try {
            setSubmitting(true);

            const data: CreateOrderData = {
                items: items.map((item) => ({
                    productId:
                        item.productId,
                    quantity:
                        item.quantity,
                })),

                customerFirstName:
                    customerFirstName ||
                    undefined,

                customerLastName:
                    customerLastName ||
                    undefined,

                customerEmail:
                    customerEmail ||
                    undefined,

                customerPhone:
                    customerPhone ||
                    undefined,

                recipientFirstName,

                recipientLastName:
                    recipientLastName ||
                    undefined,

                recipientPhone:
                    recipientPhone ||
                    undefined,

                occasion,

                deliveryDate,

                deliveryTimeSlot,

                deliveryInstructions:
                    deliveryInstructions ||
                    undefined,

                deliveryStreet,

                deliveryStreet2:
                    deliveryStreet2 ||
                    undefined,

                deliveryPostalCode,

                deliveryCity,

                deliveryDistrict,

                deliveryCountryCode,

                cardMessage:
                    cardMessage ||
                    undefined,
            };

            const response =
                await createOrder(data);

            router.push(
                `/admin/orders/${response.data.id}`,
            );
        } catch (err) {
            console.error(
                "ADMIN CREATE ORDER ERROR:",
                err,
            );

            setError(
                err instanceof Error
                    ? err.message
                    : "Não foi possível criar a encomenda.",
            );
        } finally {
            setSubmitting(false);
        }
    }

    /* ---------------------------------------------------------------------- */
    /* RENDER                                                                 */
    /* ---------------------------------------------------------------------- */

    return (
        <div className="pb-12">

            {/* HEADER */}

            <div>
                <Link
                    href="/admin/orders"
                    className="
                        inline-flex
                        items-center
                        gap-2
                        text-sm
                        text-gray-500
                        transition
                        hover:text-[#55624A]
                    "
                >
                    <ArrowLeft size={16} />
                    Voltar às encomendas
                </Link>

                <div className="mt-5">
                    <h1 className="text-3xl font-bold text-[#2F3B2A]">
                        Nova encomenda
                    </h1>

                    <p className="mt-2 text-sm text-gray-500">
                        Cria uma encomenda manualmente.
                    </p>
                </div>
            </div>

            <form
                onSubmit={handleSubmit}
                className="mt-8"
            >

                {/* ERROR */}

                {error && (
                    <div className="mb-6 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <div className="grid gap-6 lg:grid-cols-[1fr_360px]">

                    {/* MAIN */}

                    <div className="space-y-6">

                        {/* CLIENTE */}

                        <section className="rounded-3xl bg-white p-6 shadow-sm">

                            <h2 className="text-lg font-bold text-[#2F3B2A]">
                                Cliente
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Dados da pessoa que está a efetuar a encomenda.
                            </p>

                            <div className="mt-6 grid gap-4 md:grid-cols-2">

                                <Field
                                    label="Nome"
                                    value={
                                        customerFirstName
                                    }
                                    onChange={
                                        setCustomerFirstName
                                    }
                                    required
                                />

                                <Field
                                    label="Apelido"
                                    value={
                                        customerLastName
                                    }
                                    onChange={
                                        setCustomerLastName
                                    }
                                />

                                <Field
                                    label="Email"
                                    type="email"
                                    value={
                                        customerEmail
                                    }
                                    onChange={
                                        setCustomerEmail
                                    }
                                />

                                <Field
                                    label="Telefone"
                                    value={
                                        customerPhone
                                    }
                                    onChange={
                                        setCustomerPhone
                                    }
                                />

                            </div>

                        </section>

                        {/* PRODUTOS */}

                        <section className="rounded-3xl bg-white p-6 shadow-sm">

                            <div className="flex items-center justify-between">

                                <div>
                                    <h2 className="text-lg font-bold text-[#2F3B2A]">
                                        Produtos
                                    </h2>

                                    <p className="mt-1 text-sm text-gray-500">
                                        Escolhe os produtos e quantidades.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={
                                        addItem
                                    }
                                    className="
                                        inline-flex
                                        items-center
                                        gap-2
                                        rounded-full
                                        bg-[#55624A]
                                        px-4
                                        py-2.5
                                        text-sm
                                        font-medium
                                        text-white
                                        transition
                                        hover:opacity-90
                                    "
                                >
                                    <Plus
                                        size={16}
                                    />
                                    Produto
                                </button>

                            </div>

                            <div className="mt-6 space-y-3">

                                {items.map(
                                    (
                                        item,
                                        index,
                                    ) => (
                                        <div
                                            key={
                                                index
                                            }
                                            className="
                                                flex
                                                flex-col
                                                gap-3
                                                rounded-2xl
                                                bg-[#F8F9F5]
                                                p-4
                                                sm:flex-row
                                                sm:items-end
                                            "
                                        >

                                            <div className="flex-1">

                                                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-400">
                                                    Produto
                                                </label>

                                                <select
                                                    value={
                                                        item.productId ||
                                                        ""
                                                    }
                                                    onChange={(
                                                        event,
                                                    ) =>
                                                        updateItem(
                                                            index,
                                                            {
                                                                productId:
                                                                    Number(
                                                                        event
                                                                            .target
                                                                            .value,
                                                                    ),
                                                            },
                                                        )
                                                    }
                                                    disabled={
                                                        productsLoading
                                                    }
                                                    className="
                                                        w-full
                                                        rounded-xl
                                                        border
                                                        border-gray-200
                                                        bg-white
                                                        p-3
                                                        text-sm
                                                        outline-none
                                                        focus:border-[#55624A]
                                                    "
                                                    required
                                                >
                                                    <option value="">
                                                        {productsLoading
                                                            ? "A carregar..."
                                                            : "Selecionar produto"}
                                                    </option>

                                                    {products.map(
                                                        (
                                                            product,
                                                        ) => (
                                                            <option
                                                                key={
                                                                    product.id
                                                                }
                                                                value={
                                                                    product.id
                                                                }
                                                            >
                                                                {
                                                                    product.name
                                                                }{" "}
                                                                —{" "}
                                                                {formatCurrency(
                                                                    Number(
                                                                        product.basePrice,
                                                                    ),
                                                                )}
                                                            </option>
                                                        ),
                                                    )}

                                                </select>

                                            </div>

                                            <div className="w-full sm:w-28">

                                                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-400">
                                                    Quantidade
                                                </label>

                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={
                                                        item.quantity
                                                    }
                                                    onChange={(
                                                        event,
                                                    ) =>
                                                        updateItem(
                                                            index,
                                                            {
                                                                quantity:
                                                                    Math.max(
                                                                        1,
                                                                        Number(
                                                                            event
                                                                                .target
                                                                                .value,
                                                                        ),
                                                                    ),
                                                            },
                                                        )
                                                    }
                                                    className="
                                                        w-full
                                                        rounded-xl
                                                        border
                                                        border-gray-200
                                                        bg-white
                                                        p-3
                                                        text-sm
                                                        outline-none
                                                        focus:border-[#55624A]
                                                    "
                                                />

                                            </div>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeItem(
                                                        index,
                                                    )
                                                }
                                                disabled={
                                                    items.length ===
                                                    1
                                                }
                                                className="
                                                    flex
                                                    h-11
                                                    w-11
                                                    shrink-0
                                                    items-center
                                                    justify-center
                                                    rounded-full
                                                    border
                                                    border-gray-200
                                                    text-gray-400
                                                    transition
                                                    hover:bg-red-50
                                                    hover:text-red-500
                                                    disabled:cursor-not-allowed
                                                    disabled:opacity-30
                                                "
                                            >
                                                <Trash2
                                                    size={
                                                        17
                                                    }
                                                />
                                            </button>

                                        </div>
                                    ),
                                )}

                            </div>

                        </section>

                        {/* DESTINATÁRIO */}

                        <section className="rounded-3xl bg-white p-6 shadow-sm">

                            <h2 className="text-lg font-bold text-[#2F3B2A]">
                                Destinatário
                            </h2>

                            <div className="mt-6 grid gap-4 md:grid-cols-2">

                                <Field
                                    label="Nome"
                                    value={
                                        recipientFirstName
                                    }
                                    onChange={
                                        setRecipientFirstName
                                    }
                                    required
                                />

                                <Field
                                    label="Apelido"
                                    value={
                                        recipientLastName
                                    }
                                    onChange={
                                        setRecipientLastName
                                    }
                                />

                                <Field
                                    label="Telefone"
                                    value={
                                        recipientPhone
                                    }
                                    onChange={
                                        setRecipientPhone
                                    }
                                />

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-[#2F3B2A]">
                                        Ocasião
                                    </label>

                                    <select
                                        value={
                                            occasion ??
                                            ""
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            setOccasion(
                                                event
                                                    .target
                                                    .value
                                                    ? (event
                                                          .target
                                                          .value as CreateOrderData["occasion"])
                                                    : undefined,
                                            )
                                        }
                                        className="
                                            w-full
                                            rounded-xl
                                            border
                                            border-gray-200
                                            p-3
                                            text-sm
                                            outline-none
                                            focus:border-[#55624A]
                                        "
                                    >
                                        <option value="">
                                            Selecionar ocasião
                                        </option>

                                        <option value="BIRTHDAY">
                                            Aniversário
                                        </option>

                                        <option value="ANNIVERSARY">
                                            Aniversário de namoro/casamento
                                        </option>

                                        <option value="LOVE">
                                            Amor
                                        </option>

                                        <option value="WEDDING">
                                            Casamento
                                        </option>

                                        <option value="FUNERAL">
                                            Funeral
                                        </option>

                                        <option value="NEW_BABY">
                                            Nascimento de bebé
                                        </option>

                                        <option value="MOTHERS_DAY">
                                            Dia da Mãe
                                        </option>

                                        <option value="FATHERS_DAY">
                                            Dia do Pai
                                        </option>

                                        <option value="CHRISTMAS">
                                            Natal
                                        </option>

                                        <option value="OTHER">
                                            Outra ocasião
                                        </option>

                                    </select>

                                </div>

                            </div>

                        </section>

                        {/* ENTREGA */}

                        <section className="rounded-3xl bg-white p-6 shadow-sm">

                            <h2 className="text-lg font-bold text-[#2F3B2A]">
                                Entrega
                            </h2>

                            <div className="mt-6 grid gap-4 md:grid-cols-2">

                                <Field
                                    label="Data de entrega"
                                    type="date"
                                    value={
                                        deliveryDate
                                    }
                                    onChange={
                                        setDeliveryDate
                                    }
                                    required
                                />

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-[#2F3B2A]">
                                        Período de entrega
                                    </label>

                                    <select
                                        value={
                                            deliveryTimeSlot
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            setDeliveryTimeSlot(
                                                event
                                                    .target
                                                    .value as CreateOrderData["deliveryTimeSlot"],
                                            )
                                        }
                                        className="
                                            w-full
                                            rounded-xl
                                            border
                                            border-gray-200
                                            p-3
                                            text-sm
                                            outline-none
                                            focus:border-[#55624A]
                                        "
                                        required
                                    >
                                        <option value="">
                                            Selecionar período
                                        </option>

                                        <option value="MORNING">
                                            Manhã
                                        </option>

                                        <option value="AFTERNOON">
                                            Tarde
                                        </option>

                                        <option value="EVENING">
                                            Noite
                                        </option>

                                    </select>

                                </div>

                            </div>

                            <div className="mt-4">

                                <Field
                                    label="Morada"
                                    value={
                                        deliveryStreet
                                    }
                                    onChange={
                                        setDeliveryStreet
                                    }
                                    required
                                />

                            </div>

                            <div className="mt-4">

                                <Field
                                    label="Complemento da morada"
                                    value={
                                        deliveryStreet2
                                    }
                                    onChange={
                                        setDeliveryStreet2
                                    }
                                />

                            </div>

                            <div className="mt-4 grid gap-4 md:grid-cols-3">

                                <Field
                                    label="Código postal"
                                    value={
                                        deliveryPostalCode
                                    }
                                    onChange={
                                        setDeliveryPostalCode
                                    }
                                    required
                                />

                                <Field
                                    label="Cidade"
                                    value={
                                        deliveryCity
                                    }
                                    onChange={
                                        setDeliveryCity
                                    }
                                    required
                                />

                                <Field
                                    label="Distrito"
                                    value={
                                        deliveryDistrict
                                    }
                                    onChange={
                                        setDeliveryDistrict
                                    }
                                    required
                                />

                            </div>

                            <div className="mt-4">

                                <Field
                                    label="País"
                                    value={
                                        deliveryCountryCode
                                    }
                                    onChange={
                                        setDeliveryCountryCode
                                    }
                                    required
                                />

                            </div>

                            <div className="mt-4">

                                <label className="mb-2 block text-sm font-medium text-[#2F3B2A]">
                                    Instruções de entrega
                                </label>

                                <textarea
                                    value={
                                        deliveryInstructions
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        setDeliveryInstructions(
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                    rows={4}
                                    className="
                                        w-full
                                        rounded-xl
                                        border
                                        border-gray-200
                                        p-3
                                        text-sm
                                        outline-none
                                        focus:border-[#55624A]
                                    "
                                    placeholder="Ex.: Tocar à campainha e ligar antes de entregar."
                                />

                            </div>

                        </section>

                        {/* CARTÃO */}

                        <section className="rounded-3xl bg-white p-6 shadow-sm">

                            <h2 className="text-lg font-bold text-[#2F3B2A]">
                                Mensagem do cartão
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Mensagem que acompanhará as flores.
                            </p>

                            <textarea
                                value={
                                    cardMessage
                                }
                                onChange={(
                                    event,
                                ) =>
                                    setCardMessage(
                                        event
                                            .target
                                            .value,
                                    )
                                }
                                rows={5}
                                className="
                                    mt-6
                                    w-full
                                    rounded-xl
                                    border
                                    border-gray-200
                                    p-3
                                    text-sm
                                    outline-none
                                    focus:border-[#55624A]
                                "
                                placeholder="Escreve a mensagem..."
                            />

                        </section>

                    </div>

                    {/* SUMMARY */}

                    <aside className="lg:sticky lg:top-6 lg:self-start">

                        <div className="rounded-3xl bg-white p-6 shadow-sm">

                            <h2 className="text-lg font-bold text-[#2F3B2A]">
                                Resumo
                            </h2>

                            <div className="mt-6 space-y-3">

                                <div className="flex justify-between text-sm">

                                    <span className="text-gray-500">
                                        Produtos
                                    </span>

                                    <span className="font-medium text-gray-700">
                                        {items.reduce(
                                            (
                                                total,
                                                item,
                                            ) =>
                                                total +
                                                item.quantity,
                                            0,
                                        )}
                                    </span>

                                </div>

                                <div className="flex justify-between text-sm">

                                    <span className="text-gray-500">
                                        Subtotal
                                    </span>

                                    <span className="font-medium text-gray-700">
                                        {formatCurrency(
                                            subtotal,
                                        )}
                                    </span>

                                </div>

                                <div className="flex justify-between text-sm">

                                    <span className="text-gray-500">
                                        Taxa de entrega
                                    </span>

                                    <span className="font-medium text-gray-700">
                                        —
                                    </span>

                                </div>

                                <div className="border-t border-gray-200 pt-4">

                                    <div className="flex items-center justify-between">

                                        <span className="font-semibold text-[#2F3B2A]">
                                            Total
                                        </span>

                                        <span className="text-2xl font-bold text-[#55624A]">
                                            {formatCurrency(
                                                subtotal,
                                            )}
                                        </span>

                                    </div>

                                </div>

                            </div>

                            <button
                                type="submit"
                                disabled={
                                    submitting ||
                                    productsLoading
                                }
                                className="
                                    mt-6
                                    w-full
                                    rounded-full
                                    bg-[#55624A]
                                    px-5
                                    py-3.5
                                    text-sm
                                    font-semibold
                                    text-white
                                    transition
                                    hover:opacity-90
                                    disabled:cursor-not-allowed
                                    disabled:opacity-50
                                "
                            >
                                {submitting
                                    ? "A criar encomenda..."
                                    : "Criar encomenda"}
                            </button>

                            <Link
                                href="/admin/orders"
                                className="
                                    mt-3
                                    block
                                    text-center
                                    text-sm
                                    text-gray-500
                                    transition
                                    hover:text-[#55624A]
                                "
                            >
                                Cancelar
                            </Link>

                        </div>

                    </aside>

                </div>

            </form>

        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* FIELD                                                                      */
/* -------------------------------------------------------------------------- */

function Field({
    label,
    value,
    onChange,
    type = "text",
    required = false,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    type?: string;
    required?: boolean;
}) {
    return (
        <div>
            <label className="mb-2 block text-sm font-medium text-[#2F3B2A]">
                {label}
            </label>

            <input
                type={type}
                value={value}
                onChange={(event) =>
                    onChange(
                        event.target.value,
                    )
                }
                required={required}
                className="
                    w-full
                    rounded-xl
                    border
                    border-gray-200
                    p-3
                    text-sm
                    outline-none
                    transition
                    focus:border-[#55624A]
                    focus:ring-4
                    focus:ring-[#55624A]/10
                "
            />
        </div>
    );
}