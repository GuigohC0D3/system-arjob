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
  CreateConvenioDto,
  UpdateConvenioDto,
  VincularClientesConvenioDto,
} from './convenios.dto';
import { ConveniosService } from './convenios.service';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Permissions('convenios', 'convenio')
@Controller('convenios')
export class ConveniosController {
  constructor(private readonly conveniosService: ConveniosService) {}

  @Post()
  create(@Body() dto: CreateConvenioDto) {
    return this.conveniosService.create(dto);
  }

  @Get()
  findAll() {
    return this.conveniosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.conveniosService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateConvenioDto,
  ) {
    return this.conveniosService.update(id, dto);
  }

  @Patch(':id/clientes')
  vincularClientes(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: VincularClientesConvenioDto,
  ) {
    return this.conveniosService.vincularClientes(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.conveniosService.remove(id);
  }
}
