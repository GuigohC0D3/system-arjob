import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import {
  getAdminCargoNames,
  normalizeAuthorizationValue,
} from './authorization.utils';
import { PERMISSIONS_KEY } from './permissions.decorator';

type AuthenticatedRequest = Request & {
  user?: {
    userId: number;
    cargos?: string[];
  };
};

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions =
      this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];

    if (!requiredPermissions.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const userId = request.user?.userId;

    if (!userId) {
      throw new ForbiddenException('Usuário autenticado não encontrado.');
    }

    const adminCargos = getAdminCargoNames(
      this.config.get<string>('ADMIN_CARGOS'),
    );
    const requestCargos = (request.user?.cargos ?? []).map((cargo) =>
      normalizeAuthorizationValue(cargo),
    );

    if (requestCargos.some((cargo) => adminCargos.includes(cargo))) {
      return true;
    }

    const user = await this.prisma.usuario.findUnique({
      where: { id: userId },
      include: {
        cargosUsuario: {
          include: {
            cargo: {
              include: {
                permissoesCargo: {
                  include: {
                    permissao: true,
                  },
                },
              },
            },
          },
        },
        permissoesUsuario: {
          include: {
            permissao: true,
          },
        },
      },
    });

    if (!user) {
      throw new ForbiddenException('Usuário autenticado não encontrado.');
    }

    const normalizedRequiredPermissions = requiredPermissions.map((permission) =>
      normalizeAuthorizationValue(permission),
    );

    const normalizedUserPermissions = new Set(
      [
        ...user.permissoesUsuario.map((item) => item.permissao.nome),
        ...user.cargosUsuario.flatMap((item) =>
          item.cargo.permissoesCargo.map((cargoPermissao) =>
            cargoPermissao.permissao.nome,
          ),
        ),
      ].map((permission) => normalizeAuthorizationValue(permission)),
    );

    const hasPermission = normalizedRequiredPermissions.some((permission) =>
      normalizedUserPermissions.has(permission),
    );

    if (!hasPermission) {
      throw new ForbiddenException('Você não possui permissão para este recurso.');
    }

    return true;
  }
}
