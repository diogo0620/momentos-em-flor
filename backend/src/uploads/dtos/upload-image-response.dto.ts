import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UploadImageResponseDto {
    @ApiProperty()
    path!: string;

    @ApiProperty()
    url!: string;

    @ApiProperty()
    contentType!: string;

    @ApiProperty()
    size!: number;

    @ApiProperty({ enum: ['CATEGORY', 'PRODUCT', 'VARIANT'] })
    context!: string;

    @ApiPropertyOptional()
    entityId?: number;
}
