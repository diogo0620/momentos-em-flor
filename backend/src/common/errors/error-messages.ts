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
    PAYMENT_IS_NOT_PENDING: {
        code: 'PAYMENT_IS_NOT_PENDING',
        message: 'This payment is not pending.'
    },
    ORDER_ALREADY_PAID: {
        code: 'ORDER_ALREADY_PAID',
        message: 'This order is already paid'
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