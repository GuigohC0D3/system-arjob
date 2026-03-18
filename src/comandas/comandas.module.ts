import { Module } from '@nestjs/common';
import { ComandasService } from './comandas.service';
import { ComandasController } from './comandas.controller';

@Module({
  providers: [ComandasService],
  controllers: [ComandasController],
})
export class ComandasModule {}
