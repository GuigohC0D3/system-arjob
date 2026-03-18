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
import {
  CreateTipoPagamentoDto,
  UpdateTipoPagamentoDto,
} from './tipos-pagamento.dto';
import { TiposPagamentoService } from './tipos-pagamento.service';

@UseGuards(JwtAuthGuard)
@Controller('tipos-pagamento')
export class TiposPagamentoController {
  constructor(private readonly tiposPagamentoService: TiposPagamentoService) {}

  @Post()
  create(@Body() dto: CreateTipoPagamentoDto) {
    return this.tiposPagamentoService.create(dto);
  }

  @Get()
  findAll() {
    return this.tiposPagamentoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tiposPagamentoService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTipoPagamentoDto,
  ) {
    return this.tiposPagamentoService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tiposPagamentoService.remove(id);
  }
}
