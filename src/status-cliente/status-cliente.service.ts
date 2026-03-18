import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateStatusClienteDto,
  UpdateStatusClienteDto,
} from './status-cliente.dto';

@Injectable()
export class StatusClienteService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateStatusClienteDto) {
    await this.ensureUniqueName(dto.nome);

    return this.prisma.statusCliente.create({
      data: { nome: dto.nome },
    });
  }

  findAll() {
    return this.prisma.statusCliente.findMany({
      orderBy: { id: 'asc' },
    });
  }

  async findOne(id: number) {
    const item = await this.prisma.statusCliente.findUnique({
      where: { id },
    });

    if (!item) {
      throw new NotFoundException('Status de cliente nao encontrado.');
    }

    return item;
  }

  async update(id: number, dto: UpdateStatusClienteDto) {
    await this.findOne(id);
    await this.ensureUniqueName(dto.nome, id);

    return this.prisma.statusCliente.update({
      where: { id },
      data: { nome: dto.nome },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.statusCliente.delete({
      where: { id },
    });
  }

  private async ensureUniqueName(nome: string, ignoreId?: number) {
    const existing = await this.prisma.statusCliente.findFirst({
      where: {
        nome: { equals: nome, mode: 'insensitive' },
        ...(ignoreId ? { NOT: { id: ignoreId } } : {}),
      },
      select: { id: true },
    });

    if (existing) {
      throw new ForbiddenException(
        'Já existe um status de cliente com esse nome.',
      );
    }
  }
}
