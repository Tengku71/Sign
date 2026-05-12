import { Module } from '@nestjs/common';
import { KuisController } from './kuis.controller';
import { KuisService } from './kuis.service';

@Module({
  controllers: [KuisController],
  providers: [KuisService],
})
export class KuisModule {}
