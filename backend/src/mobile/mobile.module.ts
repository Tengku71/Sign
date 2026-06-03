import { Module } from '@nestjs/common';
import { MobileService } from './mobile.service';
import { MobileController } from './mobile.controller';
import { MateriController } from './materi/materi.controller';
import { MateriService } from './materi/materi.service';

@Module({
  controllers: [MobileController, MateriController],
  providers: [MobileService, MateriService],
})
export class MobileModule {}
