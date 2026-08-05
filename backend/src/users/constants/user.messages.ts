import { EntityName } from '@/common/constants/entities';
import { CrudMessages } from '@/common/messages/crud-messages';

export const USER_MESSAGES = {
    CREATED: CrudMessages.created(
        EntityName.USER,
    ),

    UPDATED: CrudMessages.updated(
        EntityName.USER,
    ),

    DELETED: CrudMessages.deleted(
        EntityName.USER,
    ),

    NOT_FOUND: CrudMessages.notFound(
        EntityName.USER,
    ),

    ALREADY_EXISTS: CrudMessages.alreadyExists(
        EntityName.USER,
    ),

    INVALID_PASSWORD: 'Current password is incorrect.',

    PASSWORD_CHANGED: 'Password changed successfully.',

    PASSWORD_RESET: 'Password reset successfully.',
};