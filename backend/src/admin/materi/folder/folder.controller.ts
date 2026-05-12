import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { FolderService } from './folder.service';
import { CreateFolderDto } from 'src/admin/dto/materi/create-folder.dto';
import { Request } from 'express';

@Controller('folders')
export class FolderController {
  constructor(private folderService: FolderService) {}

  @Post()
  async create(@Req() req: Request, @Body() dto: CreateFolderDto) {
    if (!req.session['adminId']) throw new UnauthorizedException();
    return this.folderService.create(dto.name);
  }

  @Get()
  async findAll(@Req() req: Request) {
    if (!req.session['adminId']) throw new UnauthorizedException();
    return this.folderService.findAll();
  }

  @Delete(':id')
  async delete(@Req() req: Request, @Param('id') id: number) {
    if (!req.session['adminId']) throw new UnauthorizedException();
    return this.folderService.delete(+id);
  }
}
