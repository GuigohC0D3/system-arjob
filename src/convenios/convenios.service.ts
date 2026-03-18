import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateConvenioDto,
  UpdateConvenioDto,
  VincularClientesConvenioDto,
} from './convenios.dto';

@Injectable()
export class ConveniosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateConvenioDto) {
    await this.ensureUniqueName(dto.nome);

    return this.prisma.convenio.create({
      data: { nome: dto.nome },
    });
  }

  findAll() {
    return this.prisma.convenio.findMany({
      include: {
        clientesConvenio: {
          include: {
            cliente: true,
          },
        },
      },
      orderBy: { id: 'asc' },
    });
  }

  async findOne(id: number) {
    const convenio = await this.prisma.convenio.findUnique({
      where: { id },
      include: {
        clientesConvenio: {
          include: {
            cliente: true,
          },
        },
      },
    });

    if (!convenio) {
      throw new NotFoundException('Convenio não encontrado.');
    }

    return convenio;
  }

  async update(id: number, dto: UpdateConvenioDto) {
    await this.findOne(id);
    await this.ensureUniqueName(dto.nome, id);

    return this.prisma.convenio.update({
      where: { id },
      data: { nome: dto.nome },
    });
  }

  async vincularClientes(id: number, dto: VincularClientesConvenioDto) {
    await this.findOne(id);
    await this.validateClientes(dto.clienteIds);

    await this.prisma.convenioCliente.deleteMany({
      where: { convenioId: id },
    });

    if (dto.clienteIds.length > 0) {
      await this.prisma.convenioCliente.createMany({
        data: dto.clienteIds.map((clienteId) => ({
          convenioId: id,
          clienteId,
        })),
      });
    }

    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);

    const vinculados = await this.prisma.convenioCliente.count({
      where: { convenioId: id },
    });

    if (vinculados > 0) {
      throw new ForbiddenException(
        'Não é possível remover o convenio, pois há clientes vinculados.',
      );
    }

    return this.prisma.convenio.delete({
      where: { id },
    });
  }

  private async validateClientes(clienteIds: number[]) {
    if (clienteIds.length === 0) {
      return;
    }

    const clientes = await this.prisma.cliente.findMany({
      where: { id: { in: clienteIds } },
      select: { id: true },
    });

    if (clientes.length !== clienteIds.length) {
      throw new NotFoundException('Um ou mais clientes não foram encontrados.');
    }
  }

  private async ensureUniqueName(nome: string, ignoreId?: number) {
    const existing = await this.prisma.convenio.findFirst({
      where: {
        nome: { equals: nome, mode: 'insensitive' },
        ...(ignoreId ? { NOT: { id: ignoreId } } : {}),
      },
      select: { id: true },
    });

    if (existing) {
      throw new ForbiddenException('Já existe um convenio com esse nome.');
    }
  }
}
