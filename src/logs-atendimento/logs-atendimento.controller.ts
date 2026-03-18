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
  CreateLogAtendimentoDto,
  UpdateLogAtendimentoDto,
} from './logs-atendimento.dto';
import { LogsAtendimentoService } from './logs-atendimento.service';

@UseGuards(JwtAuthGuard)
@Controller('logs-atendimento')
export class LogsAtendimentoController {
  constructor(
    private readonly logsAtendimentoService: LogsAtendimentoService,
  ) {}

  @Post()
  create(@Body() dto: CreateLogAtendimentoDto) {
    return this.logsAtendimentoService.create(dto);
  }

  @Get()
  findAll() {
    return this.logsAtendimentoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.logsAtendimentoService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLogAtendimentoDto,
  ) {
    return this.logsAtendimentoService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.logsAtendimentoService.remove(id);
  }
}
