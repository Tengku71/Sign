import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AuthModule } from 'src/auth/auth.module';
import { MateriService } from './materi/materi.service';

@Module({
  imports: [AuthModule],
  controllers: [AdminController],
  providers: [AdminService, MateriService],
})
export class AdminModule {}
