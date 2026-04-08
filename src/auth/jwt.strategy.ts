import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { AUTH_TOKEN_COOKIE } from './auth.constants';

type JwtPayload = {
  sub: number;
  cargos: string[];
  statusId: number | null;
};

const extractJwtFromCookie = (req: Request) => {
  const cookieHeader = req.headers.cookie;

  if (!cookieHeader) {
    return null;
  }

  const target = cookieHeader
    .split(';')
    .map((chunk) => chunk.trim())
    .find((chunk) => chunk.startsWith(`${AUTH_TOKEN_COOKIE}=`));

  if (!target) {
    return null;
  }

  return decodeURIComponent(target.slice(AUTH_TOKEN_COOKIE.length + 1));
};

const extractJwt = (req: Request) =>
  extractJwtFromCookie(req) ?? ExtractJwt.fromAuthHeaderAsBearerToken()(req);

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      passReqToCallback: true,
      jwtFromRequest: extractJwt,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(req: Request, payload: JwtPayload) {
    const token = extractJwt(req);

    if (!token) {
      throw new UnauthorizedException('Token não informado.');
    }

    const blacklisted = await this.prisma.refreshTokenBlacklist.findUnique({
      where: { token },
      select: { id: true },
    });

    if (blacklisted) {
      throw new UnauthorizedException('Token invalidado.');
    }

    return {
      userId: payload.sub,
      cargos: payload.cargos,
      statusId: payload.statusId ?? null,
    };
  }
}
