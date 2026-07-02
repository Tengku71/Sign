// trial-results.service.ts
import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTrialResultDto } from '../dto/create-trial-result.dto';

@Injectable()
export class TrialResultsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, dto: CreateTrialResultDto) {
    try {
      // ✅ FIX: Explicitly DO NOT include id - let database auto-generate
      const result = await this.prisma.trialResult.create({
        data: {
          userId,
          materiId: dto.materiId,
          correct: dto.correct,
          wrong: dto.wrong,
          total: dto.total,
          completedAt: new Date(dto.completedAt),
          // ❌ DON'T add: id: xxx  <-- Let DB handle this!
        },
      });

      return result;
    } catch (error) {
      // ✅ Handle duplicate/unique constraint errors gracefully
      if (error.code === 'P2002') {
        // Unique constraint violation - try upsert instead
        console.warn('Duplicate detected, using upsert...');

        return this.prisma.trialResult.upsert({
          where: {
            // You need a unique identifier for upsert
            // Option A: Use composite unique key if you have one
            // Option B: Just create with new id by omitting id field
          },
          update: {
            correct: dto.correct,
            wrong: dto.wrong,
            total: dto.total,
            completedAt: new Date(dto.completedAt),
          },
          create: {
            userId,
            materiId: dto.materiId,
            correct: dto.correct,
            wrong: dto.wrong,
            total: dto.total,
            completedAt: new Date(dto.completedAt),
          },
        });
      }

      throw error;
    }
  }

  async findByUserAndMateri(userId: number, materiId: number) {
    return this.prisma.trialResult.findMany({
      where: { userId, materiId },
      orderBy: { completedAt: 'desc' },
    });
  }

  async findAllByUser(
    userId: number,
    page: number,
    limit: number,
    folderId?: number,
  ) {
    const skip = (page - 1) * limit;
    const where: any = { userId };

    if (folderId) {
      where.materi = { folderId: parseInt(folderId.toString()) };
    }

    const [data, total, agg] = await Promise.all([
      this.prisma.trialResult.findMany({
        where,
        orderBy: { completedAt: 'desc' },
        include: { materi: true },
        skip,
        take: limit,
      }),
      this.prisma.trialResult.count({ where }),
      this.prisma.trialResult.aggregate({
        where,
        _sum: { correct: true, wrong: true },
        _count: { _all: true },
      }),
    ]);

    const totalCorrect = agg._sum.correct || 0;
    const totalWrong = agg._sum.wrong || 0;
    const accuracy =
      totalCorrect + totalWrong > 0
        ? (totalCorrect / (totalCorrect + totalWrong)) * 100
        : 0;

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        totalTrials: agg._count._all,
        totalCorrect,
        totalWrong,
        accuracy,
      },
    };
  }
}
