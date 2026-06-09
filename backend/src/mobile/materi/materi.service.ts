import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MateriService {
  constructor(private prisma: PrismaService) {}

  async getAll(
    page: number,
    limit: number,
    folderId?: number,
    search?: string,
    sort?: string,
  ) {
    const where: any = {};

    if (folderId !== undefined && folderId !== null && !isNaN(folderId)) {
      where.folderId = folderId;
    }

    if (search && search.trim()) {
      where.label = { contains: search.trim(), mode: 'insensitive' };
    }

    const orderBy: any = sort === 'za' ? { label: 'desc' } : { label: 'asc' };

    const [data, total] = await Promise.all([
      this.prisma.materi.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: { folder: true },
      }),
      this.prisma.materi.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getFolders() {
    return this.prisma.folder.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async getOne(id: number) {
    const materi = await this.prisma.materi.findUnique({
      where: { id },
      include: { folder: true },
    });
    if (!materi) throw new NotFoundException('Materi not found');
    return materi;
  }
}
