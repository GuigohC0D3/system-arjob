import { Test, TestingModule } from '@nestjs/testing';
import { RelatoriosController } from './relatorios.controller';
import { RelatoriosService } from './relatorios.service';

describe('RelatoriosController', () => {
  let controller: RelatoriosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RelatoriosController],
      providers: [
        {
          provide: RelatoriosService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<RelatoriosController>(RelatoriosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
