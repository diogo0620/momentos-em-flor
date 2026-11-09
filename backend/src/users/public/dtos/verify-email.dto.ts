import { IsEmail, IsString, MinLength } from 'class-validator';

export class VerifyEmailDto {
  @IsString() @MinLength(32) token!: string;
}

export class ResendVerificationEmailDto {
  @IsEmail() email!: string;
}
