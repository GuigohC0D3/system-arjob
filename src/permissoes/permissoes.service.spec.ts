import { Test, TestingModule } from '@nestjs/testing';
import { PermissoesService } from './permissoes.service';
import { PrismaService } from '../prisma/prisma.service';

describe('PermissoesService', () => {
  let service: PermissoesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissoesService,
        {
          provide: PrismaService,
          useValue: {
            permissao: {
              findFirst: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              create: jest.fn(),
              delete: jest.fn(),
            },
            cargoPermissao: {
              count: jest.fn(),
            },
            permissaoUsuario: {
              count: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<PermissoesService>(PermissoesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
