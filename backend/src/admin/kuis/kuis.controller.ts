import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  Req,
  UnauthorizedException,
  ParseIntPipe,
} from '@nestjs/common';
import { KuisService } from './kuis.service';
import { CreateModeDto } from '../dto/kuis/create-mode.dto';
import { CreateQuestionDto } from '../dto/kuis/create-question.dto';
import { UpdateQuestionDto } from '../dto/kuis/update-question.dto';
import { Request } from 'express';

@Controller('kuis')
export class KuisController {
  constructor(private quizService: KuisService) {}

  @Post('modes')
  createMode(@Req() req: Request, @Body() dto: CreateModeDto) {
    if (!req.session['adminId']) throw new UnauthorizedException();
    return this.quizService.createMode(dto);
  }

  @Get('modes')
  getModes(@Req() req: Request) {
    if (!req.session['adminId']) throw new UnauthorizedException();
    return this.quizService.getAllModes();
  }

  @Patch('modes/:id')
  updateMode(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateModeDto,
  ) {
    if (!req.session['adminId']) throw new UnauthorizedException();
    return this.quizService.updateMode(id, dto);
  }

  @Post('questions')
  createQuestion(@Req() req: Request, @Body() dto: CreateQuestionDto) {
    if (!req.session['adminId']) throw new UnauthorizedException();
    return this.quizService.createQuestion(dto);
  }

  @Get('questions')
  getQuestions(
    @Req() req: Request,
    @Query('modeId', ParseIntPipe) modeId: number,
  ) {
    if (!req.session['adminId']) throw new UnauthorizedException();
    return this.quizService.getQuestionsByMode(modeId);
  }

  @Patch('questions/:id')
  updateQuestion(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateQuestionDto,
  ) {
    if (!req.session['adminId']) throw new UnauthorizedException();
    return this.quizService.updateQuestion(id, dto);
  }

  @Delete('questions/:id')
  deleteQuestion(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    if (!req.session['adminId']) throw new UnauthorizedException();
    return this.quizService.deleteQuestion(id);
  }
}
