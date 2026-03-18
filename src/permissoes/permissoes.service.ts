import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePermissoesDto } from './create-permissoes.dto';
import { UpdatePermissaoDto } from './update-permissao.dto';

@Injectable()
export class PermissoesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePermissoesDto) {
    const permissaoExists = await this.prisma.permissao.findFirst({
      where: { nome: dto.nome },
    });

    if (permissaoExists) {
      throw new ForbiddenException('Já existe uma permissão com esse nome.');
    }

    return this.prisma.permissao.create({
      data: {
        nome: dto.nome,
      },
    });
  }

  async findAll() {
    return this.prisma.permissao.findMany({
      orderBy: {
        id: 'asc',
      },
    });
  }

  async findOne(id: number) {
    const permissao = await this.prisma.permissao.findUnique({
      where: { id },
      include: {
        cargosPermissao: {
          include: {
            cargo: true,
          },
        },
        usuariosPermissao: {
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
      },
    });

    if (!permissao) {
      throw new NotFoundException('Permissão não encontrada.');
    }

    return permissao;
  }

  async update(id: number, dto: UpdatePermissaoDto) {
    await this.findOne(id);

    if (dto.nome) {
      const permissaoExists = await this.prisma.permissao.findFirst({
        where: {
          nome: dto.nome,
          NOT: { id },
        },
      });

      if (permissaoExists) {
        throw new ForbiddenException('Já existe uma permissão com esse nome.');
      }
    }

    return this.prisma.permissao.update({
      where: { id },
      data: {
        nome: dto.nome,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    const emCargo = await this.prisma.cargoPermissao.count({
      where: { permissaoId: id },
    });

    if (emCargo > 0) {
      throw new ForbiddenException(
        'Não é possível remover esta permissão, pois há cargos vinculados a ela.',
      );
    }

    const emUsuario = await this.prisma.permissaoUsuario.count({
      where: { permissaoId: id },
    });

    if (emUsuario > 0) {
      throw new ForbiddenException(
        'Não é possível remover esta permissão, pois há usuários vinculados a ela.',
      );
    }

    return this.prisma.permissao.delete({
      where: { id },
    });
  }
}
