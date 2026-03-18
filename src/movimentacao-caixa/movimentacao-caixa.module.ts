import { Module } from '@nestjs/common';
import { MovimentacaoCaixaController } from './movimentacao-caixa.controller';
import { MovimentacaoCaixaService } from './movimentacao-caixa.service';

@Module({
  controllers: [MovimentacaoCaixaController],
  providers: [MovimentacaoCaixaService],
})
export class MovimentacaoCaixaModule {}
