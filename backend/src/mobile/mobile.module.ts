import { Module } from '@nestjs/common';
import { MobileService } from './mobile.service';
import { MobileController } from './mobile.controller';
import { MateriController } from './materi/materi.controller';
import { MateriService } from './materi/materi.service';
import { TrialResultsModule } from './trial-results/trial-results.module';
import { DailyTrialController } from './daily-trial/daily-trial.controller';
import { DailyTrialModule } from './daily-trial/daily-trial.module';

@Module({
  controllers: [MobileController, MateriController, DailyTrialController],
  providers: [MobileService, MateriService],
  imports: [TrialResultsModule, DailyTrialModule],
})
export class MobileModule {}
