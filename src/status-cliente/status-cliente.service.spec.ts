import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { StatusClienteService } from './status-cliente.service';

describe('StatusClienteService', () => {
  let service: StatusClienteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatusClienteService,
        {
          provide: PrismaService,
          useValue: {
            statusCliente: {
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

    service = module.get<StatusClienteService>(StatusClienteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
