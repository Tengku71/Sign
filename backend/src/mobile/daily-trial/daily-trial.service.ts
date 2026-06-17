import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDailyTrialDto } from '../dto/create-daily-trial.dto';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';

@Injectable()
export class DailyTrialService {
  constructor(private readonly prisma: PrismaService) {}

  private getJakartaDayStart(date: Date | string): Date {
    const jakartaDate = toZonedTime(date, 'Asia/Jakarta');

    jakartaDate.setHours(0, 0, 0, 0);

    return fromZonedTime(jakartaDate, 'Asia/Jakarta');
  }

  async saveResult(userId: number, dto: CreateDailyTrialDto) {
    const todayStart = this.getJakartaDayStart(new Date());

    const existingTrial = await this.prisma.dailyTrial.findUnique({
      where: { userId_date: { userId, date: todayStart } },
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
      const lastDate = this.getJakartaDayStart(lastTrial.date);

      const diffTime = todayStart.getTime() - lastDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        newStreak = user.streak + 1;
      } else if (diffDays === 0) {
        newStreak = user.streak;
      } else {
        newStreak = 1;
      }
    }

    const newBestStreak = Math.max(newStreak, user.bestStreak);

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
          bestStreak: newBestStreak,
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

    const todayStart = this.getJakartaDayStart(new Date());

    const todaysTrial = await this.prisma.dailyTrial.findUnique({
      where: { userId_date: { userId, date: todayStart } },
    });

    const lastTrial = await this.prisma.dailyTrial.findFirst({
      where: { userId },
      orderBy: { date: 'desc' },
      select: { date: true },
    });

    let effectiveStreak = user.streak;
    let streakStatus = 'active';

    if (lastTrial) {
      const lastPlayDate = this.getJakartaDayStart(lastTrial.date);
      const diffTime = todayStart.getTime() - lastPlayDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 1) {
        effectiveStreak = 0;
        streakStatus = 'broken';
      } else if (diffDays === 1 && !todaysTrial) {
        streakStatus = 'pending_today';
        effectiveStreak = user.streak;
      } else if (todaysTrial) {
        streakStatus = 'completed';
        effectiveStreak = user.streak;
      }
    }

    return {
      streak: effectiveStreak,
      bestStreak: user.bestStreak,
      completedToday: !!todaysTrial,
      streakStatus: streakStatus, // Helper for frontend
    };
  }

  async getLeaderboard() {
    return this.prisma.user.findMany({
      take: 20,
      orderBy: {
        streak: 'desc',
      },
      select: {
        id: true,
        name: true,
        image: true,
        streak: true,
      },
    });
  }
}
