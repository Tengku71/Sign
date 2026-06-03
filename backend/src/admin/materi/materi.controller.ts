import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Body,
  Query,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MateriService } from './materi.service';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { Request } from 'express';

@Controller('materi')
export class MateriController {
  constructor(private materiService: MateriService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('video', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const folderId = req.body.folderName;
          const dir = folderId
            ? path.join(
                process.cwd(),
                'uploads',
                'materi',
                'videos',
                String(folderId),
              )
            : path.join(process.cwd(), 'uploads', 'materi', 'videos');
          if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
          cb(null, dir);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = path.extname(file.originalname);
          cb(null, `${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('video/')) {
          cb(new BadRequestException('Only video files are allowed!'), false);
        } else {
          cb(null, true);
        }
      },
      limits: { fileSize: 100 * 1024 * 1024 },
    }),
  )
  async createMateri(
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File,
    @Body('label') label: string,
    @Body('folderId') folderId?: string,
    @Body('folderName') folderName?: string,
  ) {
    if (!req.session['adminId']) throw new UnauthorizedException();
    if (!file) throw new BadRequestException('Video file is required');
    if (!label) throw new BadRequestException('Label is required');

    const parsedFolderId = folderId ? +folderId : undefined;
    return this.materiService.create(file, label, parsedFolderId, folderName);
  }

  @Get()
  async getAllMateri(
    @Req() req: Request,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '6',
    @Query('folderId') folderId?: string,
    @Query('search') search?: string,
    @Query('sort') sort?: string,
  ) {
    if (!req.session['adminId']) throw new UnauthorizedException();

    const parsedFolderId =
      folderId && folderId.trim() !== '' && !isNaN(+folderId)
        ? +folderId
        : undefined;

    return this.materiService.findAll(
      +page,
      +limit,
      parsedFolderId,
      search,
      sort,
    );
  }

  @Delete(':id')
  async deleteMateri(@Req() req: Request, @Param('id') id: number) {
    if (!req.session['adminId']) throw new UnauthorizedException();
    return this.materiService.delete(+id);
  }
}
