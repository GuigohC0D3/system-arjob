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
import { AdminGuard } from '../auth/admin.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateRelatorioDto, UpdateRelatorioDto } from './relatorios.dto';
import { RelatoriosService } from './relatorios.service';

@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('relatorios')
export class RelatoriosController {
  constructor(private readonly relatoriosService: RelatoriosService) {}

  @Post()
  create(@Body() dto: CreateRelatorioDto) {
    return this.relatoriosService.create(dto);
  }

  @Get()
  findAll() {
    return this.relatoriosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.relatoriosService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRelatorioDto,
  ) {
    return this.relatoriosService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.relatoriosService.remove(id);
  }
}
