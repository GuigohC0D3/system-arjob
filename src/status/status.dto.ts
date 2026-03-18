import { IsString, MinLength } from 'class-validator';

export class CreateStatusDto {
  @IsString()
  @MinLength(2)
  nome: string;
}

export class UpdateStatusDto {
  @IsString()
  @MinLength(2)
  nome: string;
}
