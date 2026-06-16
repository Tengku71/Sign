import { Module } from '@nestjs/common';
import { MobileService } from './mobile.service';
import { MobileController } from './mobile.controller';
import { TrialResultsModule } from './trial-results/trial-results.module';
import { DailyTrialModule } from './daily-trial/daily-trial.module';
import { MateriModule } from './materi/materi.module';

@Module({
  controllers: [MobileController],
  providers: [MobileService],
  imports: [TrialResultsModule, DailyTrialModule, MateriModule],
})
export class MobileModule {}
