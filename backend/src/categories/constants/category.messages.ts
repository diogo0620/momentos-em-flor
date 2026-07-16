import { EntityName } from '@/common/constants/entities';
import { CrudMessages } from '@/common/messages/crud-messages';

export const CATEGORY_MESSAGES = {

    CREATED:
        CrudMessages.created(
            EntityName.CATEGORY,
        ),

    UPDATED:
        CrudMessages.updated(
            EntityName.CATEGORY,
        ),

    DELETED:
        CrudMessages.deleted(
            EntityName.CATEGORY,
        ),

    NOT_FOUND:
        CrudMessages.notFound(
            EntityName.CATEGORY,
        ),

    ALREADY_EXISTS:
        CrudMessages.alreadyExists(
            EntityName.CATEGORY,
        ),

};