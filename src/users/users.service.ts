import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserStatusDto } from './users.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  private readonly safeUserSelect = {
    id: true,
    nome: true,
    email: true,
    cpf: true,
    ativo: true,
    statusId: true,
    status: true,
    cargosUsuario: {
      include: {
        cargo: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    },
  } as const;

  async getUser(id: number) {
    const user = await this.prisma.usuario.findUnique({
      where: { id },
      select: this.safeUserSelect,
    });
    if (!user) throw new NotFoundException('Usuário não encontrado.');
    return {
      id: user.id,
      nome: user.nome,
      email: user.email,
      cpf: user.cpf,
      ativo: user.ativo,
      statusId: user.statusId,
      status: user.status,
      cargos: user.cargosUsuario.map((item) => item.cargo),
    };
  }

  async changeStatus(userId: number, dto: UpdateUserStatusDto) {
    // garante que o status existe
    const status = await this.prisma.status.findUnique({
      where: {
        id: dto.statusId,
      },
    });
    if (!status) throw new BadRequestException('Status inválido.');

    // garante que o user existe
    await this.getUser(userId);

    return this.prisma.usuario.update({
      where: { id: userId },
      data: { statusId: dto.statusId },
      select: {
        id: true,
        nome: true,
        email: true,
        cpf: true,
        statusId: true,
        status: true,
      },
    });
  }
}
