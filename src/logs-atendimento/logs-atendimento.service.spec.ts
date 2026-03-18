import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { LogsAtendimentoService } from './logs-atendimento.service';

describe('LogsAtendimentoService', () => {
  let service: LogsAtendimentoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LogsAtendimentoService,
        {
          provide: PrismaService,
          useValue: {
            logAtendimento: {
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

    service = module.get<LogsAtendimentoService>(LogsAtendimentoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
