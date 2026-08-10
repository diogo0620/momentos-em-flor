import { EntityName } from '@/common/constants/entities';
import { CrudMessages } from '@/common/messages/crud-messages';

export const ORDER_MESSAGES = {
    CREATED: CrudMessages.created(
        EntityName.ORDER,
    ),

    UPDATED: CrudMessages.updated(
        EntityName.ORDER,
    ),

    DELETED: CrudMessages.deleted(
        EntityName.ORDER,
    ),

    NOT_FOUND: CrudMessages.notFound(
        EntityName.ORDER,
    ),

    CUSTOMER_NOT_FOUND:
        'Customer not found.',

    EMPTY_ORDER:
        'An order must contain at least one item.',

    DUPLICATE_PRODUCTS:
        'The same product cannot appear more than once in an order.',

    PRODUCT_NOT_AVAILABLE:
        'One or more products are not available.',

    FORBIDDEN:
        'You are not allowed to access orders.',

    PRODUCT_NOT_FOUND:
        'Product not found.',

    FLORIST_NOT_FOUND:
        'Florist not found.',

    OFFER_ALREADY_EXISTS:
        'An offer already exists for this order and florist.',
};