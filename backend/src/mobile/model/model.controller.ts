// mobile-model.controller.ts
import { Controller, Get, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('mobile/models')
export class ModelController {
  constructor(private prisma: PrismaService) {}

  @Get('active')
  async getActiveModel() {
    const model = await this.prisma.aiModel.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      select: {
        version: true,
        modelPath: true,
        labelsPath: true,
      },
    });

    if (!model) throw new NotFoundException('No active model found');
    return model;
  }
}
