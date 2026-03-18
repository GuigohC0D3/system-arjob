import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateConvenioDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nome: string;
}

export class UpdateConvenioDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nome: string;
}

export class VincularClientesConvenioDto {
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  clienteIds: number[];
}
