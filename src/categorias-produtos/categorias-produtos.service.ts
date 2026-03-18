import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateCategoriaProdutoDto,
  UpdateCategoriaProdutoDto,
} from './categorias-produtos.dto';

@Injectable()
export class CategoriasProdutosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCategoriaProdutoDto) {
    await this.ensureUniqueName(dto.nome);

    return this.prisma.categoriaProduto.create({
      data: { nome: dto.nome },
    });
  }

  findAll() {
    return this.prisma.categoriaProduto.findMany({
      include: {
        _count: {
          select: {
            produtos: true,
          },
        },
      },
      orderBy: { id: 'asc' },
    });
  }

  async findOne(id: number) {
    const categoria = await this.prisma.categoriaProduto.findUnique({
      where: { id },
      include: {
        produtos: {
          orderBy: { id: 'asc' },
        },
      },
    });

    if (!categoria) {
      throw new NotFoundException('Categoria de produto não encontrada.');
    }

    return categoria;
  }

  async update(id: number, dto: UpdateCategoriaProdutoDto) {
    await this.findOne(id);
    await this.ensureUniqueName(dto.nome, id);

    return this.prisma.categoriaProduto.update({
      where: { id },
      data: { nome: dto.nome },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    const vinculados = await this.prisma.produto.count({
      where: { categoriaId: id },
    });

    if (vinculados > 0) {
      throw new ForbiddenException(
        'Não é possível remover a categoria, pois há produtos vinculados a ela.',
      );
    }

    return this.prisma.categoriaProduto.delete({
      where: { id },
    });
  }

  private async ensureUniqueName(nome: string, ignoreId?: number) {
    const existing = await this.prisma.categoriaProduto.findFirst({
      where: {
        nome: { equals: nome, mode: 'insensitive' },
        ...(ignoreId ? { NOT: { id: ignoreId } } : {}),
      },
      select: { id: true },
    });

    if (existing) {
      throw new ForbiddenException('Já existe uma categoria com esse nome.');
    }
  }
}
