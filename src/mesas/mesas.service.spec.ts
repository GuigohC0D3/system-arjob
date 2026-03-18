import { Test, TestingModule } from '@nestjs/testing';
import { MesasService } from './mesas.service';
import { PrismaService } from '../prisma/prisma.service';

describe('MesasService', () => {
  let service: MesasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MesasService,
        {
          provide: PrismaService,
          useValue: {
            mesa: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            mesaComanda: {
              count: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<MesasService>(MesasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
