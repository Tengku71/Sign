import { Module } from '@nestjs/common';
import { MobileService } from './mobile.service';
import { MobileController } from './mobile.controller';
import { TrialResultsModule } from './trial-results/trial-results.module';
import { DailyTrialModule } from './daily-trial/daily-trial.module';
import { MateriModule } from './materi/materi.module';
import { ModelController } from './model/model.controller';
import { ModelModule } from './model/model.module';

@Module({
  controllers: [MobileController, ModelController],
  providers: [MobileService],
  imports: [
    TrialResultsModule,
    DailyTrialModule,
    MateriModule,
    ModelModule,
    MobileModule,
  ],
})
export class MobileModule {}
