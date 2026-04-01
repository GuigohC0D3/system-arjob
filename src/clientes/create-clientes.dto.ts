import {
  IsEmail,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateClienteDto {
  @IsString()
  @MaxLength(100)
  nome: string;

  @IsOptional()
  @IsString()
  @MaxLength(14)
  cpf?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(150)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  @IsInt()
  statusId?: number;

  @IsOptional()
  @IsNumber()
  saldo?: number;

  @IsOptional()
  @IsNumber()
  limite?: number;

  @IsOptional()
  @IsNumber()
  consumido?: number;

  @IsOptional()
  @IsBoolean()
  bloqueado?: boolean;

  @IsOptional()
  @IsInt()
  matricula?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  convenio?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  filial?: string;
}
