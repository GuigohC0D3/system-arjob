import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateComandaProdutoDto {
  @IsInt()
  @Min(1)
  produtoId: number;

  @IsInt()
  @Min(1)
  quantidade: number;
}

export class CreateComandaItemDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  observacao?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateComandaProdutoDto)
  produtos: CreateComandaProdutoDto[];
}

export class CreateComandaDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  code?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  clienteId?: number;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(1, { each: true })
  mesaIds?: number[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateComandaItemDto)
  itens?: CreateComandaItemDto[];
}

export class UpdateComandaDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  clienteId?: number | null;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(1, { each: true })
  mesaIds?: number[];

  @IsOptional()
  @IsBoolean()
  fechar?: boolean;
}
