import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStatusDto, UpdateStatusDto } from './status.dto';

@Injectable()
export class StatusService {
  constructor(private prisma: PrismaService) {}

  list() {
    return this.prisma.status.findMany({
      orderBy: { id: 'asc' },
    });
  }

  async get(id: number) {
    const status = await this.prisma.status.findUnique({ where: { id } });
    if (!status) throw new NotFoundException('Status não encontrado.');
    return status;
  }

  async create(dto: CreateStatusDto) {
    // opcional: evitar duplicado por nome (depende se você quer permitir)
    const exists = await this.prisma.status.findFirst({
      where: { nome: { equals: dto.nome, mode: 'insensitive' } },
      select: { id: true },
    });
    if (exists)
      throw new BadRequestException('Já existe um status com esse nome.');

    return this.prisma.status.create({ data: { nome: dto.nome } });
  }

  async update(id: number, dto: UpdateStatusDto) {
    await this.get(id);
    return this.prisma.status.update({
      where: { id },
      data: { nome: dto.nome },
    });
  }

  async remove(id: number) {
    await this.get(id);

    const inUse = await this.prisma.usuario.count({ where: { statusId: id } });
    if (inUse > 0)
      throw new BadRequestException(
        'Não é possível remover: status em uso por usuários.',
      );

    const inUseByClientes = await this.prisma.cliente.count({
      where: { statusId: id },
    });
    if (inUseByClientes > 0)
      throw new BadRequestException(
        'Não é possível remover: status em uso por clientes.',
      );

    return this.prisma.status.delete({ where: { id } });
  }
}
