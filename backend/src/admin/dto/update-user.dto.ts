import { IsEmail, IsOptional, IsBoolean, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @MinLength(8)
  password?: string;

  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;
}
