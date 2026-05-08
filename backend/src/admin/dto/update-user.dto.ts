import {
  IsEmail,
  IsOptional,
  IsBoolean,
  IsInt,
  MinLength,
} from 'class-validator';

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
  @IsInt()
  Level?: number;

  @IsOptional()
  @IsInt()
  scores?: number;

  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;
}
