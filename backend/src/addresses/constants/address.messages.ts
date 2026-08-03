import { EntityName } from '@/common/constants/entities';
import { CrudMessages } from '@/common/messages/crud-messages';

export const ADDRESS_MESSAGES = {

    CREATED:
        CrudMessages.created(
            EntityName.ADDRESS,
        ),

    UPDATED:
        CrudMessages.updated(
            EntityName.ADDRESS,
        ),

    DELETED:
        CrudMessages.deleted(
            EntityName.ADDRESS,
        ),

    NOT_FOUND:
        CrudMessages.notFound(
            EntityName.ADDRESS,
        ),

    ALREADY_EXISTS:
        CrudMessages.alreadyExists(
            EntityName.ADDRESS,
        ),

};