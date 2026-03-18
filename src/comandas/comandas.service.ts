import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateComandaDto, UpdateComandaDto } from './comandas.dto';

@Injectable()
export class ComandasService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateComandaDto) {
    await this.validateCliente(dto.clienteId);
    await this.validateMesaIds(dto.mesaIds);
    await this.validateItens(dto.itens);

    const code = dto.code?.trim() || `COM-${Date.now()}`;
    await this.ensureCodeDisponivel(code);

    return this.prisma.$transaction(async (tx) => {
      const comanda = await tx.comanda.create({
        data: {
          code,
          clienteId: dto.clienteId ?? null,
          abertaEm: new Date(),
        },
      });

      if (dto.mesaIds?.length) {
        await tx.mesaComanda.createMany({
          data: dto.mesaIds.map((mesaId) => ({
            mesaId,
            comandaId: comanda.id,
          })),
        });

        await tx.mesa.updateMany({
          where: { id: { in: dto.mesaIds } },
          data: { ocupada: true },
        });
      }

      if (dto.itens?.length) {
        for (const item of dto.itens) {
          const itemCriado = await tx.itemComanda.create({
            data: {
              comandaId: comanda.id,
              observacao: item.observacao ?? null,
            },
          });

          for (const produtoItem of item.produtos) {
            const produto = await tx.produto.findUnique({
              where: { id: produtoItem.produtoId },
            });

            if (!produto) {
              throw new NotFoundException('Produto não encontrado.');
            }

            await tx.itemComandaProdutoQuantidade.create({
              data: {
                itemComandaId: itemCriado.id,
                produtoId: produto.id,
                quantidade: produtoItem.quantidade,
                precoUnitario: produto.preco,
              },
            });

            if (produto.estoque !== null) {
              await tx.produto.update({
                where: { id: produto.id },
                data: {
                  estoque: {
                    decrement: produtoItem.quantidade,
                  },
                },
              });
            }
          }
        }
      }

      await tx.historicoComanda.create({
        data: {
          comandaId: comanda.id,
          descricao: 'Comanda criada.',
          criadoEm: new Date(),
        },
      });

      return this.findOneWithClient(tx, comanda.id);
    });
  }

  findAll() {
    return this.prisma.comanda.findMany({
      include: {
        cliente: true,
        mesas: {
          include: {
            mesa: true,
          },
        },
        itens: {
          include: {
            produtosQuantidade: true,
          },
        },
      },
      orderBy: { id: 'asc' },
    });
  }

  async findOne(id: number) {
    return this.findOneWithClient(this.prisma, id);
  }

  async update(id: number, dto: UpdateComandaDto) {
    const comanda = await this.findOne(id);

    if (comanda.fechadaEm && dto.fechar) {
      throw new BadRequestException('Esta comanda já está fechada.');
    }

    if (dto.clienteId !== undefined && dto.clienteId !== null) {
      await this.validateCliente(dto.clienteId);
    }

    if (dto.mesaIds !== undefined) {
      await this.validateMesaIds(dto.mesaIds, id);
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.comanda.update({
        where: { id },
        data: {
          clienteId: dto.clienteId,
          fechadaEm: dto.fechar ? new Date() : undefined,
        },
      });

      if (dto.mesaIds !== undefined) {
        await this.syncMesas(tx, id, dto.mesaIds);
      }

      if (dto.fechar) {
        const mesaIds = dto.mesaIds ?? comanda.mesas.map((item) => item.mesaId);
        if (mesaIds.length > 0) {
          await tx.mesa.updateMany({
            where: { id: { in: mesaIds } },
            data: { ocupada: false },
          });
        }

        await tx.historicoComanda.create({
          data: {
            comandaId: id,
            descricao: 'Comanda fechada.',
            criadoEm: new Date(),
          },
        });
      } else if (dto.clienteId !== undefined || dto.mesaIds !== undefined) {
        await tx.historicoComanda.create({
          data: {
            comandaId: id,
            descricao: 'Comanda atualizada.',
            criadoEm: new Date(),
          },
        });
      }

      return this.findOneWithClient(tx, id);
    });
  }

  async remove(id: number) {
    const comanda = await this.findOne(id);

    return this.prisma.$transaction(async (tx) => {
      const mesaIds = comanda.mesas.map((item) => item.mesaId);

      const itens = await tx.itemComanda.findMany({
        where: { comandaId: id },
        include: {
          produtosQuantidade: true,
        },
      });

      for (const item of itens) {
        for (const produtoQuantidade of item.produtosQuantidade) {
          const produto = await tx.produto.findUnique({
            where: { id: produtoQuantidade.produtoId },
          });

          if (produto?.estoque !== null) {
            await tx.produto.update({
              where: { id: produtoQuantidade.produtoId },
              data: {
                estoque: {
                  increment: produtoQuantidade.quantidade,
                },
              },
            });
          }
        }
      }

      await tx.itemComandaProdutoQuantidade.deleteMany({
        where: {
          itemComanda: {
            comandaId: id,
          },
        },
      });
      await tx.itemComanda.deleteMany({
        where: { comandaId: id },
      });
      await tx.historicoComanda.deleteMany({
        where: { comandaId: id },
      });
      await tx.mesaComanda.deleteMany({
        where: { comandaId: id },
      });

      if (mesaIds.length > 0) {
        await tx.mesa.updateMany({
          where: { id: { in: mesaIds } },
          data: { ocupada: false },
        });
      }

      return tx.comanda.delete({
        where: { id },
      });
    });
  }

  private async findOneWithClient(
    client: PrismaService | Prisma.TransactionClient,
    id: number,
  ) {
    const comanda = await client.comanda.findUnique({
      where: { id },
      include: {
        cliente: true,
        mesas: {
          include: {
            mesa: true,
          },
        },
        itens: {
          include: {
            produtosQuantidade: {
              include: {
                produto: true,
              },
            },
          },
        },
        historicos: {
          orderBy: { id: 'desc' },
        },
      },
    });

    if (!comanda) {
      throw new NotFoundException('Comanda não encontrada.');
    }

    return comanda;
  }

  private async validateCliente(clienteId?: number | null) {
    if (!clienteId) {
      return;
    }

    const cliente = await this.prisma.cliente.findUnique({
      where: { id: clienteId },
      select: { id: true },
    });

    if (!cliente) {
      throw new NotFoundException('Cliente não encontrado.');
    }
  }

  private async validateMesaIds(mesaIds?: number[], comandaId?: number) {
    if (!mesaIds?.length) {
      return;
    }

    const mesas = await this.prisma.mesa.findMany({
      where: { id: { in: mesaIds } },
      select: { id: true },
    });

    if (mesas.length !== mesaIds.length) {
      throw new NotFoundException('Uma ou mais mesas não foram encontradas.');
    }

    const ocupadas = await this.prisma.mesaComanda.findMany({
      where: {
        mesaId: { in: mesaIds },
        ...(comandaId ? { comandaId: { not: comandaId } } : {}),
        comanda: {
          fechadaEm: null,
        },
      },
      select: { mesaId: true },
    });

    if (ocupadas.length > 0) {
      throw new ForbiddenException(
        'Uma ou mais mesas já estão vinculadas a outra comanda em aberto.',
      );
    }
  }

  private async validateItens(itens?: CreateComandaDto['itens']) {
    if (!itens?.length) {
      return;
    }

    for (const item of itens) {
      if (item.produtos.length === 0) {
        throw new BadRequestException(
          'Cada item da comanda precisa ter ao menos um produto.',
        );
      }

      for (const produtoItem of item.produtos) {
        const produto = await this.prisma.produto.findUnique({
          where: { id: produtoItem.produtoId },
        });

        if (!produto) {
          throw new NotFoundException('Produto não encontrado.');
        }

        if (
          produto.estoque !== null &&
          produto.estoque < produtoItem.quantidade
        ) {
          throw new BadRequestException(
            `Estoque insuficiente para o produto ${produto.nome}.`,
          );
        }
      }
    }
  }

  private async ensureCodeDisponivel(code: string) {
    const existing = await this.prisma.comanda.findUnique({
      where: { code },
      select: { id: true },
    });

    if (existing) {
      throw new ForbiddenException('Já existe uma comanda com esse código.');
    }
  }

  private async syncMesas(
    tx: Prisma.TransactionClient,
    comandaId: number,
    mesaIds: number[],
  ) {
    const atuais = await tx.mesaComanda.findMany({
      where: { comandaId },
    });

    const atuaisIds = atuais.map((item) => item.mesaId);
    const removidas = atuaisIds.filter((mesaId) => !mesaIds.includes(mesaId));
    const novas = mesaIds.filter((mesaId) => !atuaisIds.includes(mesaId));

    await tx.mesaComanda.deleteMany({
      where: { comandaId },
    });

    if (mesaIds.length > 0) {
      await tx.mesaComanda.createMany({
        data: mesaIds.map((mesaId) => ({
          mesaId,
          comandaId,
        })),
      });
    }

    if (novas.length > 0) {
      await tx.mesa.updateMany({
        where: { id: { in: novas } },
        data: { ocupada: true },
      });
    }

    for (const mesaId of removidas) {
      const aberta = await tx.mesaComanda.count({
        where: {
          mesaId,
          comanda: {
            fechadaEm: null,
          },
        },
      });

      await tx.mesa.update({
        where: { id: mesaId },
        data: {
          ocupada: aberta > 0,
        },
      });
    }
  }
}
