import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { ConfigModule } from '@nestjs/config';
import { MateriModule } from './admin/materi/materi.module';
import { FolderModule } from './admin/materi/folder/folder.module';
import { MobileService } from './mobile/mobile.service';
import { MobileController } from './mobile/mobile.controller';
import { MobileModule } from './mobile/mobile.module';
import { TrialResultsModule } from './mobile/trial-results/trial-results.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    AdminModule,
    MateriModule,
    FolderModule,
    MobileModule,
    TrialResultsModule,
  ],
  controllers: [AppController, MobileController],
  providers: [AppService, PrismaService, MobileService],
})
export class AppModule {}
