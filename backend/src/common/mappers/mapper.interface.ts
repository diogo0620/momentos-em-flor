export interface Mapper<TEntity, TResponse> {
  toResponse(entity: TEntity): TResponse;
  toResponses(entities: TEntity[]): TResponse[];
}