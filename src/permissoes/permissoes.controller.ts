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
import { PermissoesService } from './permissoes.service';
import { CreatePermissoesDto } from './create-permissoes.dto';
import { UpdatePermissaoDto } from './update-permissao.dto';

@UseGuards(JwtAuthGuard)
@Controller('permissoes')
export class PermissoesController {
  constructor(private readonly permissoesService: PermissoesService) {}

  @Post()
  create(@Body() dto: CreatePermissoesDto) {
    return this.permissoesService.create(dto);
  }

  @Get()
  findAll() {
    return this.permissoesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.permissoesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePermissaoDto,
  ) {
    return this.permissoesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.permissoesService.remove(id);
  }
}
