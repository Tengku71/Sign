import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Query,
} from '@nestjs/common';
import { TrialResultsService } from './trial-results.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateTrialResultDto } from '../dto/create-trial-result.dto';

@Controller('mobile/trial-results')
@UseGuards(JwtAuthGuard)
export class TrialResultsController {
  constructor(private readonly trialResultsService: TrialResultsService) {}

  @Post()
  async create(@Req() req, @Body() dto: CreateTrialResultDto) {
    const userId = req.user.id;
    return this.trialResultsService.create(userId, dto);
  }

  @Get()
  async findAll(
    @Req() req,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '5',
    @Query('folderId') folderId?: string,
  ) {
    return this.trialResultsService.findAllByUser(
      req.user.id,
      parseInt(page),
      parseInt(limit),
      folderId ? parseInt(folderId) : undefined,
    );
  }
}
