
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AdminTaxCodeResponseDto {
    @ApiProperty({example: 1})
    id!: number;

    @ApiProperty({example: 'IVA Normal'})
    name!: string;

    @ApiProperty({example: 'IVA Normal'})
    description!: string;

    @ApiProperty({example: 23})
    rate!: number;

    @ApiProperty({example: true})
    active!: boolean;

    @ApiProperty({example:'2026-09-01T17:00:00.000Z'})
    createdAt!: Date;

    @ApiProperty({example:'2026-09-01T17:00:00.000Z'})
    updatedAt!: Date;
}
