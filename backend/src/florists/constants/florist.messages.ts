import { EntityName } from '@/common/constants/entities';
import { CrudMessages } from '@/common/messages/crud-messages';

export const FLORIST_MESSAGES = {
  CREATED: CrudMessages.created(
    EntityName.FLORIST,
  ),

  UPDATED: CrudMessages.updated(
    EntityName.FLORIST,
  ),

  DELETED: CrudMessages.deleted(
    EntityName.FLORIST,
  ),

  NOT_FOUND: CrudMessages.notFound(
    EntityName.FLORIST,
  ),

  ALREADY_EXISTS: CrudMessages.alreadyExists(
    EntityName.FLORIST,
  ),
};