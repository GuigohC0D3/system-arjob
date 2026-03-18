import { Test, TestingModule } from '@nestjs/testing';
import { TiposPagamentoController } from './tipos-pagamento.controller';
import { TiposPagamentoService } from './tipos-pagamento.service';

describe('TiposPagamentoController', () => {
  let controller: TiposPagamentoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TiposPagamentoController],
      providers: [
        {
          provide: TiposPagamentoService,
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

    controller = module.get<TiposPagamentoController>(TiposPagamentoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
