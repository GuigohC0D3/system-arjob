import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Permissions } from '../auth/permissions.decorator';
import { PermissionsGuard } from '../auth/permissions.guard';
import { UsersService } from './users.service';
import { UpdateUserStatusDto } from './users.dto';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Permissions('usuarios', 'usuario', 'users', 'user')
@Controller('users')
export class UsersController {
  constructor(private users: UsersService) {}

  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number) {
    return this.users.getUser(id);
  }

  @Patch(':id/status')
  changeStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserStatusDto,
  ) {
    return this.users.changeStatus(id, dto);
  }
}
