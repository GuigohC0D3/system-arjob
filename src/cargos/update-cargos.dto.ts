import { PartialType } from '@nestjs/mapped-types';
import { CreateCargoDto } from './create-cargos.dto';

export class UpdateCargoDto extends PartialType(CreateCargoDto) {}
