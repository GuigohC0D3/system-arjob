import { Test, TestingModule } from '@nestjs/testing';
import { CategoriasProdutosController } from './categorias-produtos.controller';
import { CategoriasProdutosService } from './categorias-produtos.service';

describe('CategoriasProdutosController', () => {
  let controller: CategoriasProdutosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriasProdutosController],
      providers: [
        {
          provide: CategoriasProdutosService,
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

    controller = module.get<CategoriasProdutosController>(
      CategoriasProdutosController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
