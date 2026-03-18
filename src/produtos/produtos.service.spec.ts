import { Test, TestingModule } from '@nestjs/testing';
import { ProdutosService } from './produtos.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ProdutosService', () => {
  let service: ProdutosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProdutosService,
        {
          provide: PrismaService,
          useValue: {
            produto: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            categoriaProduto: {
              findUnique: jest.fn(),
            },
            historicoPreco: {
              create: jest.fn(),
              deleteMany: jest.fn(),
            },
            itemComandaProdutoQuantidade: {
              count: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ProdutosService>(ProdutosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
