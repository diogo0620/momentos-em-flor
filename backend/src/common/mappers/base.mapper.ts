import { EntityIdResponseDto } from '@/common/responses/dto/entity-id-response.dto';
import { MapperInterface } from './mapper.interface';
import { CreatedResponseDto } from '../dto/created-response.dto';

export abstract class BaseMapper<
  TEntity extends { id: number, slug?: string, orderNumber?: string },
  TDetailResponse,
  TListResponse,
> implements MapperInterface<TEntity, TDetailResponse, TListResponse>
{
  toCreatedResponse(entity: TEntity): CreatedResponseDto {
    return {
      id: entity.id,
      slug: entity.slug ? entity.slug : undefined,
      orderNumber: entity.orderNumber ? entity.orderNumber : undefined
    };
  }

  abstract toDetailResponse(entity: TEntity): TDetailResponse;

  toListResponse(entities: TEntity[]): TListResponse[] {
    return entities.map((entity) => this.toListItemResponse(entity));
  }

  protected abstract toListItemResponse(
    entity: TEntity,
  ): TListResponse;
}