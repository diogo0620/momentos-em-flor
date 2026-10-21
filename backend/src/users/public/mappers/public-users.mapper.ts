import { EntityIdResponseDto } from '@/common/responses/dto/entity-id-response.dto';
import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';

@Injectable()
export class PublicUsersMapper {
    toCreatedResponse(user: User): EntityIdResponseDto {
        return {
          id: user.id
        };
      }
}