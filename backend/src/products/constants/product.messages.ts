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

};