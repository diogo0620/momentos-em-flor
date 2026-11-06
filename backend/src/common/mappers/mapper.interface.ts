import { EntityIdResponseDto } from '@/common/responses/dto/entity-id-response.dto';

export interface MapperInterface<
  TEntity,
  TDetailResponse,
  TListResponse,
> {
  toCreatedResponse(entity: TEntity): EntityIdResponseDto;

  toDetailResponse(entity: TEntity): TDetailResponse;

  toListResponse(entities: TEntity[]): TListResponse[];
}