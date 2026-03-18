import { Test, TestingModule } from '@nestjs/testing';
import { MovimentacaoCaixaController } from './movimentacao-caixa.controller';
import { MovimentacaoCaixaService } from './movimentacao-caixa.service';

describe('MovimentacaoCaixaController', () => {
  let controller: MovimentacaoCaixaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MovimentacaoCaixaController],
      providers: [
        {
          provide: MovimentacaoCaixaService,
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

    controller = module.get<MovimentacaoCaixaController>(
      MovimentacaoCaixaController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
