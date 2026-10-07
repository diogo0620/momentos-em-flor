"use client";



import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";



import { useCart } from "@/contexts/CartContext";

import { useAuth } from "@/lib/auth/AuthProvider";



import { getStoreSettings } from "@/lib/api/store-settings";

import { ordersApi } from "@/lib/api/orders";


import type { CreateOrderData } from "@/types/order";

const PORTUGAL_DISTRICTS = [
    "Aveiro",
    "Beja",
    "Braga",
    "Bragança",
    "Castelo Branco",
    "Coimbra",
    "Évora",
    "Faro",
    "Guarda",
    "Leiria",
    "Lisboa",
    "Portalegre",
    "Porto",
    "Santarém",
    "Setúbal",
    "Viana do Castelo",
    "Vila Real",
    "Viseu",
];







export default function CheckoutPage() {

    const router = useRouter();



    const { items, clearCart } = useCart();



    const {

        user,

        isAuthenticated,

        isLoading: authLoading,

    } = useAuth();



    const [customerTaxNumber, setCustomerTaxNumber] =

        useState("");



    const [recipientFirstName, setRecipientFirstName] =

        useState("");



    const [recipientLastName, setRecipientLastName] =

        useState("");



    const [recipientPhone, setRecipientPhone] =

        useState("");



    const [occasion, setOccasion] =

        useState<CreateOrderData["occasion"]>();



    const [deliveryDate, setDeliveryDate] =

        useState("");



    const [deliveryTimeSlot, setDeliveryTimeSlot] =

        useState<CreateOrderData["deliveryTimeSlot"]>(

            "AFTERNOON",

        );



    const [deliveryInstructions, setDeliveryInstructions] =

        useState("");



    const [deliveryStreet, setDeliveryStreet] =

        useState("");



    const [deliveryStreetNumber, setDeliveryStreetNumber] =

        useState("");



    const [deliveryStreet2, setDeliveryStreet2] =

        useState("");



    const [deliveryPostalCode, setDeliveryPostalCode] =

        useState("");



    const [deliveryCity, setDeliveryCity] =

        useState("");



    const [deliveryDistrict, setDeliveryDistrict] =

        useState("");



    const deliveryCountryCode = "PT";



    const [cardMessage, setCardMessage] =

        useState("");



    const [deliveryFee, setDeliveryFee] =

        useState<number | null>(null);



    const [isLoadingDeliveryFee, setIsLoadingDeliveryFee] =

        useState(false);



    const [isSubmitting, setIsSubmitting] =

        useState(false);



    const [error, setError] =

        useState<string | null>(null);





    const total = items.reduce(

        (sum, item) =>

            sum +

            item.price * item.quantity,

        0,

    );



    const hasCompleteDeliveryAddress =

        deliveryStreet.trim() !== "" &&

        deliveryStreetNumber.trim() !== "" &&

        deliveryPostalCode.trim() !== "" &&

        deliveryCity.trim() !== "" &&

        deliveryDistrict.trim() !== "";



    useEffect(() => {

        if (!hasCompleteDeliveryAddress) {

            setDeliveryFee(null);

            return;

        }



        async function loadDeliveryFee() {

            try {

                setIsLoadingDeliveryFee(true);



                const response =

                    await getStoreSettings();



                setDeliveryFee(

                    response.data.deliveryFee,

                );

            } catch {

                setDeliveryFee(null);

            } finally {

                setIsLoadingDeliveryFee(false);

            }

        }



        loadDeliveryFee();

    }, [

        hasCompleteDeliveryAddress,

        deliveryStreet,

        deliveryPostalCode,

        deliveryCity,

        deliveryDistrict,

    ]);



    const grandTotal =

        deliveryFee !== null

            ? total + deliveryFee

            : null;



    async function handleSubmit(

        event: React.FormEvent<HTMLFormElement>,

    ) {

        event.preventDefault();



        if (!isAuthenticated || !user) {

            router.push("/login");

            return;

        }



        if (items.length === 0) {

            setError(

                "O carrinho está vazio.",

            );

            return;

        }

        if (!hasCompleteDeliveryAddress || !deliveryCountryCode) {
            setError(
                "Preencha a rua, número, código postal, cidade e distrito da morada de entrega.",
            );
            return;
        }

        if (
            customerTaxNumber.trim() !== "" &&
            !/^\d{9}$/.test(customerTaxNumber.trim())
        ) {
            setError(
                "O NIF deve ter 9 dígitos.",
            );
            return;
        }



        try {

            setIsSubmitting(true);

            setError(null);



            const data: CreateOrderData = {

                items: items.map(

                    (item) => ({

                        productId: Number(item.id),

                        quantity: item.quantity,



                        ...(item.variantId !== undefined

                            ? {

                                variantId: item.variantId,

                            }

                            : {}),



                        ...(item.components?.length

                            ? {

                                components: item.components.map(

                                    (component) => ({

                                        componentId:

                                            component.componentId,

                                        quantity:

                                            component.quantity,

                                    }),

                                ),

                            }

                            : {}),

                    }),

                ),



                // CUSTOMER



                customerFirstName:

                    user.firstName,



                customerLastName:

                    user.lastName ||

                    undefined,



                customerEmail:

                    user.email,



                customerPhone:

                    user.phone ||

                    undefined,



                // CUSTOMER TAX NUMBER

                ...(customerTaxNumber.trim()
                    ? {
                        customerTaxNumber:
                            customerTaxNumber.trim(),
                    }
                    : {}),



                // RECIPIENT



                recipientFirstName,



                recipientLastName:

                    recipientLastName ||

                    undefined,



                recipientPhone:

                    recipientPhone ||

                    undefined,



                occasion,



                // DELIVERY



                deliveryDate,



                deliveryTimeSlot,



                deliveryInstructions:

                    deliveryInstructions ||

                    undefined,



                deliveryStreet: deliveryStreet,

                deliveryStreetNumber: deliveryStreetNumber,



                deliveryStreet2:

                    deliveryStreet2 ||

                    undefined,



                deliveryPostalCode,



                deliveryCity,



                deliveryDistrict,



                deliveryCountryCode,



                // CARD



                cardMessage:

                    cardMessage ||

                    undefined,

            };



            const response =

                await ordersApi.create(data);



            clearCart();



            router.push(

                `/success?order=${encodeURIComponent(

                    response.id,

                )}`,

            );

        } catch (err) {

            console.error(

                "Erro ao criar encomenda:",

                err,

            );



            setError(

                err instanceof Error

                    ? err.message

                    : "Não foi possível criar a encomenda.",

            );

        } finally {

            setIsSubmitting(false);

        }

    }



    if (authLoading) {
        return (
            <div className="min-h-screen bg-[#F7F8F4] px-4 py-16">
                <div className="mx-auto flex max-w-7xl items-center justify-center">
                    <div className="rounded-3xl bg-white px-8 py-10 text-center shadow-sm">
                        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#D6DEC8] border-t-[#55624A]" />
                        <p className="mt-4 text-sm text-gray-500">A carregar...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return (
            <div className="min-h-screen bg-[#F7F8F4] px-4 py-20">
                <div className="mx-auto max-w-xl rounded-[2rem] bg-white p-10 text-center shadow-sm">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8EDDF] text-[#55624A]">
                        <span className="text-xl">→</span>
                    </div>
                    <h1 className="mt-6 text-3xl font-bold tracking-tight text-[#2F3B2A]">
                        Inicie sessão para continuar
                    </h1>
                    <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500">
                        Precisa de estar autenticado para finalizar a sua encomenda.
                    </p>
                    <button
                        type="button"
                        onClick={() => router.push("/login")}
                        className="mt-8 rounded-full bg-[#55624A] px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-[#46523D]"
                    >
                        Iniciar sessão
                    </button>
                </div>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-[#F7F8F4] px-4 py-20">
                <div className="mx-auto max-w-xl rounded-[2rem] bg-white p-10 text-center shadow-sm">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8EDDF] text-[#55624A]">
                        <span className="text-xl">🛒</span>
                    </div>
                    <h1 className="mt-6 text-3xl font-bold tracking-tight text-[#2F3B2A]">
                        O seu carrinho está vazio
                    </h1>
                    <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500">
                        Adicione pelo menos um produto antes de finalizar a encomenda.
                    </p>
                    <button
                        type="button"
                        onClick={() => router.push("/products")}
                        className="mt-8 rounded-full bg-[#55624A] px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-[#46523D]"
                    >
                        Ver catálogo
                    </button>
                </div>
            </div>
        );
    }

    const fieldClass = "w-full rounded-xl border border-[#E3E7DE] bg-white px-4 py-3 text-sm text-[#2F3B2A] outline-none transition placeholder:text-gray-400 focus:border-[#8C997E] focus:ring-4 focus:ring-[#D6DEC8]/50";
    const labelClass = "mb-2 block text-xs font-semibold uppercase tracking-wide text-[#596151]";
    const sectionClass = "rounded-[1.75rem] border border-[#E9ECE5] bg-white p-6 shadow-[0_8px_30px_rgba(47,59,42,0.04)] sm:p-7";

    return (
        <div className="min-h-screen bg-[#F7F8F4]">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">

                <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                    <div>
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#E8EDDF] px-3 py-1.5 text-xs font-semibold text-[#55624A]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#7D8D6D]" />
                            Checkout
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-[#2F3B2A] sm:text-4xl">
                            Finalizar encomenda
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
                            Preencha os dados abaixo. A morada será utilizada pelo nosso sistema para calcular a localização da entrega.
                        </p>
                    </div>

                    <div className="hidden rounded-2xl border border-[#E3E7DE] bg-white px-4 py-3 sm:block">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Total de produtos</p>
                        <p className="mt-1 text-lg font-bold text-[#2F3B2A]">{items.length} {items.length === 1 ? "item" : "itens"}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
                    <div className="space-y-6">

                        {/* COMPRADOR */}
                        <section className={sectionClass}>
                            <div className="flex items-start gap-4">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#E8EDDF] text-[#55624A]">
                                    <span className="text-lg">01</span>
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-[#2F3B2A]">Informação do comprador</h2>
                                    <p className="mt-1 text-sm text-gray-500">Dados associados à sua conta.</p>
                                </div>
                            </div>

                            <div className="mt-6 rounded-2xl border border-[#E7EBE2] bg-[#F8F9F6] p-5">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="font-semibold text-[#2F3B2A]">{user.firstName} {user.lastName}</p>
                                        <p className="mt-1 text-sm text-gray-500">{user.email}</p>
                                        {user.phone && <p className="mt-1 text-sm text-gray-500">{user.phone}</p>}
                                    </div>
                                    <span className="w-fit rounded-full bg-white px-3 py-1.5 text-xs font-medium text-[#66705F] shadow-sm">
                                        Conta autenticada
                                    </span>
                                </div>
                            </div>

                            <div className="mt-5">
                                <label className={labelClass}>NIF</label>
                                <div className="mt-2 max-w-md">
                                    <input
                                        value={customerTaxNumber}
                                        onChange={(e) =>
                                            setCustomerTaxNumber(
                                                e.target.value
                                                    .replace(/\D/g, "")
                                                    .slice(0, 9),
                                            )
                                        }
                                        placeholder="Ex.: 123456789"
                                        inputMode="numeric"
                                        maxLength={9}
                                        autoComplete="off"
                                        className={fieldClass}
                                    />
                                </div>
                                <p className="mt-2 text-xs leading-5 text-gray-400">
                                    Opcional. Introduza o NIF caso pretenda associá-lo à encomenda.
                                </p>
                            </div>
                        </section>

                        {/* DESTINATÁRIO */}
                        <section className={sectionClass}>
                            <div className="flex items-start gap-4">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#E8EDDF] text-[#55624A]">
                                    <span className="text-lg">02</span>
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-[#2F3B2A]">Informação do destinatário</h2>
                                    <p className="mt-1 text-sm text-gray-500">Quem irá receber as flores.</p>
                                </div>
                            </div>

                            <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className={labelClass}>Nome *</label>
                                    <input required value={recipientFirstName} onChange={(e) => setRecipientFirstName(e.target.value)} placeholder="Nome" className={fieldClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Apelido</label>
                                    <input value={recipientLastName} onChange={(e) => setRecipientLastName(e.target.value)} placeholder="Apelido" className={fieldClass} />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className={labelClass}>Telefone</label>
                                    <input type="tel" value={recipientPhone} onChange={(e) => setRecipientPhone(e.target.value)} placeholder="Telefone do destinatário" className={fieldClass} />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className={labelClass}>Ocasião</label>
                                    <select value={occasion ?? ""} onChange={(e) => setOccasion(e.target.value ? (e.target.value as CreateOrderData["occasion"]) : undefined)} className={fieldClass}>
                                        <option value="">Selecione uma ocasião</option>
                                        <option value="BIRTHDAY">Aniversário</option>
                                        <option value="ANNIVERSARY">Aniversário de namoro/casamento</option>
                                        <option value="LOVE">Amor</option>
                                        <option value="WEDDING">Casamento</option>
                                        <option value="FUNERAL">Condolências</option>
                                        <option value="NEW_BABY">Nascimento</option>
                                        <option value="MOTHERS_DAY">Dia da Mãe</option>
                                        <option value="FATHERS_DAY">Dia do Pai</option>
                                        <option value="CHRISTMAS">Natal</option>
                                        <option value="OTHER">Outra</option>
                                    </select>
                                </div>
                            </div>
                        </section>

                        {/* ENTREGA */}
                        <section className={sectionClass}>
                            <div className="flex items-start gap-4">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#E8EDDF] text-[#55624A]">
                                    <span className="text-lg">03</span>
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-[#2F3B2A]">Informação da entrega</h2>
                                    <p className="mt-1 text-sm text-gray-500">Escolha quando pretende receber a encomenda.</p>
                                </div>
                            </div>

                            <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className={labelClass}>Data de entrega *</label>
                                    <input required type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} className={fieldClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Período *</label>
                                    <select required value={deliveryTimeSlot} onChange={(e) => setDeliveryTimeSlot(e.target.value as CreateOrderData["deliveryTimeSlot"])} className={fieldClass}>
                                        <option value="MORNING">Manhã</option>
                                        <option value="AFTERNOON">Tarde</option>
                                        <option value="EVENING">Noite</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mt-6 rounded-2xl border border-[#DDE5D5] bg-[#F7F9F4] p-5">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#D6DEC8] text-[#55624A]">⌖</div>
                                    <div>
                                        <p className="text-sm font-bold text-[#2F3B2A]">Morada de entrega</p>
                                        <p className="mt-0.5 text-xs text-gray-500">Introduza a morada manualmente.</p>
                                    </div>
                                </div>

                                <div className="mt-5 grid gap-4">
                                    <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_130px]">
                                        <div>
                                            <label className={labelClass}>Rua *</label>
                                            <input required value={deliveryStreet} onChange={(e) => setDeliveryStreet(e.target.value)} placeholder="Ex.: Rua de Santa Catarina" autoComplete="street-address" className={fieldClass} />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Número *</label>
                                            <input required value={deliveryStreetNumber} onChange={(e) => setDeliveryStreetNumber(e.target.value)} placeholder="123" className={fieldClass} />
                                        </div>
                                    </div>

                                    <div>
                                        <label className={labelClass}>Complemento</label>
                                        <input value={deliveryStreet2} onChange={(e) => setDeliveryStreet2(e.target.value)} placeholder="Apartamento, andar, porta, etc." autoComplete="address-line2" className={fieldClass} />
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className={labelClass}>Código postal *</label>
                                            <input required value={deliveryPostalCode} onChange={(e) => setDeliveryPostalCode(e.target.value)} placeholder="4000-000" inputMode="numeric" autoComplete="postal-code" maxLength={8} pattern="[0-9]{4}-[0-9]{3}" title="Introduza um código postal no formato 0000-000" className={fieldClass} />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Cidade / localidade *</label>
                                            <input required value={deliveryCity} onChange={(e) => setDeliveryCity(e.target.value)} placeholder="Ex.: Porto" autoComplete="address-level2" className={fieldClass} />
                                        </div>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className={labelClass}>Distrito *</label>
                                            <select required value={deliveryDistrict} onChange={(e) => setDeliveryDistrict(e.target.value)} autoComplete="address-level1" className={fieldClass}>
                                                <option value="">Selecione o distrito</option>
                                                {PORTUGAL_DISTRICTS.map((district) => (
                                                    <option key={district} value={district}>{district}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className={labelClass}>País *</label>
                                            <div className="flex min-h-[48px] items-center gap-3 rounded-xl border border-[#E3E7DE] bg-[#F3F5EF] px-4 text-sm text-[#596151]">
                                                <span>🇵🇹</span>
                                                <span className="font-medium">Portugal</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-5">
                                <label className={labelClass}>Instruções para entrega</label>
                                <textarea value={deliveryInstructions} onChange={(e) => setDeliveryInstructions(e.target.value)} rows={4} placeholder="Ex.: tocar à campainha, deixar na receção..." className={`${fieldClass} resize-none`} />
                            </div>
                        </section>

                        {/* CARTÃO */}
                        <section className={sectionClass}>
                            <div className="flex items-start gap-4">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#E8EDDF] text-[#55624A]">
                                    <span className="text-lg">04</span>
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-[#2F3B2A]">Cartão</h2>
                                    <p className="mt-1 text-sm text-gray-500">Adicione uma mensagem para acompanhar as flores.</p>
                                </div>
                            </div>

                            <div className="mt-6 rounded-2xl bg-[#F8F5EF] p-5">
                                <div className="mb-4 flex items-center gap-3 text-[#756C5D]">
                                    <span className="text-xl">✉</span>
                                    <p className="text-sm font-medium">Uma mensagem torna a entrega ainda mais especial.</p>
                                </div>
                                <textarea value={cardMessage} onChange={(e) => setCardMessage(e.target.value)} rows={5} maxLength={500} placeholder="Escreva uma mensagem personalizada..." className="w-full resize-none rounded-xl border border-[#E8E0D3] bg-white px-4 py-3 text-sm text-[#2F3B2A] outline-none placeholder:text-gray-400 focus:border-[#A69B86] focus:ring-4 focus:ring-[#E9E2D7]" />
                                <p className="mt-2 text-right text-xs text-gray-400">Máximo 500 caracteres</p>
                            </div>
                        </section>

                        {error && (
                            <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
                                <p className="font-semibold">Não foi possível criar a encomenda</p>
                                <p className="mt-1">{error}</p>
                            </div>
                        )}
                    </div>

                    {/* RESUMO */}
                    <aside className="lg:sticky lg:top-24">
                        <div className="overflow-hidden rounded-[1.75rem] border border-[#E2E7DD] bg-white shadow-[0_12px_40px_rgba(47,59,42,0.07)]">
                            <div className="bg-[#2F3B2A] p-6 text-white">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#D6DEC8]">A sua encomenda</p>
                                <h2 className="mt-2 text-2xl font-bold">Resumo</h2>
                            </div>

                            <div className="p-6">
                                <div className="space-y-4">
                                    {items.map((item) => {
                                        const cartItem = item as typeof item & {
                                            image?: string;
                                            variantName?: string;
                                            components?: Array<{
                                                componentId: number;
                                                name?: string;
                                                quantity: number;
                                            }>;
                                        };

                                        const configuration =
                                            cartItem.variantName ||
                                            cartItem.components?.some(
                                                (component) => component.quantity > 0,
                                            );

                                        return (
                                            <div
                                                key={`${item.id}-${item.recipient}-${item.message}`}
                                                className="overflow-hidden rounded-2xl border border-[#E7EBE2] bg-[#FBFCFA]"
                                            >
                                                <div className="flex gap-4 p-4">
                                                    <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-[#F0F3EC]">
                                                        {cartItem.image ? (
                                                            <img
                                                                src={cartItem.image}
                                                                alt={item.name}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex h-full w-full items-center justify-center text-2xl text-[#A8B09F]">
                                                                ✿
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div className="min-w-0">
                                                                <p className="text-sm font-bold text-[#2F3B2A]">
                                                                    {item.name}
                                                                </p>
                                                                <p className="mt-1 text-xs text-gray-500">
                                                                    {item.quantity} {item.quantity === 1 ? "unidade" : "unidades"}
                                                                </p>
                                                            </div>

                                                            <p className="whitespace-nowrap text-sm font-bold text-[#2F3B2A]">
                                                                {(item.price * item.quantity).toFixed(2)} €
                                                            </p>
                                                        </div>

                                                        {configuration && (
                                                            <details className="mt-2.5 group">
                                                                <summary className="flex w-fit cursor-pointer list-none items-center gap-1.5 rounded-full border border-[#DCE3D6] bg-[#F4F6F1] px-2.5 py-1 text-[11px] font-medium text-[#66705F] transition hover:border-[#C8D1C0] hover:bg-[#EDF1E9] hover:text-[#2F3B2A] [&::-webkit-details-marker]:hidden">
                                                                    <span className="flex h-4 w-4 items-center justify-center rounded-full border border-current text-[9px] font-bold">
                                                                        i
                                                                    </span>
                                                                    <span>Configuração</span>
                                                                    <span className="ml-0.5 text-[10px] transition-transform duration-200 group-open:rotate-180">
                                                                        ↓
                                                                    </span>
                                                                </summary>

                                                                <div className="mt-2.5 w-full rounded-2xl border border-[#E1E6DE] bg-[#F8F9F6] px-3.5 py-3">
                                                                    <div className="flex items-center justify-between gap-3">
                                                                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#7A8373]">
                                                                            Configuração
                                                                        </p>
                                                    
                                                                    </div>

                                                                    <div className="mt-2.5 space-y-2">
                                                                        {cartItem.variantName && (
                                                                            <div className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2">
                                                                                <span className="text-xs text-gray-500">Variante</span>
                                                                                <span className="text-right text-xs font-semibold text-[#2F3B2A]">
                                                                                    {cartItem.variantName}
                                                                                </span>
                                                                            </div>
                                                                        )}

                                                                        {cartItem.components?.map((component) =>
                                                                            component.quantity > 0 ? (
                                                                                <div
                                                                                    key={component.componentId}
                                                                                    className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2"
                                                                                >
                                                                                    <span className="min-w-0 text-xs text-gray-500">
                                                                                        {component.name || `Componente #${component.componentId}`}
                                                                                    </span>
                                                                                    <span className="shrink-0 rounded-full bg-[#EDF1E9] px-2 py-0.5 text-[10px] font-bold text-[#55624A]">
                                                                                        {component.quantity}x
                                                                                    </span>
                                                                                </div>
                                                                            ) : null,
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </details>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="my-6 border-t border-dashed border-[#DDE2D8]" />

                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between text-gray-500">
                                        <span>Subtotal</span>
                                        <span>{total.toFixed(2)} €</span>
                                    </div>
                                    <div className="flex justify-between text-gray-500">
                                        <span>Entrega</span>
                                        <span>
                                            {!hasCompleteDeliveryAddress
                                                ? "A calcular..."
                                                : isLoadingDeliveryFee
                                                    ? "A calcular..."
                                                    : deliveryFee !== null
                                                        ? `${deliveryFee.toFixed(2)} €`
                                                        : "Indisponível"}
                                        </span>
                                    </div>
                                </div>

                                <div className="my-5 border-t border-[#E5E9E1]" />

                                <div className="flex items-end justify-between gap-4">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Total</p>
                                        <p className="mt-1 text-3xl font-bold tracking-tight text-[#2F3B2A]">
                                            {grandTotal !== null ? `${grandTotal.toFixed(2)} €` : `${total.toFixed(2)} €`}
                                        </p>
                                    </div>
                                    {grandTotal === null && <span className="text-right text-xs text-gray-400">+ entrega</span>}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="mt-7 w-full rounded-2xl bg-[#55624A] px-5 py-4 text-sm font-bold text-white shadow-sm transition hover:bg-[#46523D] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isSubmitting ? "A criar encomenda..." : "Confirmar encomenda"}
                                </button>

                                <p className="mt-4 text-center text-xs leading-5 text-gray-400">
                                    Ao confirmar, a sua encomenda será criada e ficará pronta para o processo de pagamento.
                                </p>
                            </div>
                        </div>
                    </aside>
                </form>
            </div>
        </div>
    );
}
