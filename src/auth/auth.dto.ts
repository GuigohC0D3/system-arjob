import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  nome: string;

  @IsEmail()
  email: string;

  @IsString()
  cpf: string;

  @IsString()
  @MinLength(8)
  senha: string;
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
