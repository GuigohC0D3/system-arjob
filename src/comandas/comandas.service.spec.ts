import { Test, TestingModule } from '@nestjs/testing';
import { ComandasService } from './comandas.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ComandasService', () => {
  let service: ComandasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComandasService,
        {
          provide: PrismaService,
          useValue: {
            $transaction: jest.fn(),
            cliente: {
              findUnique: jest.fn(),
            },
            mesa: {
              findMany: jest.fn(),
            },
            produto: {
              findUnique: jest.fn(),
            },
            comanda: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ComandasService>(ComandasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
