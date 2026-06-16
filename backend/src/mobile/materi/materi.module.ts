import { Module } from '@nestjs/common';
import { MateriController } from './materi.controller';
import { MateriService } from './materi.service';

@Module({
  providers: [MateriService],
  controllers: [MateriService],
  exports: [MateriController],
})
export class MateriModule {}
