// src/daily-trial/daily-trial.controller.ts
import { Controller, Post, Get, Body, UseGuards, Req } from '@nestjs/common';
import { DailyTrialService } from './daily-trial.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateDailyTrialDto } from '../dto/create-daily-trial.dto';

@Controller('mobile/daily-trial')
@UseGuards(JwtAuthGuard)
export class DailyTrialController {
  constructor(private readonly dailyTrialService: DailyTrialService) {}

  @Post()
  async saveTrialResult(@Req() req: any, @Body() dto: CreateDailyTrialDto) {
    return this.dailyTrialService.saveResult(req.user.id, dto);
  }

  @Get('status')
  async getStreakStatus(@Req() req: any) {
    return this.dailyTrialService.getStreakStatus(req.user.id);
  }
}
