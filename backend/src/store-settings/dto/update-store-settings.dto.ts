import { IsNumber, Min } from 'class-validator';

export class UpdateStoreSettingsDto {
    @IsNumber()
    @Min(0)
    deliveryFee: number;
}