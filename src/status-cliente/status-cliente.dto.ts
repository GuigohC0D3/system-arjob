import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateStatusClienteDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  nome: string;
}

export class UpdateStatusClienteDto extends CreateStatusClienteDto {}
