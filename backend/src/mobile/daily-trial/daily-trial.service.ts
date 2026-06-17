// src/daily-trial/daily-trial.service.ts
import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDailyTrialDto } from '../dto/create-daily-trial.dto';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';

@Injectable()
export class DailyTrialService {
  constructor(private readonly prisma: PrismaService) {}

  private getJakartaDay(date: Date | string) {
    const zonedDate = toZonedTime(date, 'Asia/Jakarta');

    zonedDate.setHours(0, 0, 0, 0);

    return fromZonedTime(zonedDate, 'Asia/Jakarta');
  }

  async saveResult(userId: number, dto: CreateDailyTrialDto) {
    const today = this.getJakartaDay(new Date());

    // 1. Check if already completed today
    const existingTrial = await this.prisma.dailyTrial.findUnique({
      where: { userId_date: { userId, date: today } },
    });

    if (existingTrial) {
      // User is replaying the trial today. Update stats but don't touch the streak.
      return this.prisma.dailyTrial.update({
        where: { id: existingTrial.id },
        data: {
          correct: dto.correct,
          wrong: dto.wrong,
          total: dto.total,
        },
      });
    }

    // 2. Get User's current streak
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new ForbiddenException('User not found');

    let newStreak = 1; // Default to 1 (first time ever or after reset)

    // Find the last trial to check if it was yesterday
    const lastTrial = await this.prisma.dailyTrial.findFirst({
      where: { userId },
      orderBy: { date: 'desc' },
    });

    if (lastTrial) {
      const lastDate = this.getJakartaDay(lastTrial.date);

      const diffTime = today.getTime() - lastDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Consecutive day!
        newStreak = user.streak + 1;
      } else if (diffDays === 0) {
        // Same day edge case (shouldn't hit due to unique constraint, but safe fallback)
        newStreak = user.streak;
      } else {
        // Missed a day (diff > 1), reset to 1
        newStreak = 1;
      }
    }

    const newBestStreak = Math.max(newStreak, user.bestStreak);

    // 3. Save Trial and Update User's streak in a transaction
    const [trial] = await this.prisma.$transaction([
      this.prisma.dailyTrial.create({
        data: {
          userId,
          date: today,
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

    const today = this.getJakartaDay(new Date());

    const completedToday = await this.prisma.dailyTrial.findUnique({
      where: { userId_date: { userId, date: today } },
    });

    return {
      streak: user.streak,
      bestStreak: user.bestStreak,
      completedToday: !!completedToday,
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
