
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';
import { AdminCreateProductVariantDto } from './admin-create-product-variant.dto';

export class AdminUpdateProductVariantDto extends AdminCreateProductVariantDto {
    @ApiPropertyOptional({
        example: 12,
        description: 'ID da variante existente. Omitir para criar uma nova.',
    })
    @IsOptional()
    @IsInt()
    @Min(1)
    id?: number;
}
