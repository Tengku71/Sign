import { Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MateriService {
  constructor(private prisma: PrismaService) {
    const uploadDir = path.join(process.cwd(), 'uploads/materi', 'videos');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
  }

  async create(
    file: Express.Multer.File,
    label: string,
    folderId?: number,
    folderName?: string,
  ) {
    const dbPath = folderName
      ? `/uploads/materi/videos/${folderName}/${file.filename}`
      : `/uploads/materi/videos/${file.filename}`;

    return this.prisma.materi.create({
      data: {
        label,
        path: dbPath,
        folderId: folderId || null,
      },
    });
  }

  async findAll(page: number = 1, limit: number = 6, folderId?: number) {
    const skip = (page - 1) * limit;

    const where = folderId ? { folderId } : {};

    const [data, total] = await Promise.all([
      this.prisma.materi.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.materi.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async delete(id: number) {
    const materi = await this.prisma.materi.findUnique({ where: { id } });
    if (!materi) throw new NotFoundException('Materi not found');

    const filePath = path.join(process.cwd(), materi.path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await this.prisma.materi.delete({ where: { id } });
    return { message: 'Materi deleted successfully' };
  }
}
