import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('mobile/models')
export class ModelController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async getAllModels() {
    try {
      const models = await this.prisma.aiModel.findMany({
        where: {
          modelPath: {
            not: null as any, // or use: not: undefined
          },
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

      console.log(`📋 Found ${models.length} models in database`);

      return models.map((model) => ({
        id: `model_${model.id}`,
        modelId: `model_${model.id}`,
        name: model.name,
        displayName: model.name,
        version: model.version.toString(),
        description: `${model.name} v${model.version}`,
        isDefault: model.isActive,
        isActive: model.isActive,
        modelPath: `/${model.modelPath}`,
        labelsPath: model.labelsPath ? `/${model.labelsPath}` : null,
        metadata: {
          dbId: model.id,
          createdAt: model.createdAt.toISOString(),
        },
      }));
    } catch (error) {
      console.error('❌ Error fetching models:', error);
      throw error;
    }
  }

  @Get('active')
  async getActiveModel() {
    try {
      let model = await this.prisma.aiModel.findFirst({
        where: {
          isActive: true,
          modelPath: { not: null as any },
        },
      });

      if (!model) {
        console.log('⚠️ No active model found, using latest...');
        model = await this.prisma.aiModel.findFirst({
          where: {
            modelPath: { not: null as any },
          },
          orderBy: { createdAt: 'desc' },
        });
      }

      if (!model) {
        throw new NotFoundException('No models available in database');
      }

      console.log(`✅ Active model: ${model.name} v${model.version}`);

      return this._formatModelResponse(model);
    } catch (error) {
      console.error('❌ Error fetching active model:', error);
      throw error;
    }
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
            { name: { equals: id, mode: 'insensitive' } },
            { version: { equals: id } },
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
      version: model.version.toString(),
      description: `${model.name} v${model.version}`,
      isDefault: model.isActive,
      isActive: model.isActive,
      modelPath: `/${model.modelPath}`,
      labelsPath: model.labelsPath ? `/${model.labelsPath}` : null,
      numClasses: null,
      inputSize: null,
      metadata: {
        dbId: model.id,
        createdAt: model.createdAt?.toISOString(),
        updatedAt: model.updatedAt?.toISOString(),
      },
    };
  }
}
