import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDailyTrialDto } from '../dto/create-daily-trial.dto';
import { format, parseISO } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';

@Injectable()
export class DailyTrialService {
  constructor(private readonly prisma: PrismaService) {}

  private getJakartaDayStart(date: Date): Date {
    const dateString = format(toZonedTime(date, 'Asia/Jakarta'), 'yyyy-MM-dd');

    const jakartaMidnight = parseISO(`${dateString}T00:00:00`);

    return fromZonedTime(jakartaMidnight, 'Asia/Jakarta');
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

    // Transaction
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

    const completedToday = !!todaysTrial;

    const lastTrial = await this.prisma.dailyTrial.findFirst({
      where: { userId },
      orderBy: { date: 'desc' },
      select: { date: true },
    });

    let currentStreak = user.streak;
    let streakStatus = 'active';

    if (lastTrial) {
      const lastPlayDate = this.getJakartaDayStart(lastTrial.date);
      const diffTime = todayStart.getTime() - lastPlayDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        streakStatus = 'completed';
        currentStreak = user.streak;
      } else if (diffDays === 1) {
        streakStatus = 'pending_today';
      } else {
        streakStatus = 'lost';
        currentStreak = 0;
      }
    } else {
      currentStreak = 0;
      streakStatus = 'none';
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
