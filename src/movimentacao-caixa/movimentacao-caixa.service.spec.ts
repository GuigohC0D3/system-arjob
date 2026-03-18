import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { MovimentacaoCaixaService } from './movimentacao-caixa.service';

describe('MovimentacaoCaixaService', () => {
  let service: MovimentacaoCaixaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MovimentacaoCaixaService,
        {
          provide: PrismaService,
          useValue: {
            movimentacaoCaixa: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<MovimentacaoCaixaService>(MovimentacaoCaixaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
