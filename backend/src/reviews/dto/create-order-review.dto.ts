import {
    IsArray,
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    Max,
    MaxLength,
    Min,
    ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';

import { ReviewCategory } from '@prisma/client';

export class CreateOrderReviewRatingDto {
    @IsEnum(ReviewCategory)
    category: ReviewCategory;

    @IsInt()
    @Min(1)
    @Max(5)
    rating: number;
}

export class CreateOrderReviewDto {
    @IsArray()
    @ValidateNested({
        each: true,
    })
    @Type(() => CreateOrderReviewRatingDto)
    ratings: CreateOrderReviewRatingDto[];

    @IsOptional()
    @IsString()
    @MaxLength(2000)
    comment?: string;
}