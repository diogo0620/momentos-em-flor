import { CreatedResponseDto } from "../dto/created-response.dto";
import { UpdatedResponseDto } from "../dto/updated-response.dto";


export interface Mapper<TEntity, TResponse> {
    toResponse(entity: TEntity): TResponse;
    toResponses(entities: TEntity[]): TResponse[];
    toCreatedResponse(entity: TEntity): CreatedResponseDto;
    toUpdatedResponse(entity: TEntity): UpdatedResponseDto;
}