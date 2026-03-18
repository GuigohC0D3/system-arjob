import { Test, TestingModule } from '@nestjs/testing';
import { CargosService } from './cargos.service';
import { PrismaService } from '../prisma/prisma.service';

describe('CargosService', () => {
  let service: CargosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CargosService,
        {
          provide: PrismaService,
          useValue: {
            cargo: {
              findFirst: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              create: jest.fn(),
              delete: jest.fn(),
            },
            cargoUsuario: {
              count: jest.fn(),
            },
            cargoPermissao: {
              count: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<CargosService>(CargosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
