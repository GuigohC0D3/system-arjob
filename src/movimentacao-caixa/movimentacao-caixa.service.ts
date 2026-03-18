import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateMovimentacaoCaixaDto,
  UpdateMovimentacaoCaixaDto,
} from './movimentacao-caixa.dto';

@Injectable()
export class MovimentacaoCaixaService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateMovimentacaoCaixaDto) {
    return this.prisma.movimentacaoCaixa.create({
      data: {
        tipo: dto.tipo,
        valor: new Prisma.Decimal(dto.valor),
        descricao: dto.descricao ?? null,
        criadoEm: new Date(),
      },
    });
  }

  findAll() {
    return this.prisma.movimentacaoCaixa.findMany({
      orderBy: { id: 'desc' },
    });
  }

  async findOne(id: number) {
    const item = await this.prisma.movimentacaoCaixa.findUnique({
      where: { id },
    });

    if (!item) {
      throw new NotFoundException('Movimentacao de caixa nao encontrada.');
    }

    return item;
  }

  async update(id: number, dto: UpdateMovimentacaoCaixaDto) {
    await this.findOne(id);

    return this.prisma.movimentacaoCaixa.update({
      where: { id },
      data: {
        tipo: dto.tipo,
        valor: new Prisma.Decimal(dto.valor),
        descricao: dto.descricao ?? null,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.movimentacaoCaixa.delete({
      where: { id },
    });
  }
}
