import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMesaDto, UpdateMesaDto } from './mesas.dto';

@Injectable()
export class MesasService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMesaDto) {
    await this.ensureNumeroDisponivel(dto.numero);

    return this.prisma.mesa.create({
      data: {
        numero: dto.numero,
      },
    });
  }

  findAll() {
    return this.prisma.mesa.findMany({
      include: {
        mesaComandas: {
          include: {
            comanda: true,
          },
        },
      },
      orderBy: { numero: 'asc' },
    });
  }

  async findOne(id: number) {
    const mesa = await this.prisma.mesa.findUnique({
      where: { id },
      include: {
        mesaComandas: {
          include: {
            comanda: true,
          },
        },
      },
    });

    if (!mesa) {
      throw new NotFoundException('Mesa não encontrada.');
    }

    return mesa;
  }

  async update(id: number, dto: UpdateMesaDto) {
    await this.findOne(id);

    if (dto.numero !== undefined) {
      await this.ensureNumeroDisponivel(dto.numero, id);
    }

    return this.prisma.mesa.update({
      where: { id },
      data: {
        numero: dto.numero,
        ocupada: dto.ocupada,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    const vinculada = await this.prisma.mesaComanda.count({
      where: { mesaId: id },
    });

    if (vinculada > 0) {
      throw new ForbiddenException(
        'Não é possível remover a mesa, pois há comandas vinculadas a ela.',
      );
    }

    return this.prisma.mesa.delete({
      where: { id },
    });
  }

  private async ensureNumeroDisponivel(numero: number, ignoreId?: number) {
    const mesa = await this.prisma.mesa.findFirst({
      where: {
        numero,
        ...(ignoreId ? { NOT: { id: ignoreId } } : {}),
      },
      select: { id: true },
    });

    if (mesa) {
      throw new ForbiddenException('Já existe uma mesa com esse número.');
    }
  }
}
