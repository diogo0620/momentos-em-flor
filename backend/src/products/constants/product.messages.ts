import { EntityName } from '@/common/constants/entities';
import { CrudMessages } from '@/common/messages/crud-messages';

export const PRODUCT_MESSAGES = {

    CREATED:
        CrudMessages.created(
            EntityName.PRODUCT,
        ),

    UPDATED:
        CrudMessages.updated(
            EntityName.PRODUCT,
        ),

    DELETED:
        CrudMessages.deleted(
            EntityName.PRODUCT,
        ),

    NOT_FOUND:
        CrudMessages.notFound(
            EntityName.PRODUCT,
        ),

    ALREADY_EXISTS:
        CrudMessages.alreadyExists(
            EntityName.PRODUCT,
        ),

    COMPENSATION_MUST_BE_LESS_THAN_PRICE:
        'The florist compensation must be lower than the product price.',

    PRICE_CANNOT_BE_LOWER_THAN_COMPENSATION_RULE:
        'The product price cannot be lower than or equal to an existing florist compensation.',
        TAX_CODE_NOT_FOUND:
    'Tax code not found.',

};