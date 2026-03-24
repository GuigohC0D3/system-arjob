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
import {
  CreateStatusClienteDto,
  UpdateStatusClienteDto,
} from './status-cliente.dto';
import { StatusClienteService } from './status-cliente.service';

@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('status-cliente')
export class StatusClienteController {
  constructor(private readonly statusClienteService: StatusClienteService) {}

  @Post()
  create(@Body() dto: CreateStatusClienteDto) {
    return this.statusClienteService.create(dto);
  }

  @Get()
  findAll() {
    return this.statusClienteService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.statusClienteService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStatusClienteDto,
  ) {
    return this.statusClienteService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.statusClienteService.remove(id);
  }
}
