import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

type AuthenticatedRequest = Request & {
  user?: {
    cargos?: string[];
  };
};

const normalizeCargo = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const cargos = request.user?.cargos ?? [];
    const allowedCargos = (this.config.get<string>('ADMIN_CARGOS') ??
      'admin,administrador')
      .split(',')
      .map((cargo) => normalizeCargo(cargo))
      .filter(Boolean);

    const isAdmin = cargos.some((cargo) =>
      allowedCargos.includes(normalizeCargo(cargo)),
    );

    if (!isAdmin) {
      throw new ForbiddenException('Acesso restrito a administradores.');
    }

    return true;
  }
}
