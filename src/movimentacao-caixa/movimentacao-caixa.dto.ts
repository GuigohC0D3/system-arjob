import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateMovimentacaoCaixaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  tipo: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  valor: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  descricao?: string;
}

export class UpdateMovimentacaoCaixaDto extends CreateMovimentacaoCaixaDto {}
