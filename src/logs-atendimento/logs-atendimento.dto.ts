import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateLogAtendimentoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  descricao: string;
}

export class UpdateLogAtendimentoDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  descricao?: string;
}
