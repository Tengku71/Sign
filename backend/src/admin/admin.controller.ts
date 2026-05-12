import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Req,
  Res,
  Param,
  ParseIntPipe,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AdminService } from './admin.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Post('verify')
  async verifyCode(@Body('code') code: string, @Req() req: Request) {
    if (code !== process.env.VALIDATION_CODE) {
      throw new UnauthorizedException('Invalid code');
    }
    req.session['canRegister'] = true;
    return { success: true };
  }

  @Post('register')
  async register(@Req() req: Request, @Body() dto: any) {
    if (!req.session['canRegister']) {
      throw new UnauthorizedException('Code verification required');
    }
    const admin = await this.adminService.register(dto);
    req.session['adminId'] = admin.id;
    delete req.session['canRegister'];
    return { success: true, data: admin };
  }

  @Post('login')
  async login(@Req() req: Request, @Body() dto: any) {
    const admin = await this.adminService.validateCredentials(
      dto.email,
      dto.password,
    );
    req.session['adminId'] = admin.id;
    return { success: true };
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    req.session.destroy(() => {});
    res.send({ success: true });
  }

  @Get('me')
  async getMe(@Req() req: Request) {
    const adminId = req.session['adminId'];
    if (!adminId) throw new UnauthorizedException();
    return this.adminService.getProfile(adminId);
  }

  @Post('users')
  async createUser(@Req() req: Request, @Body() dto: CreateUserDto) {
    if (!req.session['adminId']) throw new UnauthorizedException();
    return this.adminService.createUser(dto);
  }

  @Get('users')
  async getAllUsers(@Req() req: Request) {
    if (!req.session['adminId']) throw new UnauthorizedException();
    return this.adminService.getAllUsers();
  }

  @Get('users/:id')
  async getUser(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    if (!req.session['adminId']) throw new UnauthorizedException();
    return this.adminService.getUserById(id);
  }

  @Patch('users/:id')
  async updateUser(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ) {
    if (!req.session['adminId']) throw new UnauthorizedException();
    return this.adminService.updateUser(id, dto);
  }

  @Delete('users/:id')
  async deleteUser(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    if (!req.session['adminId']) throw new UnauthorizedException();
    return this.adminService.deleteUser(id);
  }
}
