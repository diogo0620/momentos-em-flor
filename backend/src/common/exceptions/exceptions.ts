import {
  ConflictException,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';

export class Exceptions {
  static notFound(message: string): never {
    throw new NotFoundException(message);
  }

  static conflict(message: string): never {
    throw new ConflictException(message);
  }

  static badRequest(message: string): never {
    throw new BadRequestException(message);
  }

  static unauthorized(message: string): never {
    throw new UnauthorizedException(message);
  }

  static forbidden(message: string): never {
    throw new ForbiddenException(message);
  }
}