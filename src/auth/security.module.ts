import { Global, Module } from '@nestjs/common';
import { AdminGuard } from './admin.guard';
import { PermissionsGuard } from './permissions.guard';

@Global()
@Module({
  providers: [AdminGuard, PermissionsGuard],
  exports: [AdminGuard, PermissionsGuard],
})
export class SecurityModule {}
