import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDailyTrialDto } from '../dto/create-daily-trial.dto';
import { format, addHours } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';

@Injectable()
export class DailyTrialService {
  constructor(private readonly prisma: PrismaService) {}

  private getJakartaStart(date: Date): Date {
    const JAKARTA_OFFSET_MS = 7 * 60 * 60 * 1000;
    const jakartaMs = date.getTime() + JAKARTA_OFFSET_MS;
    const jakartaMidnightMs =
      Math.floor(jakartaMs / (86400 * 1000)) * (86400 * 1000);
    return new Date(jakartaMidnightMs - JAKARTA_OFFSET_MS);
  }

  async saveResult(userId: number, dto: CreateDailyTrialDto) {
    const todayStart = this.getJakartaStart(new Date());

    const tomorrowStart = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    const existingTrial = await this.prisma.dailyTrial.findFirst({
      where: {
        userId,
        date: {
          gte: todayStart,
          lt: tomorrowStart,
        },
      },
    });

    if (existingTrial) {
      return this.prisma.dailyTrial.update({
        where: { id: existingTrial.id },
        data: {
          correct: dto.correct,
          wrong: dto.wrong,
          total: dto.total,
          labels: dto.labels,
        },
      });
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new ForbiddenException('User not found');

    const lastTrial = await this.prisma.dailyTrial.findFirst({
      where: { userId },
      orderBy: { date: 'desc' },
    });

    let newStreak = 1;

    if (lastTrial) {
      const lastDate = this.getJakartaStart(lastTrial.date);
      const diffDays = Math.floor(
        (todayStart.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (diffDays === 1) newStreak = user.streak + 1;
      else if (diffDays === 0) newStreak = user.streak;
      else newStreak = 1;
    }

    const [trial] = await this.prisma.$transaction([
      this.prisma.dailyTrial.create({
        data: {
          userId,
          date: todayStart,
          correct: dto.correct,
          wrong: dto.wrong,
          total: dto.total,
          labels: dto.labels,
        },
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: {
          streak: newStreak,
          bestStreak: Math.max(newStreak, user.bestStreak),
        },
      }),
    ]);

    return trial;
  }

  async getStreakStatus(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { streak: true, bestStreak: true },
    });

    if (!user) throw new ForbiddenException('User not found');

    const now = new Date();
    const todayStart = this.getJakartaStart(now);
    const tomorrowStart = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    const todaysTrial = await this.prisma.dailyTrial.findFirst({
      where: {
        userId,
        date: {
          gte: todayStart,
          lt: tomorrowStart,
        },
      },
    });

    const completedToday = !!todaysTrial;

    const lastTrial = await this.prisma.dailyTrial.findFirst({
      where: { userId },
      orderBy: { date: 'desc' },
      select: { date: true },
    });

    let currentStreak = user.streak;
    let streakStatus = 'none';

    if (lastTrial) {
      const lastPlayDate = this.getJakartaStart(lastTrial.date);
      const diffMs = todayStart.getTime() - lastPlayDate.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (completedToday) {
        streakStatus = 'completed';
        currentStreak = user.streak;
      } else if (diffDays === 1) {
        streakStatus = 'pending_today';
        currentStreak = user.streak;
      } else if (diffDays > 1) {
        streakStatus = 'lost';
        currentStreak = 0;
        await this.prisma.user.update({
          where: { id: userId },
          data: { streak: 0 },
        });
      }
    }

    return {
      streak: currentStreak,
      bestStreak: user.bestStreak,
      completedToday: completedToday,
      streakStatus: streakStatus,
    };
  }

  async getLeaderboard() {
    return this.prisma.user.findMany({
      take: 20,
      orderBy: { streak: 'desc' },
      select: { id: true, name: true, image: true, streak: true },
    });
  }
}
