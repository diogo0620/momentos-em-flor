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

    COMPENSATION_MUST_BE_POSITIVE:
        'Compensation amount must be greater than zero.',

    COMPENSATION_TOO_HIGH:
        'Compensation amount cannot be greater than the order subtotal.',

    COMPENSATION_INVALID:
        'Invalid compensation amount.',

    CUSTOMER_CONTACT_REQUIRED:
        'Customer email or phone is required.',

    CUSTOMER_FIRST_NAME_REQUIRED:
        'Customer first name is required.',

    INVALID_STATUS:
        'Invalid order status.',

    STATUS_ALREADY_SET:
        'Order is already in this status.',

    INVALID_STATUS_TRANSITION:
        'This order status transition is not allowed.',

    STATUS_CHANGE_NOT_ALLOWED:
        'You are not allowed to change the status of this order.',
    FLORIST_REQUIRED:
        'Florist is required.',

    ORDER_NOT_ASSIGNED_TO_FLORIST:
        'This order is not assigned to you.',
    CANNOT_CANCEL_ORDER:
        'This order cannot be cancelled.',
};