import { Test, TestingModule } from '@nestjs/testing';
import { StatusClienteController } from './status-cliente.controller';
import { StatusClienteService } from './status-cliente.service';

describe('StatusClienteController', () => {
  let controller: StatusClienteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatusClienteController],
      providers: [
        {
          provide: StatusClienteService,
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

    controller = module.get<StatusClienteController>(StatusClienteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
