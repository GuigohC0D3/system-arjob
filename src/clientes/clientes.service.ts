import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClienteDto } from './create-clientes.dto';
import { UpdateClienteDto } from './update-clientes.dto';

const normalizeCpf = (v?: string) => (v ? v.replace(/\D/g, '') : undefined);

@Injectable()
export class ClientesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateClienteDto) {
    const cpf = normalizeCpf(dto.cpf);

    if (cpf) {
      const cpfExists = await this.prisma.cliente.findUnique({
        where: { cpf },
      });

      if (cpfExists) {
        throw new ForbiddenException('CPF já cadastrado para outro cliente.');
      }
    }

    if (dto.statusId !== undefined) {
      const statusExists = await this.prisma.status.findUnique({
        where: { id: dto.statusId },
      });

      if (!statusExists) {
        throw new NotFoundException('Status não encontrado.');
      }
    }

    return this.prisma.cliente.create({
      data: {
        nome: dto.nome,
        cpf: cpf ?? null,
        email: dto.email ?? null,
        telefone: dto.phone ?? null,
        statusId: dto.statusId ?? null,
      },
      include: {
        status: true,
      },
    });
  }

  async findAll() {
    return this.prisma.cliente.findMany({
      include: {
        status: true,
      },
      orderBy: {
        id: 'asc',
      },
    });
  }

  async findOne(id: number) {
    const cliente = await this.prisma.cliente.findUnique({
      where: { id },
      include: {
        status: true,
        comandas: true,
        conveniosCliente: {
          include: {
            convenio: true,
          },
        },
        departamentosCliente: {
          include: {
            departamento: true,
          },
        },
      },
    });

    if (!cliente) {
      throw new NotFoundException('Cliente não encontrado.');
    }

    return cliente;
  }

  async update(id: number, dto: UpdateClienteDto) {
    await this.findOne(id);

    const cpf = normalizeCpf(dto.cpf);

    if (cpf) {
      const cpfExists = await this.prisma.cliente.findFirst({
        where: {
          cpf,
          NOT: { id },
        },
      });

      if (cpfExists) {
        throw new ForbiddenException('CPF já cadastrado para outro cliente.');
      }
    }

    if (dto.statusId !== undefined) {
      const statusExists = await this.prisma.status.findUnique({
        where: { id: dto.statusId },
      });

      if (!statusExists) {
        throw new NotFoundException('Status não encontrado.');
      }
    }

    return this.prisma.cliente.update({
      where: { id },
      data: {
        nome: dto.nome,
        cpf,
        email: dto.email,
        telefone: dto.phone,
        statusId: dto.statusId,
      },
      include: {
        status: true,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    const hasComandas = await this.prisma.comanda.count({
      where: { clienteId: id },
    });

    if (hasComandas > 0) {
      throw new ForbiddenException(
        'Não é possível remover este cliente, pois há comandas vinculadas a ele.',
      );
    }

    const hasConvenios = await this.prisma.convenioCliente.count({
      where: { clienteId: id },
    });

    if (hasConvenios > 0) {
      throw new ForbiddenException(
        'Não é possível remover este cliente, pois há convênios vinculados a ele.',
      );
    }

    const hasDepartamentos = await this.prisma.departamentoCliente.count({
      where: { clienteId: id },
    });

    if (hasDepartamentos > 0) {
      throw new ForbiddenException(
        'Não é possível remover este cliente, pois há departamentos vinculados a ele.',
      );
    }

    return this.prisma.cliente.delete({
      where: { id },
    });
  }
}
