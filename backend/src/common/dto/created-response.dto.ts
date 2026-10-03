import { ApiProperty } from '@nestjs/swagger';

export class CreatedResponseDto {
    @ApiProperty({
        example: 1,
        description: 'ID of the created resource',
    })
    id: number;
}