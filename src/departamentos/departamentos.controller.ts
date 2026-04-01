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
  CreateDepartamentoDto,
  UpdateDepartamentoDto,
  VincularClientesDepartamentoDto,
} from './departamentos.dto';
import { DepartamentosService } from './departamentos.service';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Permissions('departamentos', 'departamento')
@Controller('departamentos')
export class DepartamentosController {
  constructor(private readonly departamentosService: DepartamentosService) {}

  @Post()
  create(@Body() dto: CreateDepartamentoDto) {
    return this.departamentosService.create(dto);
  }

  @Get()
  findAll() {
    return this.departamentosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.departamentosService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDepartamentoDto,
  ) {
    return this.departamentosService.update(id, dto);
  }

  @Patch(':id/clientes')
  vincularClientes(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: VincularClientesDepartamentoDto,
  ) {
    return this.departamentosService.vincularClientes(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.departamentosService.remove(id);
  }
}
