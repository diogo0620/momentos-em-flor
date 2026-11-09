
import {
    Controller,
    Post,
    Body,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PublicUsersService } from './public-users.service';
import { PublicCreateUserDto } from './dtos/public-create-user.dto';
import { ResendVerificationEmailDto, VerifyEmailDto } from './dtos/verify-email.dto';

@ApiTags('Users (Public)')
@Controller('users')
export class PublicUsersController {
    constructor(
        private readonly service: PublicUsersService,
    ) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() dto: PublicCreateUserDto) {
        return await this.service.create(dto);
     }

    @Post('verify-email')
    @HttpCode(HttpStatus.NO_CONTENT)
    verifyEmail(@Body() dto: VerifyEmailDto) { return this.service.verifyEmail(dto.token); }

    @Post('resend-verification')
    @HttpCode(HttpStatus.NO_CONTENT)
    resendVerification(@Body() dto: ResendVerificationEmailDto) { return this.service.resendVerification(dto.email); }
}
