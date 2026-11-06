
import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { AdminCreateProductDto } from './admin-create-product.dto';
import { AdminUpdateProductVariantDto } from './admin-update-product-variant.dto';
import { AdminUpdateProductComponentDto } from './admin-update-product-component.dto';


export class AdminUpdateProductDto extends PartialType(
    OmitType(AdminCreateProductDto, ['variants', 'components', 'type'] as const),
) {
    @ApiPropertyOptional({
        type: [AdminUpdateProductVariantDto],
        description: 'Se enviado, sincroniza as variantes do produto.',
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AdminUpdateProductVariantDto)
    variants?: AdminUpdateProductVariantDto[];

    @ApiPropertyOptional({
        type: [AdminUpdateProductComponentDto],
        description: 'Se enviado, sincroniza os componentes do produto.',
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AdminUpdateProductComponentDto)
    components?: AdminUpdateProductComponentDto[];
}
