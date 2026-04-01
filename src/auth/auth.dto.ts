import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @MaxLength(100)
  nome: string;

  @IsEmail()
  @MaxLength(150)
  email: string;

  @IsString()
  @MaxLength(14)
  cpf: string;

  @IsString()
  @MinLength(8)
  senha: string;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;

  @IsOptional()
  @IsInt()
  statusId?: number;

  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  cargoIds: number[];
}

export class LoginDto {
  @IsString()
  cpf: string;

  @IsString()
  senha: string;
}

export class LogoutDto {
  @IsOptional()
  @IsString()
  token?: string;
}
