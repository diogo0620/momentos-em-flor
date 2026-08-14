import { EntityName } from '@/common/constants/entities';
import { CrudMessages } from '@/common/messages/crud-messages';

export const FLORIST_COMPENSATION_RULE_MESSAGES = {
    CREATED: CrudMessages.created(
        EntityName.FLORIST_COMPENSATION_RULE,
    ),

    UPDATED: CrudMessages.updated(
        EntityName.FLORIST_COMPENSATION_RULE,
    ),

    DELETED: CrudMessages.deleted(
        EntityName.FLORIST_COMPENSATION_RULE,
    ),

    NOT_FOUND: CrudMessages.notFound(
        EntityName.FLORIST_COMPENSATION_RULE,
    ),

    ALREADY_EXISTS: CrudMessages.alreadyExists(
        EntityName.FLORIST_COMPENSATION_RULE,
    ),

    COMPENSATION_MUST_BE_LESS_THAN_PRICE:
        'The florist compensation must be lower than the product price.',
};