"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { useRouter } from "next/navigation";

import { useCart } from "@/contexts/CartContext";

import { useAuth } from "@/lib/auth/AuthProvider";
import { CustomerCreateOrder } from "@/types/orders/customer/customer-create-order";
import { customerOrdersApi } from "@/lib/api/orders/customer-orders";
import { storeSettingsApi } from "@/lib/api/store-settings/store-settings";
import PhoneInput from "@/components/forms/PhoneInput";
import { isValidPhone } from "@/lib/validation/auth";
import { customerCouponsApi } from "@/lib/api/coupons/customer-coupons";
import { customerUsersApi } from "@/lib/api/users/customer-users";


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

const formatPrice = (value: number) =>
    new Intl.NumberFormat("pt-PT", {
        style: "currency",
        currency: "EUR",
    }).format(value);

const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

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
        useState<CustomerCreateOrder["occasion"]>();

    const [deliveryDate, setDeliveryDate] =
        useState("");

    const [deliveryTimeSlot, setDeliveryTimeSlot] =
        useState<CustomerCreateOrder["deliveryTimeSlot"]>(
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

    const [billingSameAsDelivery, setBillingSameAsDelivery] = useState(true);
    const [billingStreet, setBillingStreet] = useState("");
    const [billingStreetNumber, setBillingStreetNumber] = useState("");
    const [billingStreet2, setBillingStreet2] = useState("");
    const [billingPostalCode, setBillingPostalCode] = useState("");
    const [billingCity, setBillingCity] = useState("");
    const [billingDistrict, setBillingDistrict] = useState("");

    const deliveryCountryCode = "PT";

    const [cardMessage, setCardMessage] =
        useState("");

    const [deliveryFee, setDeliveryFee] =
        useState<number | null>(null);

    const [isLoadingDeliveryFee, setIsLoadingDeliveryFee] =
        useState(true);

    const [deliveryAreaName, setDeliveryAreaName] =
        useState("Santa Maria da Feira e arredores");

    const [deliveryAvailable, setDeliveryAvailable] =
        useState<boolean | null>(null);

    const [isCheckingDeliveryArea, setIsCheckingDeliveryArea] =
        useState(false);

    const [isSubmitting, setIsSubmitting] =
        useState(false);

    const [acceptedTerms, setAcceptedTerms] =
        useState(false);

    const [isRedirectingToPayment, setIsRedirectingToPayment] =
        useState(false);

    const [error, setError] =
        useState<string | null>(null);

    const [couponInput, setCouponInput] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
    const [couponError, setCouponError] = useState<string | null>(null);
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

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
        async function loadDeliveryFee() {

            try {

                setIsLoadingDeliveryFee(true);

                const response = await storeSettingsApi.getPublic();

                setDeliveryFee(
                    response.deliveryFee,
                );
                setDeliveryAreaName(response.deliveryAreaName);

            } catch {

                setDeliveryFee(null);

            } finally {

                setIsLoadingDeliveryFee(false);

            }

        }

        loadDeliveryFee();

    }, []);

    useEffect(() => {
        if (!isAuthenticated || !user) return;
        let cancelled = false;
        void customerUsersApi.getMe().then((profile) => {
            if (cancelled) return;
            setCustomerTaxNumber(profile.taxNumber ?? "");
            const hasBillingAddress = Boolean(
                profile.billingStreet &&
                profile.billingStreetNumber &&
                profile.billingPostalCode &&
                profile.billingCity &&
                profile.billingDistrict,
            );
            if (hasBillingAddress) {
                setBillingSameAsDelivery(false);
                setBillingStreet(profile.billingStreet ?? "");
                setBillingStreetNumber(profile.billingStreetNumber ?? "");
                setBillingStreet2(profile.billingStreet2 ?? "");
                setBillingPostalCode(profile.billingPostalCode ?? "");
                setBillingCity(profile.billingCity ?? "");
                setBillingDistrict(profile.billingDistrict ?? "");
            }
        }).catch(() => undefined);
        return () => { cancelled = true; };
    }, [isAuthenticated, user]);

    useEffect(() => {
        if (!hasCompleteDeliveryAddress) {
            setDeliveryAvailable(null);
            setIsCheckingDeliveryArea(false);
            return;
        }

        let cancelled = false;
        const timeout = window.setTimeout(async () => {
            try {
                setIsCheckingDeliveryArea(true);
                const result = await storeSettingsApi.checkDeliveryAvailability({
                    street: deliveryStreet.trim(),
                    streetNumber: deliveryStreetNumber.trim(),
                    street2: deliveryStreet2.trim() || undefined,
                    postalCode: deliveryPostalCode.trim(),
                    city: deliveryCity.trim(),
                    district: deliveryDistrict,
                    countryCode: deliveryCountryCode,
                });
                if (!cancelled) {
                    setDeliveryAvailable(result.available);
                    setDeliveryAreaName(result.areaName);
                }
            } catch {
                if (!cancelled) setDeliveryAvailable(null);
            } finally {
                if (!cancelled) setIsCheckingDeliveryArea(false);
            }
        }, 650);

        return () => {
            cancelled = true;
            window.clearTimeout(timeout);
        };
    }, [
        hasCompleteDeliveryAddress,
        deliveryStreet,
        deliveryStreetNumber,
        deliveryStreet2,
        deliveryPostalCode,
        deliveryCity,
        deliveryDistrict,
    ]);

    const grandTotal =
        deliveryFee !== null
            ? Math.max(0, total + deliveryFee - (appliedCoupon?.discount ?? 0))
            : null;

    async function applyCoupon() {
        if (!couponInput.trim() || deliveryFee === null) return;
        try {
            setIsApplyingCoupon(true);
            setCouponError(null);
            const result = await customerCouponsApi.validate(couponInput.trim(), total, deliveryFee);
            setAppliedCoupon({ code: result.code, discount: result.discount });
            setCouponInput(result.code);
        } catch (err) {
            setAppliedCoupon(null);
            setCouponError(err instanceof Error ? err.message : "Não foi possível aplicar o cupão.");
        } finally {
            setIsApplyingCoupon(false);
        }
    }

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

        if (!acceptedTerms) {
            setError("Para continuar, confirma que leste e aceitas os Termos e Condições e a Política de Privacidade.");
            return;
        }

        if (!recipientFirstName.trim()) {
            setError("Indica o nome da pessoa que vai receber a encomenda.");
            return;
        }

        if (recipientPhone && !isValidPhone(recipientPhone)) {
            setError("Introduz um número de telemóvel válido para o destinatário.");
            return;
        }

        if (!deliveryDate || !deliveryTimeSlot) {
            setError("Seleciona a data e o período de entrega.");
            return;
        }

        const today = new Date();
        const localToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
        if (deliveryDate < localToday) {
            setError("A data de entrega não pode estar no passado.");
            return;
        }

        if (
            !hasCompleteDeliveryAddress ||
            !deliveryCountryCode
        ) {

            setError(
                "Preencha a rua, número, código postal, cidade e distrito da morada de entrega.",
            );

            return;

        }

        if (
            !billingSameAsDelivery &&
            (!billingStreet.trim() ||
                !billingStreetNumber.trim() ||
                !billingPostalCode.trim() ||
                !billingCity.trim() ||
                !billingDistrict.trim())
        ) {
            setError("Preencha a morada de faturação completa.");
            return;
        }

        if (isCheckingDeliveryArea) {
            setError("Aguarde enquanto confirmamos a disponibilidade da entrega.");
            return;
        }

        if (deliveryAvailable === false) {
            setError(`Ainda não fazemos entregas nesta morada. A zona atual é ${deliveryAreaName}.`);
            return;
        }

        if (
            customerTaxNumber.trim() !== "" &&
            !/^\d{9}$/.test(
                customerTaxNumber.trim(),
            )
        ) {

            setError(
                "O NIF deve ter 9 dígitos.",
            );

            return;

        }

        try {

            setIsSubmitting(true);

            setError(null);

            const data: CustomerCreateOrder = {

                ...(appliedCoupon ? { couponCode: appliedCoupon.code } : {}),

                items: items.map(
                    (item) => ({

                        productId:
                            Number(item.id),

                        quantity:
                            item.quantity,

                        ...(item.variantId !== undefined
                            ? {
                                variantId:
                                    item.variantId,
                            }
                            : {}),

                        ...(item.components?.length
                            ? {
                                components:
                                    item.components.map(
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

                deliveryStreet,

                deliveryStreetNumber,

                deliveryStreet2:
                    deliveryStreet2 ||
                    undefined,

                deliveryPostalCode,

                deliveryCity,

                deliveryDistrict,

                deliveryCountryCode,

                billingSameAsDelivery,
                ...(!billingSameAsDelivery
                    ? {
                        billingStreet: billingStreet.trim(),
                        billingStreetNumber: billingStreetNumber.trim(),
                        billingStreet2: billingStreet2.trim() || undefined,
                        billingPostalCode: billingPostalCode.trim(),
                        billingCity: billingCity.trim(),
                        billingDistrict: billingDistrict.trim(),
                        billingCountryCode: "PT",
                    }
                    : {}),

                // CARD

                cardMessage:
                    cardMessage ||
                    undefined,

            };

            /*
             * 1. Create order
             *
             * Payment is handled on the shared
             * /checkout/payment page.
             */
            const response =
                await customerOrdersApi.create(data);

            /*
             * The order now exists independently from
             * the cart. Clear the cart before navigating
             * to the shared payment page.
             */
            setIsRedirectingToPayment(true);
            clearCart();

            
            /*
             * 2. Go to the shared payment page.
             *
             * The customer can later use the order payment page
             * to retry a pending payment.
             */
            router.push(`/checkout/payment/${response.orderNumber}`);
            

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

                        <p className="mt-4 text-sm text-gray-500">
                            A carregar...
                        </p>

                    </div>

                </div>

            </div>

        );

    }

    if (isRedirectingToPayment) {
        return (
            <div className="min-h-screen bg-[#F7F8F4] px-4 py-16">
                <div className="mx-auto flex max-w-7xl items-center justify-center">
                    <div className="w-full max-w-md rounded-[2rem] border border-[#E6EAE1] bg-white px-8 py-12 text-center shadow-[0_20px_60px_rgba(47,59,42,0.08)]">
                        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-[3px] border-[#D6DEC8] border-t-[#55624A]" />
                        <h1 className="mt-6 text-xl font-semibold text-[#2F3B2A]">A preparar o pagamento</h1>
                        <p className="mt-2 text-sm leading-6 text-[#7A8373]">A sua encomenda foi criada. Aguarde enquanto abrimos a página de pagamento seguro.</p>
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
                        <span className="text-xl">
                            →
                        </span>
                    </div>

                    <h1 className="mt-6 text-3xl font-bold tracking-tight text-[#2F3B2A]">
                        Inicie sessão para continuar
                    </h1>

                    <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500">
                        Precisa de estar autenticado para finalizar a sua encomenda.
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            router.push("/login")
                        }
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
                        <span className="text-xl">
                            🛒
                        </span>
                    </div>

                    <h1 className="mt-6 text-3xl font-bold tracking-tight text-[#2F3B2A]">
                        O seu carrinho está vazio
                    </h1>

                    <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500">
                        Adicione pelo menos um produto antes de finalizar a encomenda.
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            router.push("/products")
                        }
                        className="mt-8 rounded-full bg-[#55624A] px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-[#46523D]"
                    >
                        Ver catálogo
                    </button>

                </div>

            </div>

        );

    }

    if (isLoadingDeliveryFee) {
        return (
            <div className="min-h-screen bg-[#F7F8F4] px-4 py-16">
                <div className="mx-auto flex max-w-7xl items-center justify-center">
                    <div className="rounded-3xl bg-white px-8 py-10 text-center shadow-sm">
                        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#D6DEC8] border-t-[#55624A]" />
                        <p className="mt-4 text-sm text-gray-500">A preparar o checkout...</p>
                    </div>
                </div>
            </div>
        );
    }

    const fieldClass =
        "w-full rounded-xl border border-[#E3E7DE] bg-white px-4 py-3 text-sm text-[#2F3B2A] outline-none transition placeholder:text-gray-400 focus:border-[#8C997E] focus:ring-4 focus:ring-[#D6DEC8]/50";

    const labelClass =
        "mb-2 block text-xs font-semibold uppercase tracking-wide text-[#596151]";

    const sectionClass =
        "rounded-[1.35rem] border border-[#e7e3d8] bg-[#fffefa] p-5 shadow-[0_8px_30px_rgba(47,59,42,0.035)] sm:p-7";

    return (

        <div className="min-h-screen bg-[#f8f6f1]">

            <div className="mx-auto max-w-[1320px] px-4 py-8 sm:px-7 sm:py-12 lg:px-12">

                <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

                    <div>

                        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#E8EDDF] px-3 py-1.5 text-xs font-semibold text-[#55624A]">

                            <span className="h-1.5 w-1.5 rounded-full bg-[#7D8D6D]" />

                            Checkout

                        </div>

                        <h1 className="text-4xl leading-tight tracking-tight text-[#2F3B2A] sm:text-5xl">
                            Finalizar encomenda
                        </h1>

                        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
                            Preencha os dados abaixo. A morada será utilizada pelo nosso sistema para calcular a localização da entrega.
                        </p>

                    </div>

                    <div className="hidden rounded-2xl border border-[#E3E7DE] bg-white px-4 py-3 sm:block">

                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                            Total de produtos
                        </p>

                        <p className="mt-1 text-lg font-bold text-[#2F3B2A]">
                            {items.length}{" "}
                            {items.length === 1
                                ? "item"
                                : "itens"}
                        </p>

                    </div>

                </div>

                <form
                    onSubmit={handleSubmit}
                    className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px]"
                >

                    <div className="space-y-6">

                        {/* COMPRADOR */}

                        <section className={sectionClass}>

                            <div className="flex items-start gap-4">

                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#E8EDDF] text-[#55624A]">
                                    <span className="text-lg">
                                        01
                                    </span>
                                </div>

                                <div>

                                    <h2 className="text-lg font-bold text-[#2F3B2A]">
                                        Informação do comprador
                                    </h2>

                                    <p className="mt-1 text-sm text-gray-500">
                                        Dados associados à sua conta.
                                    </p>

                                </div>

                            </div>

                            <div className="mt-6 rounded-2xl border border-[#E7EBE2] bg-[#F8F9F6] p-5">

                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                                    <div>

                                        <p className="font-semibold text-[#2F3B2A]">
                                            {user.firstName}{" "}
                                            {user.lastName}
                                        </p>

                                        <p className="mt-1 text-sm text-gray-500">
                                            {user.email}
                                        </p>

                                        {user.phone && (
                                            <p className="mt-1 text-sm text-gray-500">
                                                {user.phone}
                                            </p>
                                        )}

                                    </div>

                                    <span className="w-fit rounded-full bg-white px-3 py-1.5 text-xs font-medium text-[#66705F] shadow-sm">
                                        Conta autenticada
                                    </span>

                                </div>

                            </div>

                        </section>

                        {/* DESTINATÁRIO */}

                        <section className={sectionClass}>

                            <div className="flex items-start gap-4">

                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#E8EDDF] text-[#55624A]">
                                    <span className="text-lg">
                                        02
                                    </span>
                                </div>

                                <div>

                                    <h2 className="text-lg font-bold text-[#2F3B2A]">
                                        Informação do destinatário
                                    </h2>

                                    <p className="mt-1 text-sm text-gray-500">
                                        Quem irá receber as flores.
                                    </p>

                                </div>

                            </div>

                            <div className="mt-6 grid gap-4 sm:grid-cols-2">

                                <div>

                                    <label className={labelClass}>
                                        Nome *
                                    </label>

                                    <input
                                        required
                                        value={recipientFirstName}
                                        onChange={(e) =>
                                            setRecipientFirstName(
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Nome"
                                        className={fieldClass}
                                    />

                                </div>

                                <div>

                                    <label className={labelClass}>
                                        Apelido
                                    </label>

                                    <input
                                        value={recipientLastName}
                                        onChange={(e) =>
                                            setRecipientLastName(
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Apelido"
                                        className={fieldClass}
                                    />

                                </div>

                                <div className="sm:col-span-2">

                                    <label className={labelClass}>
                                        Telefone
                                    </label>

                                    <PhoneInput
                                        value={recipientPhone}
                                        onValueChange={setRecipientPhone}
                                    />

                                </div>

                                <div className="sm:col-span-2">

                                    <label className={labelClass}>
                                        Ocasião
                                    </label>

                                    <select
                                        value={
                                            occasion ??
                                            ""
                                        }
                                        onChange={(e) =>
                                            setOccasion(
                                                e.target.value
                                                    ? (e.target.value as CustomerCreateOrder["occasion"])
                                                    : undefined,
                                            )
                                        }
                                        className={fieldClass}
                                    >

                                        <option value="">
                                            Selecione uma ocasião
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
                                            Condolências
                                        </option>

                                        <option value="NEW_BABY">
                                            Nascimento
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
                                            Outra
                                        </option>

                                    </select>

                                </div>

                            </div>

                        </section>

                        {/* ENTREGA */}

                        <section className={sectionClass}>

                            <div className="flex items-start gap-4">

                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#E8EDDF] text-[#55624A]">
                                    <span className="text-lg">
                                        03
                                    </span>
                                </div>

                                <div>

                                    <h2 className="text-lg font-bold text-[#2F3B2A]">
                                        Informação da entrega
                                    </h2>

                                    <p className="mt-1 text-sm text-gray-500">
                                        Escolha quando pretende receber a encomenda.
                                    </p>

                                </div>

                            </div>

                            <div className="mt-6 grid gap-4 sm:grid-cols-2">

                                <div>

                                    <label className={labelClass}>
                                        Data de entrega *
                                    </label>

                                    <input
                                        required
                                        type="date"
                                        min={getTodayDate()}
                                        value={deliveryDate}
                                        onChange={(e) =>
                                            setDeliveryDate(
                                                e.target.value,
                                            )
                                        }
                                        className={fieldClass}
                                    />

                                </div>

                                <div>

                                    <label className={labelClass}>
                                        Período *
                                    </label>

                                    <select
                                        required
                                        value={deliveryTimeSlot}
                                        onChange={(e) =>
                                            setDeliveryTimeSlot(
                                                e.target.value as CustomerCreateOrder["deliveryTimeSlot"],
                                            )
                                        }
                                        className={fieldClass}
                                    >

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

                            <div className="mt-6 rounded-2xl border border-[#DDE5D5] bg-[#F7F9F4] p-5">

                                <div className="flex items-center gap-3">

                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#D6DEC8] text-[#55624A]">
                                        ⌖
                                    </div>

                                    <div>

                                        <p className="text-sm font-bold text-[#2F3B2A]">
                                            Morada de entrega
                                        </p>

                                        <p className="mt-0.5 text-xs text-gray-500">
                                            Introduza a morada manualmente.
                                        </p>

                                    </div>

                                </div>

                                <div className="mt-5 grid gap-4">

                                    <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_130px]">

                                        <div>

                                            <label className={labelClass}>
                                                Rua *
                                            </label>

                                            <input
                                                required
                                                value={deliveryStreet}
                                                onChange={(e) =>
                                                    setDeliveryStreet(
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Ex.: Rua de Santa Catarina"
                                                autoComplete="street-address"
                                                className={fieldClass}
                                            />

                                        </div>

                                        <div>

                                            <label className={labelClass}>
                                                Número *
                                            </label>

                                            <input
                                                required
                                                value={deliveryStreetNumber}
                                                onChange={(e) =>
                                                    setDeliveryStreetNumber(
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="123"
                                                className={fieldClass}
                                            />

                                        </div>

                                    </div>

                                    <div>

                                        <label className={labelClass}>
                                            Complemento
                                        </label>

                                        <input
                                            value={deliveryStreet2}
                                            onChange={(e) =>
                                                setDeliveryStreet2(
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Apartamento, andar, porta, etc."
                                            autoComplete="address-line2"
                                            className={fieldClass}
                                        />

                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">

                                        <div>

                                            <label className={labelClass}>
                                                Código postal *
                                            </label>

                                            <input
                                                required
                                                value={deliveryPostalCode}
                                                onChange={(e) =>
                                                    setDeliveryPostalCode(
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="4000-000"
                                                inputMode="numeric"
                                                autoComplete="postal-code"
                                                maxLength={8}
                                                pattern="[0-9]{4}-[0-9]{3}"
                                                title="Introduza um código postal no formato 0000-000"
                                                className={fieldClass}
                                            />

                                        </div>

                                        <div>

                                            <label className={labelClass}>
                                                Cidade / localidade *
                                            </label>

                                            <input
                                                required
                                                value={deliveryCity}
                                                onChange={(e) =>
                                                    setDeliveryCity(
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Ex.: Porto"
                                                autoComplete="address-level2"
                                                className={fieldClass}
                                            />

                                        </div>

                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">

                                        <div>

                                            <label className={labelClass}>
                                                Distrito *
                                            </label>

                                            <select
                                                required
                                                value={deliveryDistrict}
                                                onChange={(e) =>
                                                    setDeliveryDistrict(
                                                        e.target.value,
                                                    )
                                                }
                                                autoComplete="address-level1"
                                                className={fieldClass}
                                            >

                                                <option value="">
                                                    Selecione o distrito
                                                </option>

                                                {PORTUGAL_DISTRICTS.map(
                                                    (district) => (
                                                        <option
                                                            key={
                                                                district
                                                            }
                                                            value={
                                                                district
                                                            }
                                                        >
                                                            {
                                                                district
                                                            }
                                                        </option>
                                                    ),
                                                )}

                                            </select>

                                        </div>

                                        <div>

                                            <label className={labelClass}>
                                                País *
                                            </label>

                                            <div className="flex min-h-[48px] items-center gap-3 rounded-xl border border-[#E3E7DE] bg-[#F3F5EF] px-4 text-sm text-[#596151]">

                                                <span>
                                                    🇵🇹
                                                </span>

                                                <span className="font-medium">
                                                    Portugal
                                                </span>

                                            </div>

                                        </div>

                                    </div>

                                </div>

                                {hasCompleteDeliveryAddress && (
                                    <div role="status" className={`mt-4 rounded-xl border px-4 py-3 text-sm ${isCheckingDeliveryArea ? "border-[#E6E1D3] bg-[#FBF9F2] text-[#7E735B]" : deliveryAvailable === true ? "border-green-200 bg-green-50 text-green-700" : deliveryAvailable === false ? "border-red-200 bg-red-50 text-red-700" : "border-[#E3E7DE] bg-white text-[#747D6E]"}`}>
                                        {isCheckingDeliveryArea
                                            ? "A confirmar a disponibilidade da entrega..."
                                            : deliveryAvailable === true
                                                ? `Esta morada está abrangida pela zona ${deliveryAreaName}.`
                                                : deliveryAvailable === false
                                                    ? `Ainda não fazemos entregas nesta morada. Neste momento entregamos em ${deliveryAreaName}.`
                                                    : "Não foi possível confirmar automaticamente a zona. A morada será validada ao continuar."}
                                    </div>
                                )}

                            </div>

                            <div className="mt-5">

                                <label className={labelClass}>
                                    Instruções para entrega
                                </label>

                                <textarea
                                    value={deliveryInstructions}
                                    onChange={(e) =>
                                        setDeliveryInstructions(
                                            e.target.value,
                                        )
                                    }
                                    rows={4}
                                    placeholder="Ex.: tocar à campainha, deixar na receção..."
                                    className={`${fieldClass} resize-none`}
                                />

                            </div>

                        </section>

                        {/* CARTÃO */}

                        <section className={sectionClass}>

                            <div className="flex items-start gap-4">

                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#E8EDDF] text-[#55624A]">
                                    <span className="text-lg">
                                        04
                                    </span>
                                </div>

                                <div>

                                    <h2 className="text-lg font-bold text-[#2F3B2A]">
                                        Cartão
                                    </h2>

                                    <p className="mt-1 text-sm text-gray-500">
                                        Adicione uma mensagem para acompanhar as flores.
                                    </p>

                                </div>

                            </div>

                            <div className="mt-6 rounded-2xl bg-[#F8F5EF] p-5">

                                <div className="mb-4 flex items-center gap-3 text-[#756C5D]">

                                    <span className="text-xl">
                                        ✉
                                    </span>

                                    <p className="text-sm font-medium">
                                        Uma mensagem torna a entrega ainda mais especial.
                                    </p>

                                </div>

                                <textarea
                                    value={cardMessage}
                                    onChange={(e) =>
                                        setCardMessage(
                                            e.target.value,
                                        )
                                    }
                                    rows={5}
                                    maxLength={500}
                                    placeholder="Escreva uma mensagem personalizada..."
                                    className="w-full resize-none rounded-xl border border-[#E8E0D3] bg-white px-4 py-3 text-sm text-[#2F3B2A] outline-none placeholder:text-gray-400 focus:border-[#A69B86] focus:ring-4 focus:ring-[#E9E2D7]"
                                />

                                <p className="mt-2 text-right text-xs text-gray-400">
                                    Máximo 500 caracteres
                                </p>

                            </div>

                        </section>

                        <section className={sectionClass}>
                            <div className="flex items-start gap-4">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#E8EDDF] text-[#55624A]"><span className="text-lg">05</span></div>
                                <div><h2 className="text-lg font-bold text-[#2F3B2A]">Faturação</h2><p className="mt-1 text-sm text-gray-500">Dados que serão guardados no seu perfil e utilizados na fatura.</p></div>
                            </div>

                            <div className="mt-6">
                                <label className={labelClass}>NIF</label>
                                <input value={customerTaxNumber} onChange={(event) => setCustomerTaxNumber(event.target.value.replace(/\D/g, "").slice(0, 9))} placeholder="Ex.: 123456789" inputMode="numeric" maxLength={9} className={`${fieldClass} max-w-md`} />
                                <p className="mt-2 text-xs text-gray-400">Sem NIF, a fatura será emitida a consumidor final.</p>
                            </div>

                            <div className="mt-5 rounded-2xl border border-[#DDE5D5] bg-white p-5">
                                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                                    <div><p className="text-sm font-bold text-[#2F3B2A]">Morada de faturação</p><p className="mt-1 text-xs text-gray-500">Pode utilizar a mesma morada indicada para a entrega.</p></div>
                                    <label className="flex items-center gap-2 text-xs font-semibold text-[#55624A]"><input type="checkbox" checked={billingSameAsDelivery} onChange={(event) => setBillingSameAsDelivery(event.target.checked)} className="h-4 w-4 accent-[#55624A]" /> Igual à entrega</label>
                                </div>
                                {!billingSameAsDelivery && (
                                    <div className="mt-5 grid gap-4">
                                        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_130px]">
                                            <div><label className={labelClass}>Rua *</label><input required value={billingStreet} onChange={(event) => setBillingStreet(event.target.value)} autoComplete="billing address-line1" className={fieldClass} /></div>
                                            <div><label className={labelClass}>Número *</label><input required value={billingStreetNumber} onChange={(event) => setBillingStreetNumber(event.target.value)} className={fieldClass} /></div>
                                        </div>
                                        <div><label className={labelClass}>Complemento</label><input value={billingStreet2} onChange={(event) => setBillingStreet2(event.target.value)} autoComplete="billing address-line2" className={fieldClass} /></div>
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div><label className={labelClass}>Código postal *</label><input required value={billingPostalCode} onChange={(event) => setBillingPostalCode(event.target.value)} placeholder="0000-000" pattern="[0-9]{4}-[0-9]{3}" maxLength={8} autoComplete="billing postal-code" className={fieldClass} /></div>
                                            <div><label className={labelClass}>Cidade / localidade *</label><input required value={billingCity} onChange={(event) => setBillingCity(event.target.value)} autoComplete="billing address-level2" className={fieldClass} /></div>
                                        </div>
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div><label className={labelClass}>Distrito *</label><select required value={billingDistrict} onChange={(event) => setBillingDistrict(event.target.value)} autoComplete="billing address-level1" className={fieldClass}><option value="">Selecione o distrito</option>{PORTUGAL_DISTRICTS.map((district) => <option key={district} value={district}>{district}</option>)}</select></div>
                                            <div><label className={labelClass}>País *</label><div className="flex min-h-[48px] items-center gap-3 rounded-xl border border-[#E3E7DE] bg-[#F3F5EF] px-4 text-sm text-[#596151]"><span>🇵🇹</span><span className="font-medium">Portugal</span></div></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>

                        {error && (

                            <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">

                                <p className="font-semibold">
                                    Não foi possível criar a encomenda
                                </p>

                                <p className="mt-1">
                                    {error}
                                </p>

                            </div>

                        )}

                    </div>

                    {/* RESUMO */}

                    <aside className="lg:sticky lg:top-24">

                        <div className="overflow-hidden rounded-[1.75rem] border border-[#E2E7DD] bg-white shadow-[0_12px_40px_rgba(47,59,42,0.07)]">

                            <div className="bg-[#2F3B2A] p-6 text-white">

                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#D6DEC8]">
                                    A sua encomenda
                                </p>

                                <h2 className="mt-2 text-2xl font-bold">
                                    Resumo
                                </h2>

                            </div>

                            <div className="p-6">

                                <div className="space-y-4">

                                    {items.map((item) => {

                                        const cartItem =
                                            item as typeof item & {
                                                image?: string;
                                                description?: string;
                                            };

                                        const itemDescription =
                                            typeof cartItem.description === "string"
                                                ? cartItem.description.trim()
                                                : "";

                                        return (

                                            <div
                                                key={`${item.id}-${"cartItemId" in item ? String(item.cartItemId) : ""}-${item.quantity}-${item.name}`}
                                                className="overflow-hidden rounded-2xl border border-[#E7EBE2] bg-[#FBFCFA]"
                                            >

                                                <div className="flex gap-4 p-4">

                                                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-[#F0F3EC]">

                                                        {cartItem.image ? (

                                                            <Image
                                                                src={cartItem.image}
                                                                alt={item.name}
                                                                fill
                                                                sizes="96px"
                                                                className="object-cover"
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
                                                                    {
                                                                        item.name
                                                                    }
                                                                </p>

                                                                {itemDescription && (
                                                                    <p
                                                                        className="mt-1 truncate text-xs text-gray-500"
                                                                        title={itemDescription}
                                                                    >
                                                                        {itemDescription}
                                                                    </p>
                                                                )}

                                                                <p className="mt-1 text-xs text-gray-500">
                                                                    {
                                                                        item.quantity
                                                                    }{" "}
                                                                    {item.quantity ===
                                                                    1
                                                                        ? "unidade"
                                                                        : "unidades"}
                                                                </p>

                                                            </div>

                                                            <p className="whitespace-nowrap text-sm font-bold text-[#2F3B2A]">
                                                                {formatPrice(
                                                                    item.price * item.quantity,
                                                                )}
                                                            </p>

                                                        </div>

                                                    </div>

                                                </div>

                                            </div>

                                        );

                                    })}

                                </div>

                                <div className="my-6 border-t border-dashed border-[#DDE2D8]" />

                                <div className="mb-5 rounded-2xl border border-[#E2E7DD] bg-white p-3">
                                    <label htmlFor="coupon-code" className="text-xs font-semibold text-[#566449]">Cupão de desconto</label>
                                    <div className="mt-2 flex gap-2">
                                        <input id="coupon-code" value={couponInput} onChange={(event) => { setCouponInput(event.target.value.toUpperCase()); setAppliedCoupon(null); }} placeholder="Introduza o código" className="min-w-0 flex-1 rounded-xl border border-[#E2E7DD] px-3 py-2.5 text-sm uppercase outline-none focus:border-[#71805F]" />
                                        <button type="button" onClick={() => void applyCoupon()} disabled={isApplyingCoupon || !couponInput.trim() || deliveryFee === null} className="rounded-xl bg-[#55624A] px-4 text-sm font-semibold text-white disabled:opacity-50">{isApplyingCoupon ? "A validar..." : "Aplicar"}</button>
                                    </div>
                                    {couponError && <p className="mt-2 text-xs text-red-700">{couponError}</p>}
                                    {appliedCoupon && <p className="mt-2 text-xs font-semibold text-green-700">Cupão {appliedCoupon.code} aplicado.</p>}
                                </div>

                                <div className="space-y-3 text-sm">

                                    <div className="flex justify-between text-gray-500">

                                        <span>
                                            Subtotal
                                        </span>

                                        <span>
                                            {formatPrice(total)}
                                        </span>

                                    </div>

                                    <div className="flex justify-between text-gray-500">
                                        <span>Envio</span>
                                        <span>
                                            {isLoadingDeliveryFee
                                                ? "A calcular..."
                                                : deliveryFee !== null
                                                    ? formatPrice(deliveryFee)
                                                    : "Indisponível"}
                                        </span>
                                    </div>

                                    <div className={`flex justify-between font-medium ${appliedCoupon ? "text-green-700" : "text-gray-500"}`}>
                                        <span>Desconto</span>
                                        <span>{appliedCoupon ? `− ${formatPrice(appliedCoupon.discount)}` : formatPrice(0)}</span>
                                    </div>

                                </div>

                                <div className="my-5 border-t border-[#E5E9E1]" />

                                <div className="flex items-end justify-between gap-4">

                                    <div>

                                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                            TOTAL
                                        </p>

                                        <p className="mt-1 text-3xl font-bold tracking-tight text-[#2F3B2A]">

                                            {grandTotal !==
                                            null

                                                ? formatPrice(grandTotal)
                                                : formatPrice(total)}

                                        </p>

                                    </div>

                                    {grandTotal ===
                                        null && (

                                            <span className="text-right text-xs text-gray-400">
                                                + entrega
                                            </span>

                                        )}

                                </div>

                                <div className="mt-6 rounded-2xl border border-[#E2E7DD] bg-[#F8F9F5] p-4">
                                    <label className="flex cursor-pointer items-start gap-3 text-xs leading-5 text-[#626B5D]">
                                        <input
                                            type="checkbox"
                                            checked={acceptedTerms}
                                            onChange={(event) => setAcceptedTerms(event.target.checked)}
                                            className="mt-0.5 h-4 w-4 shrink-0 accent-[#55624A]"
                                        />
                                        <span>
                                            Li e aceito os <Link href="/terms" target="_blank" className="font-semibold text-[#55624A] underline">Termos e Condições</Link> e a <Link href="/privacy" target="_blank" className="font-semibold text-[#55624A] underline">Política de Privacidade</Link>. Confirmo a área e condições de entrega e compreendo que os produtos naturais podem variar face às imagens ilustrativas.
                                        </span>
                                    </label>
                                </div>

                                <p className="mt-4 rounded-xl bg-[#FFF9EC] px-4 py-3 text-xs leading-5 text-[#7D6841]">
                                    Em caso de indisponibilidade operacional excecional após o pagamento, entraremos em contacto e será efetuado o reembolso integral sem demora injustificada.
                                </p>

                                <button
                                    type="submit"
                                    disabled={isSubmitting || isCheckingDeliveryArea || deliveryAvailable === false || !acceptedTerms}
                                    className="mt-7 w-full rounded-2xl bg-[#55624A] px-5 py-4 text-sm font-bold text-white shadow-sm transition hover:bg-[#46523D] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                                >

                                    {isSubmitting
                                        ? "A preparar pagamento..."
                                        : "Continuar para pagamento"}

                                </button>

                                <p className="mt-4 text-center text-xs leading-5 text-gray-400">
                                    Ao continuar, a encomenda será criada. O pagamento só é efetuado no passo seguinte.
                                </p>

                            </div>

                        </div>

                    </aside>

                </form>

            </div>

        </div>

    );

}
