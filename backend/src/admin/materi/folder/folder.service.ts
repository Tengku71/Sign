import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FolderService {
  constructor(private prisma: PrismaService) {}

  async create(name: string) {
    const existing = await this.prisma.folder.findFirst({ where: { name } });
    if (existing)
      throw new ConflictException(`Folder "${name}" already exists`);
    const dirPath = path.join(
      process.cwd(),
      'uploads',
      'materi',
      'videos',
      name,
    );
    fs.mkdirSync(dirPath, { recursive: true });
    return this.prisma.folder.create({ data: { name } });
  }

  async findAll() {
    return this.prisma.folder.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async delete(id: number) {
    const folder = await this.prisma.folder.findUnique({
      where: { id },
      include: { materi: true },
    });

    if (!folder) throw new NotFoundException('Folder not found');

    for (const video of folder.materi) {
      const filePath = path.join(process.cwd(), video.path);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

      const dirPath = path.join(process.cwd(), 'uploads', 'videos', String(id));
      if (fs.existsSync(dirPath))
        fs.rmSync(dirPath, { recursive: true, force: true });
    }

    await this.prisma.folder.delete({ where: { id } });
    return { message: 'Folder and its contents deleted successfully' };
  }
}
