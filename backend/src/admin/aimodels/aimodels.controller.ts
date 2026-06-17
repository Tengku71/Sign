import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  Body,
  UnauthorizedException,
  Get,
  Req,
  Patch,
  Param,
  ParseIntPipe,
  Delete,
  NotFoundException,
} from '@nestjs/common';

import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { promises as fs } from 'fs';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('admin/models')
export class AimodelController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async getModels(@Req() req) {
    if (!req.session['adminId']) throw new UnauthorizedException();

    return this.prisma.aiModel.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  @Patch(':id')
  async updateModel(
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    if (!req.session['adminId']) throw new UnauthorizedException();

    if (body.isActive) {
      await this.prisma.aiModel.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      });
    }

    return this.prisma.aiModel.update({
      where: { id },
      data: {
        name: body.name,
        version: body.version,
        isActive: body.isActive,
      },
    });
  }

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'model', maxCount: 1 },
        { name: 'labels', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: './uploads',
          filename: (_, file, cb) => {
            const unique = Date.now();
            cb(null, `${unique}${extname(file.originalname)}`);
          },
        }),
      },
    ),
  )
  async uploadModel(
    @Req() req,
    @UploadedFiles()
    files: {
      model?: Express.Multer.File[];
      labels?: Express.Multer.File[];
    },
    @Body() body: any,
  ) {
    if (!req.session['adminId']) throw new UnauthorizedException();

    const modelFile = files.model?.[0];
    const labelsFile = files.labels?.[0];

    return this.prisma.aiModel.create({
      data: {
        name: body.name,
        version: body.version,
        modelPath: `/uploads/${modelFile!.filename}`,
        labelsPath: labelsFile ? `/uploads/${labelsFile.filename}` : null,
        isActive: body.isActive === 'true',
      },
    });
  }

  @Delete(':id')
  async deleteModel(@Req() req, @Param('id', ParseIntPipe) id: number) {
    if (!req.session['adminId']) throw new UnauthorizedException();

    const model = await this.prisma.aiModel.findUnique({ where: { id } });
    if (!model) throw new NotFoundException('Model not found');

    try {
      if (model.modelPath) {
        await fs.unlink(
          join(process.cwd(), model.modelPath.replace(/^\/+/, '')),
        );
      }
      if (model.labelsPath) {
        await fs.unlink(
          join(process.cwd(), model.labelsPath.replace(/^\/+/, '')),
        );
      }
    } catch (err) {
      console.error('File delete error:', err);
    }

    return this.prisma.aiModel.delete({ where: { id } });
  }
}
