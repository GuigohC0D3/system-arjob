import { Test, TestingModule } from '@nestjs/testing';
import { CategoriasProdutosService } from './categorias-produtos.service';
import { PrismaService } from '../prisma/prisma.service';

describe('CategoriasProdutosService', () => {
  let service: CategoriasProdutosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriasProdutosService,
        {
          provide: PrismaService,
          useValue: {
            categoriaProduto: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            produto: {
              count: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<CategoriasProdutosService>(CategoriasProdutosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
