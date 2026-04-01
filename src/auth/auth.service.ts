import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto } from './auth.dto';
import { AUTH_TOKEN_COOKIE } from './auth.constants';

const normalizeCpf = (v: string) => v.replace(/\D/g, '');
const formatCpf = (v: string) => {
  const digits = normalizeCpf(v).slice(0, 11);

  return digits
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1-$2');
};
const AUTH_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_LIMIT = 10;
const REGISTER_LIMIT = 5;
const BCRYPT_HASH_REGEX = /^\$2[aby]\$\d{2}\$/;

@Injectable()
export class AuthService {
  private readonly authAttempts = new Map<string, number[]>();

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async register(dto: RegisterDto, ipAddress?: string) {
    this.enforceRateLimit(`register:${ipAddress ?? 'unknown'}`, REGISTER_LIMIT);

    const cpf = normalizeCpf(dto.cpf);
    const email = dto.email.trim().toLowerCase();
    const cargoIds = Array.from(new Set(dto.cargoIds));

    const cpfVariants = [cpf, formatCpf(cpf)];

    const cpfExists = await this.prisma.usuario.findFirst({
      where: {
        cpf: {
          in: cpfVariants,
        },
      },
    });
    if (cpfExists) {
      throw new ForbiddenException('CPF já cadastrado.');
    }

    const emailExists = await this.prisma.usuario.findUnique({
      where: { email },
    });
    if (emailExists) {
      throw new ForbiddenException('Email já cadastrado.');
    }

    if (dto.statusId !== undefined) {
      const statusExists = await this.prisma.status.findUnique({
        where: { id: dto.statusId },
        select: { id: true },
      });

      if (!statusExists) {
        throw new NotFoundException('Status não encontrado.');
      }
    }

    const cargos = await this.prisma.cargo.findMany({
      where: {
        id: {
          in: cargoIds,
        },
      },
      select: { id: true },
    });

    if (cargos.length !== cargoIds.length) {
      throw new NotFoundException('Um ou mais cargos não foram encontrados.');
    }

    const senhaHash = await bcrypt.hash(dto.senha, 10);

    const user = await this.prisma.usuario.create({
      data: {
        nome: dto.nome,
        email,
        cpf,
        senha: senhaHash,
        ativo: dto.ativo ?? true,
        statusId: dto.statusId ?? null,
        otpVerificacao: false,
        otpSecret: null,
        cargosUsuario: {
          createMany: {
            data: cargoIds.map((cargoId) => ({
              cargoId,
            })),
          },
        },
      },
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

    return {
      ...this.buildUserPayload(user),
      ativo: user.ativo,
    };
  }

  async login(dto: LoginDto, ipAddress?: string) {
    this.enforceRateLimit(`login:${ipAddress ?? 'unknown'}`, LOGIN_LIMIT);

    const cpf = normalizeCpf(dto.cpf);

    const user = await this.prisma.usuario.findFirst({
      where: {
        cpf: {
          in: [cpf, formatCpf(cpf)],
        },
      },
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
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    if (user.ativo === false) {
      throw new UnauthorizedException('Usuário inativo.');
    }

    const ok = await this.validateAndUpgradePassword(user.id, dto.senha, user.senha);
    if (!ok) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    const userPayload = this.buildUserPayload(user);

    const accessToken = await this.jwt.signAsync({
      sub: user.id,
      statusId: user.statusId ?? null,
      cargos: userPayload.cargos.map((cargo) => cargo.nome),
    });

    const expiresInSeconds = Number(
      this.config.get<string>('JWT_EXPIRES_IN') ?? 604800,
    );

    return {
      accessToken,
      expiresInSeconds,
      user: {
        ...userPayload,
      },
    };
  }

  async me(userId: number) {
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
      throw new NotFoundException('Usuário não encontrado.');
    }

    return {
      ...this.buildUserPayload(user),
      ativo: user.ativo,
    };
  }

  async logout(token: string, userId: number) {
    if (!token) {
      throw new BadRequestException('Token é obrigatório para logout.');
    }

    let decoded: { sub?: number; exp?: number };

    try {
      decoded = await this.jwt.verifyAsync(token, {
        secret: this.config.getOrThrow<string>('JWT_SECRET'),
      });
    } catch {
      throw new BadRequestException('Token inválido.');
    }

    if (!decoded.exp || decoded.sub !== userId) {
      throw new BadRequestException('Token inválido.');
    }

    const expiresAt = new Date(Number(decoded.exp) * 1000);
    const existing = await this.prisma.refreshTokenBlacklist.findFirst({
      where: { token },
      select: { id: true },
    });

    if (!existing) {
      await this.prisma.refreshTokenBlacklist.create({
        data: {
          token,
          expiradoEm: expiresAt,
        },
      });
    }

    return { success: true };
  }

  getAuthCookieName() {
    return AUTH_TOKEN_COOKIE;
  }

  private enforceRateLimit(key: string, limit: number): void {
    const now = Date.now();
    const attempts = (this.authAttempts.get(key) ?? []).filter(
      (timestamp) => now - timestamp < AUTH_WINDOW_MS,
    );

    attempts.push(now);
    this.authAttempts.set(key, attempts);

    if (attempts.length > limit) {
      throw new ForbiddenException(
        'Muitas tentativas recentes. Aguarde alguns minutos e tente novamente.',
      );
    }
  }

  private async validateAndUpgradePassword(
    userId: number,
    plainPassword: string,
    storedPassword: string,
  ): Promise<boolean> {
    if (BCRYPT_HASH_REGEX.test(storedPassword)) {
      return bcrypt.compare(plainPassword, storedPassword);
    }

    if (plainPassword !== storedPassword) {
      return false;
    }

    const senhaHash = await bcrypt.hash(plainPassword, 10);
    await this.prisma.usuario.update({
      where: { id: userId },
      data: { senha: senhaHash },
    });

    return true;
  }

  private buildUserPayload(user: {
    id: number;
    nome: string;
    cpf: string;
    email: string;
    statusId: number | null;
    cargosUsuario: Array<{
      cargo: {
        id: number;
        nome: string;
        permissoesCargo?: Array<{
          permissao: {
            id: number;
            nome: string;
          };
        }>;
      };
    }>;
    permissoesUsuario?: Array<{
      permissao: {
        id: number;
        nome: string;
      };
    }>;
  }) {
    const cargos = user.cargosUsuario.map((item) => ({
      id: item.cargo.id,
      nome: item.cargo.nome,
    }));

    const permissionsMap = new Map<number, { id: number; nome: string }>();

    for (const item of user.permissoesUsuario ?? []) {
      permissionsMap.set(item.permissao.id, item.permissao);
    }

    for (const item of user.cargosUsuario) {
      for (const cargoPermissao of item.cargo.permissoesCargo ?? []) {
        permissionsMap.set(
          cargoPermissao.permissao.id,
          cargoPermissao.permissao,
        );
      }
    }

    return {
      id: user.id,
      nome: user.nome,
      cpf: user.cpf,
      email: user.email,
      statusId: user.statusId,
      cargos,
      permissoes: Array.from(permissionsMap.values()).sort((a, b) =>
        a.nome.localeCompare(b.nome),
      ),
    };
  }
}
