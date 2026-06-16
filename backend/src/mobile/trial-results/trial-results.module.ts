import { Module } from '@nestjs/common';
import { TrialResultsService } from './trial-results.service';
import { TrialResultsController } from './trial-results.controller';

@Module({
  providers: [TrialResultsService],
  controllers: [TrialResultsController],
  exports: [TrialResultsService],
})
export class TrialResultsModule {}
