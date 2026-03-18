import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProdutoDto, UpdateProdutoDto } from './produtos.dto';

@Injectable()
export class ProdutosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProdutoDto) {
    if (dto.categoriaId !== undefined) {
      await this.ensureCategoria(dto.categoriaId);
    }

    const produto = await this.prisma.produto.create({
      data: {
        nome: dto.nome,
        preco:
          dto.preco !== undefined ? new Prisma.Decimal(dto.preco) : undefined,
        estoque: dto.estoque,
        categoriaId: dto.categoriaId,
      },
      include: {
        categoria: true,
      },
    });

    if (dto.preco !== undefined) {
      await this.prisma.historicoPreco.create({
        data: {
          produtoId: produto.id,
          precoAnterior: null,
          precoNovo: new Prisma.Decimal(dto.preco),
          criadoEm: new Date(),
        },
      });
    }

    return produto;
  }

  findAll() {
    return this.prisma.produto.findMany({
      include: {
        categoria: true,
      },
      orderBy: { id: 'asc' },
    });
  }

  async findOne(id: number) {
    const produto = await this.prisma.produto.findUnique({
      where: { id },
      include: {
        categoria: true,
        historicoPrecos: {
          orderBy: { id: 'desc' },
        },
      },
    });

    if (!produto) {
      throw new NotFoundException('Produto não encontrado.');
    }

    return produto;
  }

  async update(id: number, dto: UpdateProdutoDto) {
    const produto = await this.findOne(id);

    if (dto.categoriaId !== undefined && dto.categoriaId !== null) {
      await this.ensureCategoria(dto.categoriaId);
    }

    const updated = await this.prisma.produto.update({
      where: { id },
      data: {
        nome: dto.nome,
        preco:
          dto.preco !== undefined ? new Prisma.Decimal(dto.preco) : undefined,
        estoque: dto.estoque,
        categoriaId: dto.categoriaId,
      },
      include: {
        categoria: true,
      },
    });

    if (
      dto.preco !== undefined &&
      produto.preco?.toString() !== new Prisma.Decimal(dto.preco).toString()
    ) {
      await this.prisma.historicoPreco.create({
        data: {
          produtoId: id,
          precoAnterior: produto.preco,
          precoNovo: new Prisma.Decimal(dto.preco),
          criadoEm: new Date(),
        },
      });
    }

    return updated;
  }

  async remove(id: number) {
    await this.findOne(id);

    const itensVinculados =
      await this.prisma.itemComandaProdutoQuantidade.count({
        where: { produtoId: id },
      });

    if (itensVinculados > 0) {
      throw new ForbiddenException(
        'Não é possível remover o produto, pois ele já foi utilizado em comandas.',
      );
    }

    await this.prisma.historicoPreco.deleteMany({
      where: { produtoId: id },
    });

    return this.prisma.produto.delete({
      where: { id },
    });
  }

  private async ensureCategoria(id: number) {
    const categoria = await this.prisma.categoriaProduto.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!categoria) {
      throw new NotFoundException('Categoria de produto não encontrada.');
    }
  }
}
