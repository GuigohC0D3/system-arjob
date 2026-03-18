import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateDepartamentoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nome: string;
}

export class UpdateDepartamentoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nome: string;
}

export class VincularClientesDepartamentoDto {
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  clienteIds: number[];
}
