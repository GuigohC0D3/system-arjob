import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AdminGuard } from './admin.guard';
import { AUTH_TOKEN_COOKIE } from './auth.constants';
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

  private buildAuthCookieOptions(maxAgeMs?: number) {
    const isProduction = process.env.NODE_ENV === 'production';

    return {
      httpOnly: true,
      sameSite: 'strict' as const,
      secure: isProduction,
      path: '/',
      ...(maxAgeMs ? { maxAge: maxAgeMs } : {}),
    };
  }

  private extractBearerToken(req: Request) {
    return req.headers.authorization?.replace(/^Bearer\s+/i, '');
  }

  private extractCookieToken(req: Request) {
    const cookieHeader = req.headers.cookie;

    if (!cookieHeader) {
      return '';
    }

    const tokenCookie = cookieHeader
      .split(';')
      .map((chunk) => chunk.trim())
      .find((chunk) => chunk.startsWith(`${AUTH_TOKEN_COOKIE}=`));

    if (!tokenCookie) {
      return '';
    }

    return decodeURIComponent(tokenCookie.slice(AUTH_TOKEN_COOKIE.length + 1));
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post('register')
  register(@Req() req: Request, @Body() dto: RegisterDto) {
    return this.auth.register(dto, req.ip);
  }

  @Post('login')
  async login(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() dto: LoginDto,
  ) {
    const result = await this.auth.login(dto, req.ip);

    res.cookie(
      AUTH_TOKEN_COOKIE,
      result.accessToken,
      this.buildAuthCookieOptions(result.expiresInSeconds * 1000),
    );
    res.setHeader('Cache-Control', 'no-store');

    return {
      user: result.user,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: AuthenticatedRequest) {
    return this.auth.me(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response,
    @Body() dto: LogoutDto,
  ) {
    const headerToken = this.extractBearerToken(req);
    const cookieToken = this.extractCookieToken(req);
    const result = await this.auth.logout(
      dto.token || headerToken || cookieToken || '',
      req.user.userId,
    );

    res.clearCookie(AUTH_TOKEN_COOKIE, this.buildAuthCookieOptions());
    res.setHeader('Cache-Control', 'no-store');

    return result;
  }
}
