import { Module } from '@nestjs/common';
import { TiposPagamentoController } from './tipos-pagamento.controller';
import { TiposPagamentoService } from './tipos-pagamento.service';

@Module({
  controllers: [TiposPagamentoController],
  providers: [TiposPagamentoService],
})
export class TiposPagamentoModule {}
