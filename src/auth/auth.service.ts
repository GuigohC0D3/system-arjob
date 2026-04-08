import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto } from './auth.dto';

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
const REFRESH_TOKEN_EXPIRES_MS = 7 * 24 * 60 * 60 * 1000; // 7 dias

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async register(dto: RegisterDto, ipAddress?: string) {
    await this.enforceRateLimit(`register:${ipAddress ?? 'unknown'}`, REGISTER_LIMIT);

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
    await this.enforceRateLimit(`login:${ipAddress ?? 'unknown'}`, LOGIN_LIMIT);

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

    const expiresInSeconds = Number(
      this.config.get<string>('JWT_EXPIRES_IN') ?? 3600,
    );

    const accessToken = await this.jwt.signAsync({
      sub: user.id,
      statusId: user.statusId ?? null,
      cargos: userPayload.cargos.map((cargo) => cargo.nome),
    });

    const { rawToken: refreshToken } = await this.issueRefreshToken(user.id);

    return {
      accessToken,
      expiresInSeconds,
      refreshToken,
      refreshExpiresInSeconds: REFRESH_TOKEN_EXPIRES_MS / 1000,
      user: userPayload,
    };
  }

  async refresh(refreshTokenRaw: string) {
    if (!refreshTokenRaw) {
      throw new UnauthorizedException('Refresh token não fornecido.');
    }

    const hash = createHash('sha256').update(refreshTokenRaw).digest('hex');

    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: hash },
      include: {
        usuario: {
          include: {
            cargosUsuario: {
              include: {
                cargo: {
                  include: {
                    permissoesCargo: {
                      include: { permissao: true },
                    },
                  },
                },
              },
            },
            permissoesUsuario: {
              include: { permissao: true },
            },
          },
        },
      },
    });

    if (!stored || stored.revogado || stored.expiradoEm < new Date()) {
      throw new UnauthorizedException('Refresh token inválido ou expirado.');
    }

    if (stored.usuario.ativo === false) {
      throw new UnauthorizedException('Usuário inativo.');
    }

    // Rotação: revoga token antigo, emite novo
    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revogado: true },
    });

    const { rawToken: newRefreshToken } = await this.issueRefreshToken(stored.usuarioId);

    const expiresInSeconds = Number(
      this.config.get<string>('JWT_EXPIRES_IN') ?? 3600,
    );
    const userPayload = this.buildUserPayload(stored.usuario);

    const accessToken = await this.jwt.signAsync({
      sub: stored.usuario.id,
      statusId: stored.usuario.statusId ?? null,
      cargos: userPayload.cargos.map((c) => c.nome),
    });

    return {
      accessToken,
      expiresInSeconds,
      refreshToken: newRefreshToken,
      refreshExpiresInSeconds: REFRESH_TOKEN_EXPIRES_MS / 1000,
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

  async logout(token: string, userId: number, refreshTokenRaw?: string) {
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

    try {
      await this.prisma.refreshTokenBlacklist.create({
        data: {
          token,
          expiradoEm: expiresAt,
        },
      });
    } catch (err: unknown) {
      // P2002 = unique constraint violation: token já está na blacklist
      if ((err as { code?: string }).code !== 'P2002') {
        throw err;
      }
    }

    if (refreshTokenRaw) {
      const hash = createHash('sha256').update(refreshTokenRaw).digest('hex');
      await this.prisma.refreshToken.updateMany({
        where: { tokenHash: hash, usuarioId: userId, revogado: false },
        data: { revogado: true },
      });
    }

    return { success: true };
  }

  getAuthCookieName() {
    return 'arjob_token';
  }

  private async issueRefreshToken(usuarioId: number) {
    const rawToken = randomBytes(48).toString('base64url');
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_MS);

    await this.prisma.refreshToken.create({
      data: {
        tokenHash,
        usuarioId,
        expiradoEm: expiresAt,
      },
    });

    return { rawToken, expiresAt };
  }

  private async enforceRateLimit(key: string, limit: number): Promise<void> {
    const now = new Date();
    const windowStart = new Date(now.getTime() - AUTH_WINDOW_MS);

    const entry = await this.prisma.rateLimitEntry.findUnique({
      where: { chave: key },
    });

    if (!entry || entry.janelaDe < windowStart) {
      await this.prisma.rateLimitEntry.upsert({
        where: { chave: key },
        update: { tentativas: 1, janelaDe: now },
        create: { chave: key, tentativas: 1, janelaDe: now },
      });
      return;
    }

    const newCount = entry.tentativas + 1;
    await this.prisma.rateLimitEntry.update({
      where: { chave: key },
      data: { tentativas: newCount },
    });

    if (newCount > limit) {
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
