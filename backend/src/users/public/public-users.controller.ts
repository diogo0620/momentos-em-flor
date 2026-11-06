
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
}
