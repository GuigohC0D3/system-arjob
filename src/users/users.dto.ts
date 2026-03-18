import { IsInt } from 'class-validator';

export class UpdateUserStatusDto {
  @IsInt()
  statusId: number;
}
