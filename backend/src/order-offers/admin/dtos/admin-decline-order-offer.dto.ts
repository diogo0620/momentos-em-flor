
import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class AdminDeclineOrderOfferDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(1000)
    declineReason!: string;
}
