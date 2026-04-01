import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import {
  getAdminCargoNames,
  normalizeAuthorizationValue,
} from './authorization.utils';

type AuthenticatedRequest = Request & {
  user?: {
    cargos?: string[];
  };
};

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const cargos = request.user?.cargos ?? [];
    const allowedCargos = getAdminCargoNames(
      this.config.get<string>('ADMIN_CARGOS'),
    );

    const isAdmin = cargos.some((cargo) =>
      allowedCargos.includes(normalizeAuthorizationValue(cargo)),
    );

    if (!isAdmin) {
      throw new ForbiddenException('Acesso restrito a administradores.');
    }

    return true;
  }
}
