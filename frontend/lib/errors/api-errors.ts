type ApiErrorPayload = {
    code?: string;
    message?: string | string[];
};

const ERROR_MESSAGES: Record<string, string> = {
    CATEGORY_NOT_FOUND: "Categoria não encontrada.",
    CATEGORY_ALREADY_EXISTS: "Já existe uma categoria com este nome ou endereço.",
    PRODUCT_NOT_FOUND: "Produto não encontrado.",
    PRODUCT_ALREADY_EXISTS: "Já existe um produto com este nome ou endereço.",
    FLORIST_PRICE_MUST_BE_LESS_THAN_CUSTOMER_PRICE: "O preço da florista tem de ser inferior ao preço do cliente.",
    USER_NOT_FOUND: "Utilizador não encontrado.",
    USER_ALREADY_EXISTS: "Já existe um utilizador com este email.",
    USER_WRONG_PASSWORD: "A password atual está incorreta.",
    TAX_CODE_NOT_FOUND: "Código de IVA não encontrado.",
    TAX_CODE_ALREADY_EXISTS: "Já existe um código de IVA com este nome.",
    TAX_CODE_IN_USE: "Este código de IVA está associado a produtos e não pode ser eliminado.",
    FLORIST_NOT_FOUND: "Florista não encontrada.",
    FLORIST_ALREADY_EXISTS: "Já existe uma florista com este NIF ou email.",
    ORDER_NOT_FOUND: "Encomenda não encontrada.",
    ORDER_ALREADY_EXISTS: "Já existe uma encomenda com este número.",
    ORDER_ITEMS_REQUIRED: "A encomenda tem de ter pelo menos um artigo.",
    PRODUCT_NOT_AVAILABLE: "Um ou mais produtos selecionados já não estão disponíveis.",
    INVALID_PRODUCT_VARIANT: "A variante selecionada não está disponível para este produto.",
    PRODUCT_VARIANT_REQUIRED: "Seleciona uma variante para este produto.",
    INVALID_PRODUCT_COMPONENT: "Um dos componentes selecionados não está disponível para este produto.",
    INVALID_COMPONENT_QUANTITY: "A quantidade de um dos componentes está fora dos limites permitidos.",
    DUPLICATE_PRODUCT_COMPONENT: "O mesmo componente não pode ser selecionado mais do que uma vez.",
    DELIVERY_DATE_IN_PAST: "A data de entrega não pode estar no passado.",
    DELIVERY_TAX_CODE_NOT_CONFIGURED: "O código de IVA da taxa de entrega não está configurado.",
    DELIVERY_ADDRESS_OUTSIDE_SERVICE_AREA: "Ainda não fazemos entregas nesta morada. Neste momento entregamos apenas em Santa Maria da Feira e arredores.",
    ORDER_OFFER_NOT_FOUND: "Proposta não encontrada.",
    ORDER_OFFER_ALREADY_EXISTS: "Já existe uma proposta pendente desta florista para a encomenda.",
    ORDER_NOT_WAITING_FOR_FLORIST: "A encomenda já não está à espera de uma florista.",
    ORDER_OFFER_PRICE_EXCEEDS_ORDER: "O valor da proposta não pode exceder o total da encomenda.",
    INVALID_ORDER_OFFER_REFERENCE: "A encomenda ou a florista indicada não existe.",
    ORDER_OFFER_CANNOT_BE_UPDATED: "Apenas propostas pendentes ou visualizadas podem ser atualizadas.",
    ORDER_ALREADY_ASSIGNED: "Esta encomenda já está atribuída a uma florista.",
    PAYMENT_IS_NOT_PENDING: "Este pagamento já não está pendente.",
    ORDER_ALREADY_PAID: "Esta encomenda já está paga.",
    INVALID_ORDER_STATUS_TRANSITION: "Esta alteração de estado da encomenda não é permitida.",
    ORDER_CANNOT_BE_CANCELLED: "A encomenda não pode ser cancelada no estado atual.",
    PAYMENT_REFUND_REQUIRED: "A encomenda está paga e tem de ser reembolsada antes de ser cancelada.",
    MOLONI_CREDIT_NOTE_REQUIRED: "Regista a nota de crédito Moloni antes de cancelar esta encomenda faturada.",
    FLORIST_COMPENSATION_NOT_FOUND: "Compensação da florista não encontrada.",
    FLORIST_COMPENSATION_NOT_DUE: "Apenas uma compensação por pagar pode ser marcada como paga.",
    ADDRESS_NOT_FOUND: "Não foi possível localizar a morada indicada.",
    UNAUTHORIZED: "A sessão expirou ou as credenciais estão incorretas.",
    FORBIDDEN: "Não tens permissão para realizar esta ação.",
    INVALID_PASSWORD_RESET_TOKEN: "A ligação de recuperação é inválida ou expirou.",
};

const VALIDATION_TRANSLATIONS: Array<[RegExp, string]> = [
    [/must be an email/i, "Introduz um endereço de email válido."],
    [/should not be empty/i, "Preenche todos os campos obrigatórios."],
    [/must be a string/i, "Um dos valores introduzidos não é válido."],
    [/must be a valid phone/i, "Introduz um número de telemóvel válido."],
    [/password must be at least/i, "A password não cumpre os requisitos de segurança."],
];

function translateValidationMessage(message: string): string {
    for (const [pattern, translation] of VALIDATION_TRANSLATIONS) {
        if (pattern.test(message)) return translation;
    }

    return message;
}

export class ApiError extends Error {
    constructor(
        message: string,
        public readonly status: number,
        public readonly code?: string,
    ) {
        super(message);
        this.name = "ApiError";
    }
}

export function createApiError(
    payload: ApiErrorPayload | null,
    status: number,
    fallback: string,
): ApiError {
    if (payload?.code && ERROR_MESSAGES[payload.code]) {
        return new ApiError(ERROR_MESSAGES[payload.code], status, payload.code);
    }

    const messages = Array.isArray(payload?.message)
        ? payload.message
        : payload?.message
          ? [payload.message]
          : [];
    const translated = messages.map(translateValidationMessage);
    const stillEnglish = translated.some((message) =>
        /\b(must|should|not found|invalid|cannot|already|wrong|unauthorized|forbidden|the|this|is|are|be|one|each|value|property|internal|server|required|provided|selected|contain|minimum|maximum|length|expired|link)\b/i.test(message),
    );

    const statusFallback: Record<number, string> = {
        400: "Verifica os dados introduzidos.",
        401: "A sessão expirou ou as credenciais estão incorretas.",
        403: "Não tens permissão para realizar esta ação.",
        404: "O recurso pedido não foi encontrado.",
        409: "Não foi possível concluir a operação porque os dados já existem.",
        413: "O ficheiro enviado é demasiado grande.",
        422: "Verifica os dados introduzidos.",
        429: "Foram efetuados demasiados pedidos. Aguarda um pouco e tenta novamente.",
        500: "Ocorreu um erro no servidor. Tenta novamente.",
    };

    return new ApiError(
        translated.length > 0 && !stillEnglish && status < 500
            ? translated.join(" ")
            : (statusFallback[status] ?? fallback),
        status,
        payload?.code,
    );
}
