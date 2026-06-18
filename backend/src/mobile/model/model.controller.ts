import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('mobile/models')
export class ModelController {
  // private readonly logger = new Logger(ModelController.name);

  constructor(private prisma: PrismaService) {}

  @Get()
  async getAllModels() {
    try {
      // this.logger.log('📋 Fetching all models...');

      const models = await this.prisma.aiModel.findMany({
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

      // this.logger.log(`Found ${models.length} raw models`);

      const validModels = models.filter(
        (model) =>
          model.modelPath !== null &&
          model.modelPath !== undefined &&
          model.name !== null &&
          model.name !== '',
      );

      // this.logger.log(`Returning ${validModels.length} valid models`);

      return validModels.map((model) => ({
        id: `model_${model.id}`,
        modelId: `model_${model.id}`,
        name: model.name || 'Unnamed Model',
        displayName: model.name || 'Unnamed Model',
        version: String(model.version ?? '1.0'),
        description: `${model.name || 'Model'} v${model.version || '1.0'}`,
        isDefault: Boolean(model.isActive),
        isActive: Boolean(model.isActive),
        modelPath: model.modelPath ? `/${model.modelPath}` : null,
        labelsPath: model.labelsPath ? `/${model.labelsPath}` : null,
        metadata: {
          dbId: model.id,
          createdAt: model.createdAt?.toISOString() || new Date().toISOString(),
        },
      }));
    } catch (error) {
      // this.logger.error('❌ Error in getAllModels:', error.stack || error);
      return [];
    }
  }
  @Get('active')
  async getActiveModel() {
    try {
      // this.logger.log('🎯 Fetching active model...');

      // ✅ FIX: Use proper interface or let TS infer
      let model = null as AiModelData | null; // <-- Proper typed variable!

      try {
        const activeModels = await this.prisma.aiModel.findMany({
          where: {
            isActive: true,
          },
          take: 1,
        });

        model = activeModels[0] || null;
        // this.logger.log(`Active model found: ${model?.name ?? 'none'}`);
      } catch (err) {
        // this.logger.warn(
        //   'Could not query isActive, trying fallback...',
        //   err.message,
        // );
      }

      if (!model) {
        // this.logger.log('No active model, fetching latest...');

        const latestModels = await this.prisma.aiModel.findMany({
          take: 1,
          orderBy: { createdAt: 'desc' },
        });

        model = latestModels[0] || null;
      }

      if (!model) {
        // this.logger.warn('❌ No models in database!');
        throw new NotFoundException(
          'No AI models available. Please upload models via admin panel.',
        );
      }

      // this.logger.log(`✅ Returning: ${model.name} v${model.version}`);
      return this._formatModelResponse(model);
    } catch (error) {
      // this.logger.error('❌ Error in getActiveModel:', error.stack || error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new NotFoundException();
      // error.message || 'Failed to fetch active model',
    }
  }
  @Get(':id')
  async getModelById(@Param('id') id: string) {
    try {
      // this.logger.log(`🔍 Looking up model: ${id}`);

      let model = null as AiModelData | null;

      const numericId = parseInt(String(id).replace('model_', ''));

      if (!isNaN(numericId)) {
        model = await this.prisma.aiModel.findUnique({
          where: { id: numericId },
        });
      }

      if (!model) {
        model = await this.prisma.aiModel.findFirst({
          where: {
            OR: [
              { name: { equals: String(id), mode: 'insensitive' } },
              { version: { equals: String(id) } },
            ],
          },
        });
      }

      if (!model) {
        throw new NotFoundException(`Model "${id}" not found`);
      }

      return this._formatModelResponse(model);
    } catch (error) {
      // this.logger.error(`Error fetching model ${id}:`, error.stack || error);

      if (error instanceof NotFoundException) throw error;

      // throw new NotFoundException(error.message || 'Model not found');
    }
  }

  @Get('info/:id')
  async getModelInfo(@Param('id') id: string) {
    return this.getModelById(id);
  }

  private _formatModelResponse(model: AiModelData) {
    return {
      id: `model_${model.id}`,
      modelId: `model_${model.id}`,
      name: model.name || 'Unknown Model',
      displayName: model.name || 'Unknown Model',
      version: String(model.version ?? '1.0'),
      description: `${model.name || 'Model'} v${model.version || '1.0'}`,
      isDefault: Boolean(model.isActive),
      isActive: Boolean(model.isActive),
      modelPath: model.modelPath ? `/${model.modelPath}` : null,
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

interface AiModelData {
  id: number;
  name: string;
  version: string;
  modelPath: string;
  labelsPath: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
