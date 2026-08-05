import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginResponseDto } from './dto/login-response.dto';
import { RolesGuard } from './guards/roles.guard';
import { UserRole } from '@prisma/client';
import { Roles } from './decorators/roles.decorator';
import type { AuthenticatedUser } from './interfaces/authenticated-user.interface';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) { }

  @Get('me')
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles(UserRole.SYSTEM_ADMIN)
  @ApiBearerAuth('JWT')
  me(
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return user;
  }

  @Post('login')
  @ApiOkResponse({
    type: LoginResponseDto,
  })
  login(
    @Body() dto: LoginDto,
  ) {
    return this.authService.login(dto);
  }


}