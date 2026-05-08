import { Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { Express } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MateriService {
  constructor(private prisma: PrismaService) {
    const uploadDir = path.join(process.cwd(), 'uploads/materi', 'videos');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
  }

  async create(file: Express.Multer.File, label: string) {
    const dbPath = `/uploads/materi/videos/${file.filename}`;

    return this.prisma.materi.create({
      data: {
        label,
        path: dbPath,
      },
    });
  }

  async findAll() {
    return this.prisma.materi.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async delete(id: number) {
    const materi = await this.prisma.materi.findUnique({ where: { id } });
    if (!materi) throw new NotFoundException('Materi not found');

    // Delete physical file from server
    const filePath = path.join(process.cwd(), materi.path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from database
    await this.prisma.materi.delete({ where: { id } });
    return { message: 'Materi deleted successfully' };
  }
}
