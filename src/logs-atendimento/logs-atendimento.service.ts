import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateLogAtendimentoDto,
  UpdateLogAtendimentoDto,
} from './logs-atendimento.dto';

@Injectable()
export class LogsAtendimentoService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateLogAtendimentoDto) {
    return this.prisma.logAtendimento.create({
      data: {
        descricao: dto.descricao,
      },
    });
  }

  findAll() {
    return this.prisma.logAtendimento.findMany({
      orderBy: { id: 'desc' },
    });
  }

  async findOne(id: number) {
    const item = await this.prisma.logAtendimento.findUnique({
      where: { id },
    });

    if (!item) {
      throw new NotFoundException('Log de atendimento não encontrado.');
    }

    return item;
  }

  async update(id: number, dto: UpdateLogAtendimentoDto) {
    await this.findOne(id);

    return this.prisma.logAtendimento.update({
      where: { id },
      data: {
        descricao: dto.descricao,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.logAtendimento.delete({
      where: { id },
    });
  }
}
