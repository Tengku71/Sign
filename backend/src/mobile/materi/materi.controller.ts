import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { MateriService } from './materi.service';

@Controller('mobile/materi')
@UseGuards(JwtAuthGuard)
export class MateriController {
  constructor(private readonly MateriService: MateriService) {}

  @Get()
  async getAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('folderId') folderId?: string,
    @Query('search') search?: string,
    @Query('sort') sort?: string,
  ) {
    const parsedFolderId =
      folderId && folderId.trim() !== '' && !isNaN(+folderId)
        ? +folderId
        : undefined;

    return this.MateriService.getAll(
      +page,
      +limit,
      parsedFolderId,
      search,
      sort,
    );
  }

  @Get('folders')
  async getFolders() {
    return this.MateriService.getFolders();
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.MateriService.getOne(+id);
  }
}
