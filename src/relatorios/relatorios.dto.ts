import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateRelatorioDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nome: string;
}

export class UpdateRelatorioDto extends CreateRelatorioDto {}
