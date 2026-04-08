import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AdminGuard } from './admin.guard';
import { AUTH_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from './auth.constants';
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

  private buildAccessCookieOptions(maxAgeMs?: number) {
    const isProduction = process.env.NODE_ENV === 'production';

    return {
      httpOnly: true,
      sameSite: 'strict' as const,
      secure: isProduction,
      path: '/',
      ...(maxAgeMs ? { maxAge: maxAgeMs } : {}),
    };
  }

  private buildRefreshCookieOptions(maxAgeMs?: number) {
    const isProduction = process.env.NODE_ENV === 'production';

    return {
      httpOnly: true,
      sameSite: 'strict' as const,
      secure: isProduction,
      path: '/auth/refresh',
      ...(maxAgeMs ? { maxAge: maxAgeMs } : {}),
    };
  }

  private extractBearerToken(req: Request) {
    return req.headers.authorization?.replace(/^Bearer\s+/i, '');
  }

  private extractCookieValue(req: Request, cookieName: string) {
    const cookieHeader = req.headers.cookie;

    if (!cookieHeader) {
      return '';
    }

    const target = cookieHeader
      .split(';')
      .map((chunk) => chunk.trim())
      .find((chunk) => chunk.startsWith(`${cookieName}=`));

    if (!target) {
      return '';
    }

    return decodeURIComponent(target.slice(cookieName.length + 1));
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
      this.buildAccessCookieOptions(result.expiresInSeconds * 1000),
    );
    res.cookie(
      REFRESH_TOKEN_COOKIE,
      result.refreshToken,
      this.buildRefreshCookieOptions(result.refreshExpiresInSeconds * 1000),
    );
    res.setHeader('Cache-Control', 'no-store');

    return {
      user: result.user,
    };
  }

  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = this.extractCookieValue(req, REFRESH_TOKEN_COOKIE);
    const result = await this.auth.refresh(refreshToken);

    res.cookie(
      AUTH_TOKEN_COOKIE,
      result.accessToken,
      this.buildAccessCookieOptions(result.expiresInSeconds * 1000),
    );
    res.cookie(
      REFRESH_TOKEN_COOKIE,
      result.refreshToken,
      this.buildRefreshCookieOptions(result.refreshExpiresInSeconds * 1000),
    );
    res.setHeader('Cache-Control', 'no-store');

    return { ok: true };
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
    const cookieToken = this.extractCookieValue(req, AUTH_TOKEN_COOKIE);
    const refreshToken = this.extractCookieValue(req, REFRESH_TOKEN_COOKIE);

    const result = await this.auth.logout(
      dto.token || headerToken || cookieToken || '',
      req.user.userId,
      refreshToken || undefined,
    );

    res.clearCookie(AUTH_TOKEN_COOKIE, this.buildAccessCookieOptions());
    res.clearCookie(REFRESH_TOKEN_COOKIE, this.buildRefreshCookieOptions());
    res.setHeader('Cache-Control', 'no-store');

    return result;
  }
}
