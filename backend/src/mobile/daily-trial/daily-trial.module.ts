import { Module } from '@nestjs/common';
import { DailyTrialService } from './daily-trial.service';

@Module({
  providers: [DailyTrialService]
})
export class DailyTrialModule {}
