import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AuthModule } from 'src/auth/auth.module';
import { MateriService } from './materi/materi.service';
import { MateriController } from './materi/materi.controller';
import { MateriModule } from './materi/materi.module';
import { KuisService } from './kuis/kuis.service';
import { KuisController } from './kuis/kuis.controller';
import { KuisModule } from './kuis/kuis.module';

@Module({
  imports: [AuthModule, MateriModule, KuisModule],
  controllers: [AdminController, MateriController, KuisController],
  providers: [AdminService, MateriService, KuisService],
})
export class AdminModule {}
