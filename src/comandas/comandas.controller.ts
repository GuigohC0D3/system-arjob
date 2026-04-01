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
import { ComandasService } from './comandas.service';
import { CreateComandaDto, UpdateComandaDto } from './comandas.dto';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Permissions('comandas', 'comanda')
@Controller('comandas')
export class ComandasController {
  constructor(private readonly comandasService: ComandasService) {}

  @Post()
  create(@Body() dto: CreateComandaDto) {
    return this.comandasService.create(dto);
  }

  @Get()
  findAll() {
    return this.comandasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.comandasService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateComandaDto) {
    return this.comandasService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.comandasService.remove(id);
  }
}
