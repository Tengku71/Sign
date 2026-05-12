import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateModeDto } from '../dto/kuis/create-mode.dto';
import { CreateQuestionDto } from '../dto/kuis/create-question.dto';
import { UpdateQuestionDto } from '../dto/kuis/update-question.dto';

@Injectable()
export class KuisService {
  constructor(private prisma: PrismaService) {}
  async createMode(dto: CreateModeDto) {
    const exists = await this.prisma.quizMode.findUnique({
      where: { name: dto.name },
    });
    if (exists) throw new ConflictException('Mode already exists');
    return this.prisma.quizMode.create({ data: dto });
  }

  async getAllModes() {
    return this.prisma.quizMode.findMany({ orderBy: { timeLimit: 'asc' } });
  }

  async updateMode(id: number, dto: CreateModeDto) {
    await this.prisma.quizMode.update({ where: { id }, data: dto });
    return { message: 'Mode updated' };
  }

  async createQuestion(dto: CreateQuestionDto) {
    const mode = await this.prisma.quizMode.findUnique({
      where: { id: dto.modeId },
    });
    if (!mode) throw new NotFoundException('Quiz mode not found');

    return this.prisma.question.create({
      data: {
        options: dto.options,
        modeId: dto.modeId,
      },
    });
  }

  async updateQuestion(id: number, dto: UpdateQuestionDto) {
    await this.prisma.question.findUniqueOrThrow({ where: { id } });
    return this.prisma.question.update({
      where: { id },
      data: dto,
    });
  }

  async getQuestionsByMode(modeId: number) {
    const mode = await this.prisma.quizMode.findUnique({
      where: { id: modeId },
    });
    if (!mode) throw new NotFoundException('Mode not found');

    return this.prisma.question.findMany({
      where: { modeId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteQuestion(id: number) {
    await this.prisma.question.delete({ where: { id } });
    return { message: 'Question deleted' };
  }
}
