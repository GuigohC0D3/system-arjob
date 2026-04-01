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
import { Permissions } from '../auth/permissions.decorator';
import { PermissionsGuard } from '../auth/permissions.guard';
import {
  CreateMovimentacaoCaixaDto,
  UpdateMovimentacaoCaixaDto,
} from './movimentacao-caixa.dto';
import { MovimentacaoCaixaService } from './movimentacao-caixa.service';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Permissions('movimentacao-caixa', 'movimentacao caixa')
@Controller('movimentacao-caixa')
export class MovimentacaoCaixaController {
  constructor(
    private readonly movimentacaoCaixaService: MovimentacaoCaixaService,
  ) {}

  @Post()
  create(@Body() dto: CreateMovimentacaoCaixaDto) {
    return this.movimentacaoCaixaService.create(dto);
  }

  @Get()
  findAll() {
    return this.movimentacaoCaixaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.movimentacaoCaixaService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMovimentacaoCaixaDto,
  ) {
    return this.movimentacaoCaixaService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.movimentacaoCaixaService.remove(id);
  }
}
