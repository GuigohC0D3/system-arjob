import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateTipoPagamentoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  nome: string;
}

export class UpdateTipoPagamentoDto extends CreateTipoPagamentoDto {}
