import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('mobile/models')
export class AimodelController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async getAllModels() {
    const models = await this.prisma.aiModel.findMany({
      where: {
        modelPath: { not: null as any },
      },
      select: {
        id: true,
        name: true,
        version: true,
        isActive: true,
        modelPath: true,
        labelsPath: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return models.map((model) => ({
      id: `model_${model.id}`,
      modelId: `model_${model.id}`,
      name: model.name,
      displayName: model.name,
      version: model.version,
      description: `${model.name} v${model.version}`,
      isDefault: model.isActive,
      isActive: model.isActive,
      modelPath: `/${model.modelPath}`,
      labelsPath: model.labelsPath ? `/${model.labelsPath}` : null,
      metadata: {
        dbId: model.id,
        createdAt: model.createdAt,
      },
    }));
  }

  @Get('active')
  async getActiveModel() {
    const model = await this.prisma.aiModel.findFirst({
      where: { isActive: true },
    });

    if (!model) {
      const latest = await this.prisma.aiModel.findFirst({
        orderBy: { createdAt: 'desc' },
      });

      if (!latest) {
        throw new NotFoundException('No models available');
      }

      return this._formatModelResponse(latest);
    }

    return this._formatModelResponse(model);
  }

  @Get(':id')
  async getModelById(@Param('id') id: string) {
    let model;

    const numericId = parseInt(id.replace('model_', ''));

    if (!isNaN(numericId)) {
      model = await this.prisma.aiModel.findUnique({
        where: { id: numericId },
      });
    } else {
      model = await this.prisma.aiModel.findFirst({
        where: {
          OR: [
            { name: { contains: id, mode: 'insensitive' } },
            { version: id },
          ],
        },
      });
    }

    if (!model) {
      throw new NotFoundException(`Model not found: ${id}`);
    }

    return this._formatModelResponse(model);
  }

  @Get('info/:id')
  async getModelInfo(@Param('id') id: string) {
    return this.getModelById(id);
  }

  private _formatModelResponse(model: any) {
    return {
      id: `model_${model.id}`,
      modelId: `model_${model.id}`,
      name: model.name,
      displayName: model.name,
      version: model.version,
      description: `${model.name} v${model.version}`,
      isDefault: model.isActive,
      isActive: model.isActive,
      modelPath: `/${model.modelPath}`,
      labelsPath: model.labelsPath ? `/${model.labelsPath}` : null,
      numClasses: null,
      inputSize: null,
      metadata: {
        dbId: model.id,
        createdAt: model.createdAt,
        updatedAt: model.updatedAt,
      },
    };
  }
}
