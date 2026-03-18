import { Module } from '@nestjs/common';
import { LogsAtendimentoController } from './logs-atendimento.controller';
import { LogsAtendimentoService } from './logs-atendimento.service';

@Module({
  controllers: [LogsAtendimentoController],
  providers: [LogsAtendimentoService],
})
export class LogsAtendimentoModule {}
