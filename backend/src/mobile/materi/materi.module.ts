import { Module } from '@nestjs/common';
import { MateriController } from './materi.controller';
import { MateriService } from './materi.service';

@Module({
  providers: [MateriService],
  controllers: [MateriController],
  exports: [MateriService],
})
export class MateriModule {}
