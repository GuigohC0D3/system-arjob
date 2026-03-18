import { Module } from '@nestjs/common';
import { StatusClienteController } from './status-cliente.controller';
import { StatusClienteService } from './status-cliente.service';

@Module({
  controllers: [StatusClienteController],
  providers: [StatusClienteService],
})
export class StatusClienteModule {}
