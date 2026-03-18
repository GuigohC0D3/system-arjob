import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';

type JwtPayload = {
  sub: number;
  cargos: string[];
  statusId: number | null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      passReqToCallback: true,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(req: Request, payload: JwtPayload) {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);

    if (!token) {
      throw new UnauthorizedException('Token não informado.');
    }

    const blacklisted = await this.prisma.refreshTokenBlacklist.findFirst({
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
