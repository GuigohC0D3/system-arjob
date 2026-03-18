import { Test, TestingModule } from '@nestjs/testing';
import { ConveniosController } from './convenios.controller';
import { ConveniosService } from './convenios.service';

describe('ConveniosController', () => {
  let controller: ConveniosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConveniosController],
      providers: [
        {
          provide: ConveniosService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            vincularClientes: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ConveniosController>(ConveniosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
