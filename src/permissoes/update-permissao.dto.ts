import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdatePermissaoDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nome?: string;
}
