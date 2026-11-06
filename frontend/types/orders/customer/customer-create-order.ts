
export type Occasion =
    | "BIRTHDAY"
    | "ANNIVERSARY"
    | "LOVE"
    | "WEDDING"
    | "FUNERAL"
    | "NEW_BABY"
    | "MOTHERS_DAY"
    | "FATHERS_DAY"
    | "CHRISTMAS"
    | "OTHER";

export type DeliveryTimeSlot =
    | "MORNING"
    | "AFTERNOON"
    | "EVENING";

export type CustomerCreateOrderItemComponent = {
    /** ID da componente do produto. */
    componentId: number;

    /** Quantidade selecionada da componente. */
    quantity: number;
}

export type CustomerCreateOrderItem = {
    /** ID do produto. */
    productId: number;

    /** Quantidade do produto. */
    quantity: number;

    /** ID da variante selecionada. */
    variantId?: number;

    /** Componentes selecionadas e respetivas quantidades. */
    components?: CustomerCreateOrderItemComponent[];
}

export type CustomerCreateOrder = {
    /** NIF do comprador. */
    customerTaxNumber?: string;

    /** Nome do destinatário. */
    recipientFirstName: string;

    /** Apelido do destinatário. */
    recipientLastName?: string;

    /** Telefone do destinatário. */
    recipientPhone?: string;

    /** Ocasião da encomenda. */
    occasion?: Occasion;

    /** Data pretendida para a entrega (YYYY-MM-DD). */
    deliveryDate: string;

    /** Período de entrega. */
    deliveryTimeSlot: DeliveryTimeSlot;

    /** Instruções para a entrega. */
    deliveryInstructions?: string;

    /** Rua da morada de entrega. */
    deliveryStreet: string;

    /** Número da porta. */
    deliveryStreetNumber: string;

    /** Complemento da morada. */
    deliveryStreet2?: string;

    /** Código postal. */
    deliveryPostalCode: string;

    /** Cidade ou localidade. */
    deliveryCity: string;

    /** Distrito. */
    deliveryDistrict: string;

    /** Código do país. */
    deliveryCountryCode: string;

    /** Mensagem que acompanha as flores. */
    cardMessage?: string;

    /** Artigos da encomenda. */
    items: CustomerCreateOrderItem[];
}
