import { ApiProperty } from '@nestjs/swagger';

export class UpdatedResponseDto {
    @ApiProperty({
        example: 1,
        description: 'ID of the upated resource',
    })
    id: number;
}