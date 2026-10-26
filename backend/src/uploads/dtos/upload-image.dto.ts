import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class UploadImageDto {
    @ApiPropertyOptional({
        description: 'ID da categoria à qual associar a imagem.',
        example: 1,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    categoryId?: number;

    @ApiPropertyOptional({
        description: 'ID do produto ao qual associar a imagem.',
        example: 1,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    productId?: number;

    @ApiPropertyOptional({
        description: 'ID da variante à qual associar a imagem.',
        example: 1,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    variantId?: number;
}