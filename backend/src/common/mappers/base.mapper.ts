import { Mapper } from './mapper.interface';

export abstract class BaseMapper<TEntity, TResponse>
  implements Mapper<TEntity, TResponse>
{
  abstract toResponse(entity: TEntity): TResponse;

  toResponses(
    entities: TEntity[],
  ): TResponse[] {
    return entities.map(entity =>
      this.toResponse(entity),
    );
  }
}