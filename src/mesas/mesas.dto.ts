import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';

export class CreateMesaDto {
  @IsInt()
  @Min(1)
  numero: number;
}

export class UpdateMesaDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  numero?: number;

  @IsOptional()
  @IsBoolean()
  ocupada?: boolean;
}
