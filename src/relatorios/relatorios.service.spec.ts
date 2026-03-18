import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { RelatoriosService } from './relatorios.service';

describe('RelatoriosService', () => {
  let service: RelatoriosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RelatoriosService,
        {
          provide: PrismaService,
          useValue: {
            relatorio: {
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

    service = module.get<RelatoriosService>(RelatoriosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
