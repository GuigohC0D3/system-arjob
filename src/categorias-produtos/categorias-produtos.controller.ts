import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CategoriasProdutosService } from './categorias-produtos.service';
import {
  CreateCategoriaProdutoDto,
  UpdateCategoriaProdutoDto,
} from './categorias-produtos.dto';

@UseGuards(JwtAuthGuard)
@Controller('categorias-produtos')
export class CategoriasProdutosController {
  constructor(
    private readonly categoriasProdutosService: CategoriasProdutosService,
  ) {}

  @Post()
  create(@Body() dto: CreateCategoriaProdutoDto) {
    return this.categoriasProdutosService.create(dto);
  }

  @Get()
  findAll() {
    return this.categoriasProdutosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoriasProdutosService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoriaProdutoDto,
  ) {
    return this.categoriasProdutosService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.categoriasProdutosService.remove(id);
  }
}
