import { Module } from '@nestjs/common';
import { CategoriasProdutosService } from './categorias-produtos.service';
import { CategoriasProdutosController } from './categorias-produtos.controller';

@Module({
  providers: [CategoriasProdutosService],
  controllers: [CategoriasProdutosController],
})
export class CategoriasProdutosModule {}
