import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { AdminGuard } from './admin.guard';
import { AuthService } from './auth.service';
import { LoginDto, LogoutDto, RegisterDto } from './auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

type AuthenticatedRequest = Request & {
  user: {
    userId: number;
    cargos: string[];
    statusId: number | null;
  };
};

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post('register')
  register(@Req() req: Request, @Body() dto: RegisterDto) {
    return this.auth.register(dto, req.ip);
  }

  @Post('login')
  login(@Req() req: Request, @Body() dto: LoginDto) {
    return this.auth.login(dto, req.ip);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: AuthenticatedRequest) {
    return this.auth.me(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Req() req: AuthenticatedRequest, @Body() dto: LogoutDto) {
    const headerToken = req.headers.authorization?.replace(/^Bearer\s+/i, '');
    return this.auth.logout(dto.token || headerToken || '', req.user.userId);
  }
}
