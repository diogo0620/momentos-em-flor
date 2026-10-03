import { Mapper } from './mapper.interface';
import { CreatedResponseDto } from '../dto/created-response.dto';
import { UpdatedResponseDto } from '../dto/updated-response.dto';

export interface EntityWithId {
    id: number;
}

export abstract class BaseMapper<
    TEntity extends EntityWithId,
    TResponse,
> implements Mapper<TEntity, TResponse> {
    abstract toResponse(entity: TEntity): TResponse;

    toResponses(entities: TEntity[]): TResponse[] {
        return entities.map((entity) => this.toResponse(entity));
    }

    toCreatedResponse(entity: TEntity): CreatedResponseDto {
        return {
            id: entity.id,
        };
    }

    toUpdatedResponse(entity: TEntity): UpdatedResponseDto {
        return {
            id: entity.id,
        };
    }
}