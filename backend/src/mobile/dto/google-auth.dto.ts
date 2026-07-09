import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GoogleLoginDto {
  @IsString()
  @IsNotEmpty()
  idToken!: string;

  @IsString()
  @IsOptional()
  accessToken?: string;
}

export class GoogleRegisterDto {
  @IsString()
  @IsNotEmpty()
  idToken!: string;

  @IsString()
  @IsOptional()
  accessToken?: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;
}
