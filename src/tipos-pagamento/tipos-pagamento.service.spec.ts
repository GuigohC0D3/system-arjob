import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { TiposPagamentoService } from './tipos-pagamento.service';

describe('TiposPagamentoService', () => {
  let service: TiposPagamentoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TiposPagamentoService,
        {
          provide: PrismaService,
          useValue: {
            tipoPagamento: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<TiposPagamentoService>(TiposPagamentoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
