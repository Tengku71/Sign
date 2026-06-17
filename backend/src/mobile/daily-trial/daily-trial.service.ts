import { Injectable, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDailyTrialDto } from '../dto/create-daily-trial.dto';
import { format, parseISO } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';

@Injectable()
export class DailyTrialService {
  private readonly logger = new Logger(DailyTrialService.name);

  constructor(private readonly prisma: PrismaService) {}

  private getStrictJakartaDay(dateInput: Date): Date {
    const zonedDate = toZonedTime(dateInput, 'Asia/Jakarta');

    const dateString = format(zonedDate, 'yyyy-MM-dd');

    const parsedDate = parseISO(`${dateString}T00:00:00`);

    const finalDate = fromZonedTime(parsedDate, 'Asia/Jakarta');

    // this.logger.debug(
    //   `Input: ${dateInput.toISOString()} -> Calculated Day: ${finalDate.toISOString()}`,
    // );

    return finalDate;
  }

  async getStreakStatus(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { streak: true, bestStreak: true },
    });

    if (!user) throw new ForbiddenException('User not found');

    const todayStart = this.getStrictJakartaDay(new Date());

    const todaysTrial = await this.prisma.dailyTrial.findUnique({
      where: { userId_date: { userId, date: todayStart } },
    });

    const isCompletedToday = !!todaysTrial;

    let currentStreak = user.streak;
    let streakStatus = 'none';
    const lastTrial = await this.prisma.dailyTrial.findFirst({
      where: { userId },
      orderBy: { date: 'desc' },
      select: { date: true },
    });

    if (lastTrial) {
      const lastPlayDate = this.getStrictJakartaDay(lastTrial.date);

      const diffMs = todayStart.getTime() - lastPlayDate.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (isCompletedToday) {
        streakStatus = 'completed';
        currentStreak = user.streak;
      } else if (diffDays === 1) {
        streakStatus = 'pending_today';
        currentStreak = user.streak;
      } else if (diffDays > 1) {
        streakStatus = 'lost';
        currentStreak = 0;
      } else {
        streakStatus = 'active';
      }
    }

    return {
      streak: currentStreak,
      bestStreak: user.bestStreak,
      completedToday: isCompletedToday,
      streakStatus: streakStatus,
    };
  }

  async saveResult(userId: number, dto: CreateDailyTrialDto) {
    const todayStart = this.getStrictJakartaDay(new Date());
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
      const lastDate = this.getStrictJakartaDay(lastTrial.date); // Strict method
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

  async getLeaderboard() {
    return this.prisma.user.findMany({
      take: 20,
      orderBy: { streak: 'desc' },
      select: { id: true, name: true, image: true, streak: true },
    });
  }
}
