export interface ErrorDefinition {
    code: string;
    message: string;
}

export const ERROR_MESSAGES = {
    CATEGORY_NOT_FOUND: {
        code: 'CATEGORY_NOT_FOUND',
        message: 'Category not found.',
    },
    CATEGORY_ALREADY_EXISTS: {
        code: 'CATEGORY_ALREADY_EXISTS',
        message: 'A category with this name or slug already exists.',
    },
    PRODUCT_NOT_FOUND: {
        code: 'PRODUCT_NOT_FOUND',
        message: 'Product not found.',
    },
    PRODUCT_ALREADY_EXISTS: {
        code: 'PRODUCT_ALREADY_EXISTS',
        message: 'A product with this name or slug already exists.',
    },
    FLORIST_PRICE_MUST_BE_LESS_THAN_CUSTOMER_PRICE: {
        code: 'FLORIST_PRICE_MUST_BE_LESS_THAN_CUSTOMER_PRICE',
        message: 'The florist price must be lower than the customer price.'
    },
    USER_NOT_FOUND: {
        code: 'USER_NOT_FOUND',
        message: 'User not found.',
    },
    USER_ALREADY_EXISTS: {
        code: 'USER_ALREADY_EXISTS',
        message: 'A user with this email already exists.',
    },
    USER_WRONG_PASSWORD: {
        code: 'USER_WRONG_PASSWORD',
        message: 'The password provided is wrong',
    },
    TAX_CODE_NOT_FOUND: {
        code: 'TAX_CODE_NOT_FOUND',
        message: 'Tax Code not found.',
    },
    TAX_CODE_ALREADY_EXISTS: {
        code: 'TAX_CODE_ALREADY_EXISTS',
        message: 'A tax code with this name already exists.',
    },
    TAX_CODE_IN_USE: {
        code: 'TAX_CODE_IN_USE',
        message: 'Cannot delete this tax code because it is associated with one or more products.'
    },
    FLORIST_NOT_FOUND: {
        code: 'FLORIST_NOT_FOUND',
        message: 'Florist not found.',
    },
    FLORIST_ALREADY_EXISTS: {
        code: 'FLORIST_ALREADY_EXISTS',
        message: 'A florist with this tax number or email already exists.',
    },
    ORDER_NOT_FOUND: {
        code: 'ORDER_NOT_FOUND',
        message: 'Order not found.',
    },
    ORDER_ALREADY_EXISTS: {
        code: 'ORDER_ALREADY_EXISTS',
        message: 'An order with this number already exists.',
    },
    ORDER_ITEMS_REQUIRED: {
        code: 'ORDER_ITEMS_REQUIRED',
        message: 'The order must contain at least one item.',
    },
    PRODUCT_NOT_AVAILABLE: {
        code: 'PRODUCT_NOT_AVAILABLE',
        message: 'One or more selected products are not available.',
    },
    INVALID_PRODUCT_VARIANT: {
        code: 'INVALID_PRODUCT_VARIANT',
        message: 'The selected product variant is not available for this product.',
    },
    PRODUCT_VARIANT_REQUIRED: {
        code: 'PRODUCT_VARIANT_REQUIRED',
        message: 'A product variant must be selected for this product.',
    },
    INVALID_PRODUCT_COMPONENT: {
        code: 'INVALID_PRODUCT_COMPONENT',
        message: 'A selected component is not available for this product.',
    },
    INVALID_COMPONENT_QUANTITY: {
        code: 'INVALID_COMPONENT_QUANTITY',
        message: 'A selected component quantity is outside the allowed range.',
    },
    DUPLICATE_PRODUCT_COMPONENT: {
        code: 'DUPLICATE_PRODUCT_COMPONENT',
        message: 'The same product component cannot be selected more than once.',
    },
    DELIVERY_DATE_IN_PAST: {
        code: 'DELIVERY_DATE_IN_PAST',
        message: 'The delivery date cannot be in the past.',
    },
    DELIVERY_TAX_CODE_NOT_CONFIGURED: {
        code: 'DELIVERY_TAX_CODE_NOT_CONFIGURED',
        message: 'O código de IVA da taxa de entrega não está configurado.',
    },
    DELIVERY_ADDRESS_OUTSIDE_SERVICE_AREA: {
        code: 'DELIVERY_ADDRESS_OUTSIDE_SERVICE_AREA',
        message: 'A morada indicada está fora da zona de entrega disponível.',
    },
    ORDER_OFFER_NOT_FOUND: {
        code: 'ORDER_OFFER_NOT_FOUND',
        message: 'Order Offer not found.',
    },
    ORDER_OFFER_ALREADY_EXISTS: {
        code: 'ORDER_OFFER_ALREADY_EXISTS',
        message: 'An order offer for this florist and order already exists and it is pending',
    },
    ORDER_NOT_WAITING_FOR_FLORIST: {
        code: 'ORDER_NOT_WAITING_FOR_FLORIST',
        message: 'The order is not waiting for a florist.'
    },
    ORDER_OFFER_PRICE_EXCEEDS_ORDER: {
        code: 'ORDER_OFFER_PRICE_EXCEEDS_ORDER',
        message: 'The offer price cannot exceed the order total.'
    },
    INVALID_ORDER_OFFER_REFERENCE: {
        code: 'INVALID_ORDER_OFFER_REFERENCE',
        message: 'The specified order or florist does not exist.'
    },
    ORDER_OFFER_CANNOT_BE_UPDATED: {
        code: 'ORDER_OFFER_CANNOT_BE_UPDATED',
        message: 'Only pending or viewed order offers can be updated.'
    },
    ORDER_ALREADY_ASSIGNED: {
        code: 'ORDER_ALREADY_ASSIGNED',
        message: 'This order is already assigned to a florist'
    },
    PAYMENT_IS_NOT_PENDING: {
        code: 'PAYMENT_IS_NOT_PENDING',
        message: 'This payment is not pending.'
    },
    ORDER_ALREADY_PAID: {
        code: 'ORDER_ALREADY_PAID',
        message: 'This order is already paid'
    },
    INVALID_ORDER_STATUS_TRANSITION: {
        code: 'INVALID_ORDER_STATUS_TRANSITION',
        message: 'The requested order status transition is not allowed.',
    },
    ORDER_CANNOT_BE_CANCELLED: {
        code: 'ORDER_CANNOT_BE_CANCELLED',
        message: 'This order cannot be cancelled in its current state.',
    },
    PAYMENT_REFUND_REQUIRED: {
        code: 'PAYMENT_REFUND_REQUIRED',
        message: 'A encomenda está paga e tem de ser reembolsada antes de ser cancelada.',
    },
    MOLONI_CREDIT_NOTE_REQUIRED: {
        code: 'MOLONI_CREDIT_NOTE_REQUIRED',
        message: 'Regista a nota de crédito Moloni antes de cancelar esta encomenda faturada.',
    },
    FLORIST_COMPENSATION_NOT_FOUND: {
        code: 'FLORIST_COMPENSATION_NOT_FOUND',
        message: 'Florist compensation not found.',
    },
    FLORIST_COMPENSATION_NOT_DUE: {
        code: 'FLORIST_COMPENSATION_NOT_DUE',
        message: 'Only a due florist compensation can be marked as paid.',
    },
    ADDRESS_NOT_FOUND: {
        code: 'ADDRESS_NOT_FOUND',
        message: 'Address not found in Google Geocoding API'
    },
    UNAUTHORIZED: {
        code: 'UNAUTHORIZED',
        message: 'Unauthorized.',
    },
    FORBIDDEN: {
        code: 'FORBIDDEN',
        message: 'Forbidden.',
    },
} as const satisfies Record<string, ErrorDefinition>;
