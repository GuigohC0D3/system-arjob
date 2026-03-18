import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRelatorioDto, UpdateRelatorioDto } from './relatorios.dto';

@Injectable()
export class RelatoriosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRelatorioDto) {
    await this.ensureUniqueName(dto.nome);

    return this.prisma.relatorio.create({
      data: {
        nome: dto.nome,
        criadoEm: new Date(),
      },
    });
  }

  findAll() {
    return this.prisma.relatorio.findMany({
      orderBy: { id: 'desc' },
    });
  }

  async findOne(id: number) {
    const item = await this.prisma.relatorio.findUnique({
      where: { id },
    });

    if (!item) {
      throw new NotFoundException('Relatorio nao encontrado.');
    }

    return item;
  }

  async update(id: number, dto: UpdateRelatorioDto) {
    await this.findOne(id);
    await this.ensureUniqueName(dto.nome, id);

    return this.prisma.relatorio.update({
      where: { id },
      data: { nome: dto.nome },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.relatorio.delete({
      where: { id },
    });
  }

  private async ensureUniqueName(nome: string, ignoreId?: number) {
    const existing = await this.prisma.relatorio.findFirst({
      where: {
        nome: { equals: nome, mode: 'insensitive' },
        ...(ignoreId ? { NOT: { id: ignoreId } } : {}),
      },
      select: { id: true },
    });

    if (existing) {
      throw new ForbiddenException('Ja existe um relatorio com esse nome.');
    }
  }
}
