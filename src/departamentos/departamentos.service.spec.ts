import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { DepartamentosService } from './departamentos.service';

describe('DepartamentosService', () => {
  let service: DepartamentosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DepartamentosService,
        {
          provide: PrismaService,
          useValue: {
            departamento: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            departamentoCliente: {
              count: jest.fn(),
              deleteMany: jest.fn(),
              createMany: jest.fn(),
            },
            cliente: {
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<DepartamentosService>(DepartamentosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
