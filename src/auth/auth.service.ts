import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto } from './auth.dto';

const normalizeCpf = (v: string) => v.replace(/\D/g, '');

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const cpf = normalizeCpf(dto.cpf);
    const email = dto.email.trim().toLowerCase();

    const cpfExists = await this.prisma.usuario.findUnique({
      where: { cpf },
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

    const senhaHash = await bcrypt.hash(dto.senha, 10);

    return this.prisma.usuario.create({
      data: {
        nome: dto.nome,
        email,
        cpf,
        senha: senhaHash,
        ativo: true,
        otpVerificacao: false,
        otpSecret: null,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        cpf: true,
        ativo: true,
        statusId: true,
      },
    });
  }

  async login(dto: LoginDto) {
    const cpf = normalizeCpf(dto.cpf);

    const user = await this.prisma.usuario.findUnique({
      where: { cpf },
      include: {
        cargosUsuario: {
          include: {
            cargo: true,
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

    const ok = await bcrypt.compare(dto.senha, user.senha);
    if (!ok) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    const cargos = user.cargosUsuario.map((item) => ({
      id: item.cargo.id,
      nome: item.cargo.nome,
    }));

    const token = await this.jwt.signAsync({
      sub: user.id,
      statusId: user.statusId ?? null,
      cargos: cargos.map((cargo) => cargo.nome),
    });

    return {
      accessToken: token,
      user: {
        id: user.id,
        nome: user.nome,
        cpf: user.cpf,
        email: user.email,
        statusId: user.statusId,
        cargos,
      },
    };
  }

  async me(userId: number) {
    const user = await this.prisma.usuario.findUnique({
      where: { id: userId },
      include: {
        cargosUsuario: {
          include: {
            cargo: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    return {
      id: user.id,
      nome: user.nome,
      cpf: user.cpf,
      email: user.email,
      ativo: user.ativo,
      statusId: user.statusId,
      cargos: user.cargosUsuario.map((item) => ({
        id: item.cargo.id,
        nome: item.cargo.nome,
      })),
    };
  }

  async logout(token: string) {
    if (!token) {
      throw new BadRequestException('Token é obrigatório para logout.');
    }

    const decoded = this.jwt.decode(token);
    if (!decoded || typeof decoded !== 'object' || !('exp' in decoded)) {
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
}
