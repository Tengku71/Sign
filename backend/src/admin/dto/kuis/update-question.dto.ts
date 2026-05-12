import { IsArray, IsOptional, IsInt } from 'class-validator';

export class UpdateQuestionDto {
  @IsOptional()
  @IsArray()
  options?: string[];

  @IsOptional()
  @IsInt()
  modeId?: number;
}
