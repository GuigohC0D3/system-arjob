import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCategoriaProdutoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nome: string;
}

export class UpdateCategoriaProdutoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nome: string;
}
