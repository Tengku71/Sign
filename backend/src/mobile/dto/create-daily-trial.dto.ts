import { IsArray, IsInt, IsString, Min, IsDateString } from 'class-validator';

export class CreateDailyTrialDto {
  @IsInt()
  @Min(0)
  correct!: number;

  @IsInt()
  @Min(0)
  wrong!: number;

  @IsInt()
  @Min(1)
  total!: number;

  @IsArray()
  @IsString({ each: true })
  labels!: string[];

  @IsDateString()
  date!: string; // Expects 'YYYY-MM-DD'
}
