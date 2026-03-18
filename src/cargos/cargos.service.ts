import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCargoDto } from './create-cargos.dto';
import { UpdateCargoDto } from './update-cargos.dto';

@Injectable()
export class CargosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCargoDto) {
    const cargoExists = await this.prisma.cargo.findFirst({
      where: {
        nome: dto.nome,
      },
    });

    if (cargoExists) {
      throw new ForbiddenException('Já existe um cargo com esse nome.');
    }

    return this.prisma.cargo.create({
      data: {
        nome: dto.nome,
      },
    });
  }

  async findAll() {
    return this.prisma.cargo.findMany({
      orderBy: {
        id: 'asc',
      },
    });
  }

  async findOne(id: number) {
    const cargo = await this.prisma.cargo.findUnique({
      where: { id },
      include: {
        usuariosCargo: {
          include: {
            usuario: {
              select: {
                id: true,
                nome: true,
                email: true,
                cpf: true,
                ativo: true,
                statusId: true,
              },
            },
          },
        },
        permissoesCargo: {
          include: {
            permissao: true,
          },
        },
      },
    });

    if (!cargo) {
      throw new NotFoundException('Cargo não encontrado.');
    }

    return cargo;
  }

  async update(id: number, dto: UpdateCargoDto) {
    await this.findOne(id);

    if (dto.nome) {
      const cargoExists = await this.prisma.cargo.findFirst({
        where: {
          nome: dto.nome,
          NOT: { id },
        },
      });

      if (cargoExists) {
        throw new ForbiddenException('Já existe um cargo com esse nome.');
      }
    }

    return this.prisma.cargo.update({
      where: { id },
      data: {
        nome: dto.nome,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    const vinculoUsuarios = await this.prisma.cargoUsuario.count({
      where: { cargoId: id },
    });

    if (vinculoUsuarios > 0) {
      throw new ForbiddenException(
        'Não é possível remover este cargo, pois há usuários vinculados a ele.',
      );
    }

    const vinculoPermissoes = await this.prisma.cargoPermissao.count({
      where: { cargoId: id },
    });

    if (vinculoPermissoes > 0) {
      throw new ForbiddenException(
        'Não é possível remover este cargo, pois há permissões vinculadas a ele.',
      );
    }

    return this.prisma.cargo.delete({
      where: { id },
    });
  }
}
