import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { ConveniosService } from './convenios.service';

describe('ConveniosService', () => {
  let service: ConveniosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConveniosService,
        {
          provide: PrismaService,
          useValue: {
            convenio: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            convenioCliente: {
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

    service = module.get<ConveniosService>(ConveniosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
