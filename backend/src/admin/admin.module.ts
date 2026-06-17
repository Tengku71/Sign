import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AuthModule } from 'src/auth/auth.module';
import { MateriService } from './materi/materi.service';
import { MateriController } from './materi/materi.controller';
import { MateriModule } from './materi/materi.module';
import { AimodelController } from './aimodels/aimodels.controller';

@Module({
  imports: [AuthModule, MateriModule],
  controllers: [AdminController, MateriController, AimodelController],
  providers: [AdminService, MateriService],
})
export class AdminModule {}
