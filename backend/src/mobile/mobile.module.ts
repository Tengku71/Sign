import { Module } from '@nestjs/common';
import { MobileService } from './mobile.service';
import { MobileController } from './mobile.controller';
import { MateriController } from './materi/materi.controller';
import { MateriService } from './materi/materi.service';
import { TrialResultsModule } from './trial-results/trial-results.module';

@Module({
  controllers: [MobileController, MateriController],
  providers: [MobileService, MateriService],
  imports: [TrialResultsModule],
})
export class MobileModule {}
