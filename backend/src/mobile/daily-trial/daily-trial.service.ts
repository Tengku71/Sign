import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDailyTrialDto } from '../dto/create-daily-trial.dto';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

@Injectable()
export class DailyTrialService {
  constructor(private readonly prisma: PrismaService) {}

  private getJakartaDateString(date: Date): string {
    return format(toZonedTime(date, 'Asia/Jakarta'), 'yyyy-MM-dd');
  }

  private diffDaysFromStrings(a: string, b: string): number {
    const dateA = new Date(a + 'T00:00:00.000Z');
    const dateB = new Date(b + 'T00:00:00.000Z');
    return Math.floor((dateA.getTime() - dateB.getTime()) / (86400 * 1000));
  }

  async saveResult(userId: number, dto: CreateDailyTrialDto) {
    const todayString = this.getJakartaDateString(new Date());

    const existingTrial = await this.prisma.dailyTrial.findFirst({
      where: { userId, date: todayString },
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
      select: { date: true },
    });

    let newStreak = 1;

    if (lastTrial) {
      const diffDays = this.diffDaysFromStrings(
        todayString,
        lastTrial.date as unknown as string,
      );

      if (diffDays === 1) newStreak = user.streak + 1;
      else if (diffDays === 0) newStreak = user.streak;
      else newStreak = 1;
    }

    const [trial] = await this.prisma.$transaction([
      this.prisma.dailyTrial.create({
        data: {
          userId,
          date: todayString,
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

    const todayString = this.getJakartaDateString(new Date());

    const todaysTrial = await this.prisma.dailyTrial.findFirst({
      where: { userId, date: todayString },
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
      const diffDays = this.diffDaysFromStrings(
        todayString,
        lastTrial.date as unknown as string,
      );

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
      completedToday,
      streakStatus,
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
