import { EntityIdResponseDto } from '@/common/responses/dto/entity-id-response.dto';
import { MapperInterface } from './mapper.interface';

export abstract class BaseMapper<
  TEntity extends { id: number },
  TDetailResponse,
  TListResponse,
> implements MapperInterface<TEntity, TDetailResponse, TListResponse>
{
  toCreatedResponse(entity: TEntity): EntityIdResponseDto {
    return {
      id: entity.id,
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