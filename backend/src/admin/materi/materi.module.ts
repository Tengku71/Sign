import { Module } from '@nestjs/common';
import { MateriService } from './materi.service';
import { MateriController } from './materi.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { FolderService } from './folder/folder.service';
import { FolderController } from './folder/folder.controller';
import { FolderModule } from './folder/folder.module';

@Module({
  imports: [PrismaModule, JwtModule.register({}), FolderModule],
  controllers: [MateriController, FolderController],
  providers: [MateriService, FolderService],
})
export class MateriModule {}
