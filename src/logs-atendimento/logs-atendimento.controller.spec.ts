import { Test, TestingModule } from '@nestjs/testing';
import { LogsAtendimentoController } from './logs-atendimento.controller';
import { LogsAtendimentoService } from './logs-atendimento.service';

describe('LogsAtendimentoController', () => {
  let controller: LogsAtendimentoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LogsAtendimentoController],
      providers: [
        {
          provide: LogsAtendimentoService,
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

    controller = module.get<LogsAtendimentoController>(LogsAtendimentoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
