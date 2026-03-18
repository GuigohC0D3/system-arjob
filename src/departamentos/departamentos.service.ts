import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateDepartamentoDto,
  UpdateDepartamentoDto,
  VincularClientesDepartamentoDto,
} from './departamentos.dto';

@Injectable()
export class DepartamentosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDepartamentoDto) {
    await this.ensureUniqueName(dto.nome);

    return this.prisma.departamento.create({
      data: { nome: dto.nome },
    });
  }

  findAll() {
    return this.prisma.departamento.findMany({
      include: {
        clientesDepartamento: {
          include: {
            cliente: true,
          },
        },
      },
      orderBy: { id: 'asc' },
    });
  }

  async findOne(id: number) {
    const departamento = await this.prisma.departamento.findUnique({
      where: { id },
      include: {
        clientesDepartamento: {
          include: {
            cliente: true,
          },
        },
      },
    });

    if (!departamento) {
      throw new NotFoundException('Departamento não encontrado.');
    }

    return departamento;
  }

  async update(id: number, dto: UpdateDepartamentoDto) {
    await this.findOne(id);
    await this.ensureUniqueName(dto.nome, id);

    return this.prisma.departamento.update({
      where: { id },
      data: { nome: dto.nome },
    });
  }

  async vincularClientes(id: number, dto: VincularClientesDepartamentoDto) {
    await this.findOne(id);
    await this.validateClientes(dto.clienteIds);

    await this.prisma.departamentoCliente.deleteMany({
      where: { departamentoId: id },
    });

    if (dto.clienteIds.length > 0) {
      await this.prisma.departamentoCliente.createMany({
        data: dto.clienteIds.map((clienteId) => ({
          departamentoId: id,
          clienteId,
        })),
      });
    }

    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);

    const vinculados = await this.prisma.departamentoCliente.count({
      where: { departamentoId: id },
    });

    if (vinculados > 0) {
      throw new ForbiddenException(
        'Não é possível remover o departamento, pois há clientes vinculados.',
      );
    }

    return this.prisma.departamento.delete({
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
    const existing = await this.prisma.departamento.findFirst({
      where: {
        nome: { equals: nome, mode: 'insensitive' },
        ...(ignoreId ? { NOT: { id: ignoreId } } : {}),
      },
      select: { id: true },
    });

    if (existing) {
      throw new ForbiddenException('Já existe um departamento com esse nome.');
    }
  }
}
