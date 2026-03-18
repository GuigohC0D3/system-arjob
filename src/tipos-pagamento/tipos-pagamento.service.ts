import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateTipoPagamentoDto,
  UpdateTipoPagamentoDto,
} from './tipos-pagamento.dto';

@Injectable()
export class TiposPagamentoService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTipoPagamentoDto) {
    await this.ensureUniqueName(dto.nome);

    return this.prisma.tipoPagamento.create({
      data: { nome: dto.nome },
    });
  }

  findAll() {
    return this.prisma.tipoPagamento.findMany({
      orderBy: { id: 'asc' },
    });
  }

  async findOne(id: number) {
    const item = await this.prisma.tipoPagamento.findUnique({
      where: { id },
    });

    if (!item) {
      throw new NotFoundException('Tipo de pagamento nao encontrado.');
    }

    return item;
  }

  async update(id: number, dto: UpdateTipoPagamentoDto) {
    await this.findOne(id);
    await this.ensureUniqueName(dto.nome, id);

    return this.prisma.tipoPagamento.update({
      where: { id },
      data: { nome: dto.nome },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.tipoPagamento.delete({
      where: { id },
    });
  }

  private async ensureUniqueName(nome: string, ignoreId?: number) {
    const existing = await this.prisma.tipoPagamento.findFirst({
      where: {
        nome: { equals: nome, mode: 'insensitive' },
        ...(ignoreId ? { NOT: { id: ignoreId } } : {}),
      },
      select: { id: true },
    });

    if (existing) {
      throw new ForbiddenException(
        'Já existe um tipo de pagamento com esse nome.',
      );
    }
  }
}
