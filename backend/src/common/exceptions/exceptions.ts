import {
  ConflictException,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';

import { ERROR_MESSAGES, ErrorDefinition } from '@/common/errors/error-messages';

export class Exceptions {
  static notFound(error: ErrorDefinition): never {
    throw new NotFoundException(error);
  }

  static conflict(error: ErrorDefinition): never {
    throw new ConflictException(error);
  }

  static badRequest(error: ErrorDefinition): never {
    throw new BadRequestException(error);
  }

  static unauthorized(): never {
    throw new UnauthorizedException(ERROR_MESSAGES.UNAUTHORIZED);
  }

  static forbidden(): never {
    throw new ForbiddenException(ERROR_MESSAGES.FORBIDDEN);
  }
}