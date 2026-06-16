import { Module } from '@nestjs/common';
import { DailyTrialService } from './daily-trial.service';
import { DailyTrialController } from './daily-trial.controller';

@Module({
  controllers: [DailyTrialController],
  providers: [DailyTrialService],
  exports: [DailyTrialService],
})
export class DailyTrialModule {}
