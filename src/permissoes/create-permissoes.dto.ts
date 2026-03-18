import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreatePermissoesDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nome: string;
}
