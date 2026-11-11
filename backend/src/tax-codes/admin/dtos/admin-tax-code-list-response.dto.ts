
import { ApiProperty } from '@nestjs/swagger';

export class AdminTaxCodeListResponseDto {
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

    @ApiProperty({ example: '12345', nullable: true })
    moloniId!: string | null;
}
