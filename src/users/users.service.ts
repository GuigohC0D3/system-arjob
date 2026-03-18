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

  async getUser(id: number) {
    const user = await this.prisma.usuario.findUnique({
      where: { id },
      include: { status: true },
    });
    if (!user) throw new NotFoundException('Usuário não encontrado.');
    return user;
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
