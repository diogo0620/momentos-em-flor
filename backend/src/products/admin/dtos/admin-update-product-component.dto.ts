
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';
import { AdminCreateProductComponentDto } from './admin-create-product-component.dto';

export class AdminUpdateProductComponentDto extends AdminCreateProductComponentDto {
    @ApiPropertyOptional({
        example: 7,
        description: 'ID do componente existente. Omitir para criar um novo.',
    })
    @IsOptional()
    @IsInt()
    @Min(1)
    id?: number;
}
